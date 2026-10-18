import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ServicePayload } from '../types';

// Hook auxiliar: devolve uma função que atualiza a lista de serviços em cache.
// Assim, Home, Agendar e painel admin refletem a mudança na hora.
function useRefreshServices() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['services'] });
}

export function useCreateService() {
  const refresh = useRefreshServices();

  return useMutation({
    mutationFn: async (payload: ServicePayload) => {
      const { data } = await api.post('/services', payload);
      return data;
    },
    onSuccess: refresh,
  });
}

export function useUpdateService() {
  const refresh = useRefreshServices();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ServicePayload }) => {
      const response = await api.put(`/services/${id}`, data);
      return response.data;
    },
    onSuccess: refresh,
  });
}

export function useDeleteService() {
  const refresh = useRefreshServices();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/services/${id}`); // a API responde 204 (sem conteúdo)
    },
    onSuccess: refresh,
  });
}