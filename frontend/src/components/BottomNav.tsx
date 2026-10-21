import { NavLink } from 'react-router-dom';
import { HouseIcon, ListMagnifyingGlassIcon, CalendarBlankIcon, UserIcon } from '@phosphor-icons/react';
import '../styles/bottom-nav.scss';

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}>
        <HouseIcon size={24} weight="regular" className="icon" />
        <span>Início</span>
      </NavLink>

      <NavLink to="/servicos" className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}>
        <ListMagnifyingGlassIcon size={24} weight="regular" className="icon" />
        <span>Serviços</span>
      </NavLink>

      <NavLink to="/meus-agendamentos" className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}>
        <CalendarBlankIcon size={24} weight="regular" className="icon" />
        <span>Agenda</span>
      </NavLink>

      <NavLink to="/perfil" className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}>
        <UserIcon size={24} weight="regular" className="icon" />
        <span>Perfil</span>
      </NavLink>
    </nav>
  );
}