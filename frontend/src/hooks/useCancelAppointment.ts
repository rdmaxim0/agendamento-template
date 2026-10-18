import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    // PATCH altera parcialmente um registro (aqui, só o status)
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/appointments/${id}/cancel`);
      return data;
    },
    onSuccess: () => {
      // Atualiza a lista do cliente E os horários livres
      // (o horário cancelado volta a ficar disponível)
      queryClient.invalidateQueries({ queryKey: ['my-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
}