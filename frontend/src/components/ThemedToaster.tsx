import { Toaster } from 'sonner';
import { useTheme } from '../hooks/useTheme';

// Os avisos (toasts) acompanham o tema do site em vez de ficarem sempre escuros
export default function ThemedToaster() {
  const { theme } = useTheme();

  return <Toaster theme={theme} position="top-center" />;
}