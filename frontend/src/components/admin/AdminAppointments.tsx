import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  useAdminAppointments,
  useConfirmAppointment,
} from '../../hooks/useAdminAppointments';
import { useCancelAppointment } from '../../hooks/useCancelAppointment';
import { getErrorMessage } from '../../lib/getErrorMessage';
import { STATUS_LABEL, minutesToExpire, sortAppointments } from '../../lib/appointmentStatus';
import type { AppointmentStatus } from '../../types';

export default function AdminAppointments() {
  // '' significa "todas"
  const [status, setStatus] = useState<AppointmentStatus | ''>('');

  // "Agora", atualizado a cada 30s, para o contador de expiração andar
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    // Função de limpeza: para o relógio quando o componente sai da tela
    return () => clearInterval(id);
  }, []);

  const { data: appointments, isLoading, isError } = useAdminAppointments(status);
  const confirmMutation = useConfirmAppointment();
  const cancelMutation = useCancelAppointment();

  // useMemo só refaz a ordenação quando a lista muda (não a cada renderização)
  const sorted = useMemo(() => sortAppointments(appointments ?? []), [appointments]);

  function handleConfirm(id: string) {
    confirmMutation.mutate(id, {
      onSuccess: () => toast.success('Reserva confirmada.'),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  function handleCancel(id: string) {
    if (!window.confirm('Cancelar esta reserva?')) return;

    cancelMutation.mutate(id, {
      onSuccess: () => toast.success('Reserva cancelada.'),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  return (
    <section className="admin__section">
      <label className="admin__filter">
        Filtrar por status
        <select value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus | '')}>
          <option value="">Todas</option>
          <option value="PENDING">Aguardando pagamento</option>
          <option value="CONFIRMED">Confirmadas</option>
          <option value="CANCELLED">Canceladas</option>
        </select>
      </label>

      {isLoading && <p>Carregando reservas...</p>}
      {isError && <p>Não foi possível carregar as reservas.</p>}
      {appointments?.length === 0 && <p className="admin__empty">Nenhuma reserva encontrada.</p>}

      {sorted.map((appointment) => {
        // Só faz sentido para pendentes
        const minutesLeft =
          appointment.status === 'PENDING' ? minutesToExpire(appointment.createdAt, now) : null;

        const isManual = appointment.paymentMethod === 'MANUAL';
        const clientName = appointment.customerName ?? appointment.user.name;
        const clientPhone = appointment.customerPhone ?? appointment.user.phone;

        return (
          <div key={appointment.id} className="admin__card">
            <div className="admin__info">
              <strong>{clientName}</strong>
              <span>
                {isManual ? 'Reserva manual' : appointment.user.email}
                {clientPhone && ` · ${clientPhone}`}
              </span>
              <span>{appointment.service.name}</span>
              <span>{format(new Date(appointment.startTime), "dd/MM/yyyy 'às' HH:mm")}</span>
            </div>

            <div className="admin__side">
              <span className={`admin__badge admin__badge--${appointment.status.toLowerCase()}`}>
                {STATUS_LABEL[appointment.status]}
              </span>

              {minutesLeft !== null && (
                // Com 3 min ou menos, o contador fica vermelho (urgente)
                <small className={`admin__expire ${minutesLeft <= 3 ? 'admin__expire--urgent' : ''}`}>
                  {minutesLeft === 0 ? 'Expirando...' : `Expira em ${minutesLeft} min`}
                </small>
              )}

              <div className="admin__actions">
                {/* Só dá para confirmar o que está pendente (igual à regra do backend) */}
                {appointment.status === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() => handleConfirm(appointment.id)}
                    disabled={confirmMutation.isPending}
                  >
                    Confirmar
                  </button>
                )}

                {appointment.status !== 'CANCELLED' && (
                  <button
                    type="button"
                    className="admin__danger"
                    onClick={() => handleCancel(appointment.id)}
                    disabled={cancelMutation.isPending}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}