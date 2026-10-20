import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useProfessionals(serviceId?: string | null) {
  return useQuery({
    queryKey: ['professionals', serviceId],
    queryFn: async () => {
      const url = serviceId ? `/professionals?serviceId=${serviceId}` : '/professionals';
      const { data } = await api.get(url);
      return data as { id: string; name: string }[];
    },
    enabled: !!serviceId,
  });
}

export function useAdminProfessionals() {
  return useQuery({
    queryKey: ['adminProfessionals'],
    queryFn: async () => {
      const { data } = await api.get('/professionals/admin');
      return data as { id: string; name: string; isActive: boolean }[];
    },
  });
}