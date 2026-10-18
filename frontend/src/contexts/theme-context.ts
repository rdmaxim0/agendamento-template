import { createContext } from 'react';

export type Theme = 'dark' | 'light';

// O que o contexto entrega para quem usar o tema
export interface ThemeContextData {
  theme: Theme;
  toggleTheme: () => void;
}

// null = ainda não existe um ThemeProvider acima (o useTheme avisa se isso acontecer)
export const ThemeContext = createContext<ThemeContextData | null>(null);