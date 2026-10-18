import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/global.scss';
import { AuthProvider } from './contexts/AuthProvider';
import { ThemeProvider } from './contexts/ThemeProvider';
import ThemedToaster from './components/ThemedToaster';

// O QueryClient é o "cérebro" do cache do React Query
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Tema claro/escuro compartilhado por todo o app */}
    <ThemeProvider>
      {/* Disponibiliza o cache de dados para todos os componentes */}
      <QueryClientProvider client={queryClient}>
        {/* Habilita rotas/páginas (URLs) no app */}
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
        {/* Exibe os avisos (toasts) do Sonner, já no tema atual */}
        <ThemedToaster />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);