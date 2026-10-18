import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Service } from '../types';

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await api.get<Service[]>('/services');
      return response.data;
    },
  });
}