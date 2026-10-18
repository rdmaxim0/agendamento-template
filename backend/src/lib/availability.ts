import { prisma } from '../server.js';
import { startOfDay, endOfDay, parseISO, setHours, setMinutes, isBefore, isAfter, addMinutes } from 'date-fns';

export async function getAvailableSlots(dateString: string, serviceDuration: number) {
  const date = parseISO(dateString);
  
  // CONFIGURAÇÕES DO ESTABELECIMENTO
  const workStartHour = 9;   // Abre às 09:00
  const workEndHour = 19;    // Fecha às 19:00
  const lunchStartHour = 12; // Início do almoço
  const lunchEndHour = 13;   // Fim do almoço
  const intervalMinutes = 30; // Mostrar horários a cada 30 min (09:00, 09:30, 10:00)

  // Busca os agendamentos do dia que NÃO estão cancelados
  const appointments = await prisma.appointment.findMany({
    where: {
      startTime: { gte: startOfDay(date), lte: endOfDay(date) },
      status: { not: 'CANCELLED' }
    }
  });

  const slots: Date[] = [];
  const now = new Date();

  // Gera os blocos de horário
  for (let h = workStartHour; h < workEndHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const slotStart = setMinutes(setHours(date, h), m);
      const slotEnd = addMinutes(slotStart, serviceDuration);

      // Regra 1: Horário passado
      if (isBefore(slotStart, now)) continue;

      // Regra 2: O serviço não pode terminar depois do horário de fechar
      if (isAfter(slotEnd, setHours(date, workEndHour))) continue;
      
      // Regra 3: O serviço não pode invadir a hora de almoço
      const lunchStart = setHours(date, lunchStartHour);
      const lunchEnd = setHours(date, lunchEndHour);
      if (isBefore(slotStart, lunchEnd) && isAfter(slotEnd, lunchStart)) continue;

      // Regra 4: Detetor de Colisão (Se este intervalo choca com um agendamento existente)
      const isOverlapping = appointments.some(appt => {
        // Se o slot começa antes de um agendamento terminar E termina depois do agendamento começar = Colisão!
        return isBefore(slotStart, appt.endTime) && isAfter(slotEnd, appt.startTime);
      });

      if (!isOverlapping) {
        slots.push(slotStart);
      }
    }
  }

  return slots;
}