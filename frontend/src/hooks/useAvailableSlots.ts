import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AvailableResponse } from '../types';

export function useAvailableSlots(serviceId: string | null, date: string | null) {
  return useQuery({
    // A chave inclui serviço e data: cada combinação tem seu próprio cache.
    // Voltar para um dia já consultado mostra o resultado na hora.
    queryKey: ['slots', serviceId, date],
    queryFn: async () => {
      const { data } = await api.get<AvailableResponse>('/appointments/available', {
        params: { serviceId, date },
      });
      return data;
    },
    // Só busca quando o cliente já escolheu serviço E data
    enabled: Boolean(serviceId && date),
  });
}