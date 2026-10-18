import type { AdminAppointment, AppointmentStatus } from '../types';

// Traduz o status do banco para um texto amigável
export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: 'Aguardando pagamento',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
};

// Precisa ser igual ao PENDING_LIMIT_MINUTES do cron no backend
export const PENDING_LIMIT_MINUTES = 10;

// Quanto MENOR o número, mais acima na lista
const STATUS_PRIORITY: Record<AppointmentStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  CANCELLED: 2,
};

export function sortAppointments(list: AdminAppointment[]): AdminAppointment[] {
  // [...list] cria uma cópia: o sort altera o array original,
  // e não queremos mexer nos dados guardados pelo React Query
  return [...list].sort((a, b) => {
    // 1º critério: o grupo (pendentes, depois confirmadas, depois canceladas)
    const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (byStatus !== 0) return byStatus;

    const createdA = new Date(a.createdAt).getTime();
    const createdB = new Date(b.createdAt).getTime();
    const startA = new Date(a.startTime).getTime();
    const startB = new Date(b.startTime).getTime();

    // Pendentes: a criada há mais tempo é a que expira primeiro -> vem antes
    if (a.status === 'PENDING') return createdA - createdB;

    // Confirmadas: o atendimento mais próximo primeiro
    if (a.status === 'CONFIRMED') return startA - startB;

    // Canceladas: as mais recentes primeiro
    return startB - startA;
  });
}

// Quantos minutos faltam para a reserva pendente expirar (nunca negativo)
export function minutesToExpire(createdAt: string, now: number): number {
  const expiresAt = new Date(createdAt).getTime() + PENDING_LIMIT_MINUTES * 60_000;
  // ceil arredonda para cima: com 30s restantes, mostra "1 min" e não "0 min"
  return Math.max(0, Math.ceil((expiresAt - now) / 60_000));
}