import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './theme-context';

// Chave usada no localStorage. O script do index.html usa a MESMA chave.
const STORAGE_KEY = 'theme';

// Decide qual tema usar quando a página abre:
// 1) o que o usuário escolheu antes; 2) o tema do sistema; 3) dark (padrão do site)
function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // localStorage pode estar bloqueado (modo privado): seguimos sem ele
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Um único estado de tema para o app inteiro (botão, Toaster, etc. leem o mesmo valor)
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Sempre que o tema muda: escreve data-theme na tag <html> (o CSS reage a isso)
  // e salva a escolha para a próxima visita
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignora se não puder salvar
    }
  }, [theme]);

  // useCallback mantém a mesma função entre renders (evita recriações à toa)
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}