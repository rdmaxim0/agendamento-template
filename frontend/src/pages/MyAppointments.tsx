import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useMyAppointments } from '../hooks/useMyAppointments';
import { useCancelAppointment } from '../hooks/useCancelAppointment';
import { getErrorMessage } from '../lib/getErrorMessage';
import type { AppointmentStatus } from '../types';
import '../styles/my-appointments.scss';

// Traduz o status do banco para um texto amigável
const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: 'Aguardando pagamento',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
};

export default function MyAppointments() {
  const { data: appointments, isLoading, isError } = useMyAppointments();
  const cancelAppointment = useCancelAppointment();

  function handleCancel(id: string) {
    // window.confirm abre a caixa nativa "OK / Cancelar" do navegador
    if (!window.confirm('Deseja realmente cancelar esta reserva?')) return;

    cancelAppointment.mutate(id, {
      onSuccess: () => toast.success('Reserva cancelada.'),
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  }

  if (isLoading) return <p className="appointments">Carregando...</p>;
  if (isError) return <p className="appointments">Não foi possível carregar suas reservas.</p>;

  // 1. Defina o peso de cada status (menor número aparece primeiro)
  const statusWeight: Record<string, number> = {
    'PENDING': 1,
    'CONFIRMED': 2,
    'CANCELLED': 3
  };

  // 2. Aplique a ordenação com proteção contra undefined (corrigindo o ts(2488))
  const sortedAppointments = [...(appointments || [])].sort((a: any, b: any) => {
    // Primeiro critério: Ordem do status
    const weightDiff = (statusWeight[a.status] || 99) - (statusWeight[b.status] || 99);
    if (weightDiff !== 0) {
      return weightDiff;
    }
    
    // Segundo critério: Se o status for igual, mostra a data mais recente primeiro
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
  });

  return (
    <main className="appointments">
      <h1>Meus agendamentos</h1>

      {appointments?.length === 0 && (
        <p className="appointments__empty">
          Você ainda não tem reservas. <Link to="/agendar">Agendar agora</Link>
        </p>
      )}

      {sortedAppointments?.map((appointment: any) => {
        const start = new Date(appointment.startTime);
        // Só dá para cancelar o que ainda não foi cancelado e ainda não aconteceu
        const canCancel = appointment.status !== 'CANCELLED' && start > new Date();

        return (
          <motion.div
            key={appointment.id}
            className="appointments__card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="appointments__info">
              <strong>{appointment.service.name}</strong>
              {/* "sexta-feira, 16 de outubro às 10:00" */}
              <span>{format(start, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
              <span>
                {appointment.service.price.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>

            <div className="appointments__side">
              {/* A classe muda conforme o status (cores diferentes no SCSS) */}
              <span
                className={`appointments__badge appointments__badge--${appointment.status.toLowerCase()}`}
              >
                {/* Garantimos o tipo AppointmentStatus (corrigindo o ts(7053)) */}
                {STATUS_LABEL[appointment.status as AppointmentStatus]}
              </span>

              {appointment.status === 'PENDING' && (
                <small>Expira em 10 minutos se não for paga.</small>
              )}

              {canCancel && (
                <button
                  type="button"
                  onClick={() => handleCancel(appointment.id)}
                  disabled={cancelAppointment.isPending}
                >
                  Cancelar
                </button>
              )}
            </div>
          </motion.div>
        );
      })}
    </main>
  );
}