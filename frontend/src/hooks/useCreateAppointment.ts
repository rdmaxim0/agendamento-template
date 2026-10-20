import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

interface CreateAppointmentPayload {
  serviceId: string;
  startTime: string;
  customerName?: string;
  customerPhone?: string;
  professionalId?: string | null;
  // NOVO: Métodos de pagamento e troco
  paymentMethod?: 'PIX' | 'PIX_MANUAL' | 'CASH';
  changeFor?: number;
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAppointmentPayload) => {
      const { data } = await api.post('/appointments', payload);
      return data;
    },
    onSuccess: () => {
      // Atualiza os horários livres e as duas listas de reservas
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
    },
  });
}