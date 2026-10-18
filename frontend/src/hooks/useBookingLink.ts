import { useAuth } from './useAuth';

export function useBookingLink() {
  const { user } = useAuth();

  return user ? { to: '/agendar' } : { to: '/login', state: { from: '/agendar' } };
}