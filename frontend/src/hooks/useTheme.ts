import { useContext } from 'react';
import { ThemeContext } from '../contexts/theme-context';

// Atalho para ler o tema em qualquer componente: const { theme, toggleTheme } = useTheme();
export function useTheme() {
  const context = useContext(ThemeContext);

  // Se cair aqui, esqueceram de envolver o app com <ThemeProvider> no main.tsx
  if (!context) {
    throw new Error('useTheme precisa ser usado dentro de um ThemeProvider.');
  }

  return context;
}