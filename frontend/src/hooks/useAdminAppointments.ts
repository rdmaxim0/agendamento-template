import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AdminAppointment, AppointmentStatus } from '../types';

// status vazio ('') = sem filtro, traz todas
export function useAdminAppointments(status: AppointmentStatus | '') {
  return useQuery({
    // O status entra na chave: cada filtro tem o seu próprio cache
    queryKey: ['admin-appointments', status],
    queryFn: async () => {
      const { data } = await api.get<AdminAppointment[]>('/appointments', {
        params: status ? { status } : {}, // só manda ?status= se houver filtro
      });
      return data;
    },
    // Ao trocar o filtro, mantém a lista anterior na tela enquanto a nova
    // carrega (evita o "pisca"). É o "dashboard instantâneo" do roadmap.
    placeholderData: keepPreviousData,

    refetchInterval: 30_000,
  });
}

export function useConfirmAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/appointments/${id}/confirm`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
    },
  });
}