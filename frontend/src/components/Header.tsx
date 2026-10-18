import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SignIn, SignOut, List, X, PushPin, PushPinSlash } from '@phosphor-icons/react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle'; 
import '../styles/header.scss';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // NOVO: Estado para fixar a barra lateral (apenas Admin)
  const [isPinned, setIsPinned] = useState(() => localStorage.getItem('sidebarPinned') === 'true');

  const handleLogout = () => {
    signOut();
    setIsMenuOpen(false);
    navigate('/login');
  };

  // Lida com o fecho do menu no telemóvel ao mudar de página
  useEffect(() => {
    if (!isPinned || window.innerWidth < 1024) {
      setIsMenuOpen(false);
    }
  }, [location.pathname, isPinned]);

  // Bloqueia o scroll apenas se o menu estiver aberto flutuando por cima da tela (mobile)
  useEffect(() => {
    if (isMenuOpen && (!isPinned || window.innerWidth < 1024)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen, isPinned]);

  // NOVO: Injeta uma classe no Body para empurrar o layout inteiro se estiver fixado
  useEffect(() => {
    if (user?.role === 'ADMIN' && isPinned) {
      document.body.classList.add('sidebar-pinned');
      setIsMenuOpen(true); // Garante que fica aberta
    } else {
      document.body.classList.remove('sidebar-pinned');
    }
    localStorage.setItem('sidebarPinned', String(isPinned));
  }, [isPinned, user]);

  return (
    <>
      <header className="header">
        <div className="header__container">
          
          <div className="header__left">
            {user && (
              <button 
                className="header__menu-btn"
                onClick={() => setIsMenuOpen(true)}
                aria-label="Abrir menu"
              >
                <List size={28} weight="bold" />
              </button>
            )}
          </div>

          <Link to="/" className="header__logo">
            <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>SUA</span> LOGO
          </Link>

          <div className="header__right">
            <ThemeToggle />

            {!user ? (
              <Link to="/login" className="header__link header__link--login">
                <SignIn size={20} weight="bold" />
                <span className="hide-mobile">Entrar</span>
              </Link>
            ) : (
              <button onClick={handleLogout} className="header__logout-btn">
                <span className="hide-mobile">Sair</span>
                <SignOut size={22} weight="bold" />
              </button>
            )}
          </div>

        </div>
      </header>

      <div 
        className={`sidebar-overlay ${isMenuOpen ? 'sidebar-overlay--open' : ''}`} 
        onClick={() => setIsMenuOpen(false)}
      />

      <aside className={`sidebar ${isMenuOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <span className="sidebar__logo">
            <span style={{ color: 'var(--color-accent)' }}>SUA</span> LOGO
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* O BOTÃO DO PIN - Só aparece para o Admin */}
            {user?.role === 'ADMIN' && (
              <button onClick={() => setIsPinned(!isPinned)} className="sidebar__close-btn" title="Fixar menu na tela">
                {isPinned ? <PushPinSlash size={24} weight="fill" color="var(--color-accent)" /> : <PushPin size={24} weight="bold" />}
              </button>
            )}
            <button onClick={() => setIsMenuOpen(false)} className="sidebar__close-btn hide-on-pinned" aria-label="Fechar menu">
              <X size={24} weight="bold" />
            </button>
          </div>
        </div>

        {user && (
          <div className="sidebar__user-info">
            <p>Olá, <strong>{user.name.split(' ')[0]}</strong></p>
            <small>{user.email}</small>
          </div>
        )}

        <nav className="sidebar__nav">
          <Link to="/servicos" className="sidebar__link">Nossos Serviços</Link>
          <Link to="/agendar" className="sidebar__link">Agendar</Link>
          
          {user?.role === 'ADMIN' ? (
            <Link to="/admin" className="sidebar__link">Painel Admin</Link>
          ) : (
            <Link to="/meus-agendamentos" className="sidebar__link">Meus Agendamentos</Link>
          )}
        </nav>

        {user && (
          <div className="sidebar__footer">
            <button onClick={handleLogout} className="sidebar__logout-btn">
              <SignOut size={22} weight="bold" />
              Sair da conta
            </button>
          </div>
        )}
      </aside>
    </>
  );
}