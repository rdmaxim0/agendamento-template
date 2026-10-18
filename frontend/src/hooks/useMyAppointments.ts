import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Appointment } from '../types';

export function useMyAppointments() {
  return useQuery({
    queryKey: ['my-appointments'],
    queryFn: async () => {
      const { data } = await api.get<Appointment[]>('/appointments/me');
      return data;
    },
  });
}