import { Moon, Sun } from '@phosphor-icons/react';
import { useTheme } from '../hooks/useTheme';
import '../styles/theme-toggle.scss';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  // O texto do aria-label descreve o que o clique VAI fazer (leitores de tela leem isso)
  const label = isDark ? 'Ativar tema claro' : 'Ativar tema escuro';

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={label} title={label}>
      {/* No escuro mostramos o sol (para ir ao claro) e vice-versa */}
      {isDark ? <Sun size={20} weight="bold" /> : <Moon size={20} weight="bold" />}
    </button>
  );
}
