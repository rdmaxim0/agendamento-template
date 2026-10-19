import { Link } from 'react-router-dom';
import { CalendarPlus, Clock, ShieldCheck } from '@phosphor-icons/react';
import { useServices } from '../hooks/useServices';
import { useBookingLink } from '../hooks/useBookingLink';
import '../styles/services-menu.scss';

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function ServicesMenu() {
  const bookingLink = useBookingLink();
  const { data: services, isLoading, isError } = useServices();

  return (
    <section className="services" id="servicos" aria-labelledby="services-title">
      <header className="services__header">
        <h2 id="services-title">Serviços em Destaque</h2>
        <p>Veja o que fazemos, quanto dura e quanto custa. O horário você escolhe depois, no agendamento.</p>
      </header>

      {isLoading && <p style={{ color: 'var(--color-muted)' }}>A carregar catálogo...</p>}
      {isError && <p style={{ color: 'var(--color-danger)' }}>Não foi possível carregar os serviços.</p>}

      <ul className="services__list">
        {/* NOVA VERIFICAÇÃO: Array.isArray(services) impede que a tela quebre se a API falhar */}
        {Array.isArray(services) && services.slice(0, 4).map((service, index) => (
          <li
            key={service.id}
            className={`services__item ${index === 0 ? 'services__item--featured' : ''}`}
          >
            <div className="services__row">
              <h3 className="services__name">{service.name}</h3>
              {index === 0 && <span className="services__badge">Recomendado</span>}
              <span className="services__leader" aria-hidden="true" />
              <span className="services__price">
                {formatPrice(service.price)}
              </span>
            </div>

            <p className="services__desc">{service.description}</p>

            <span className="services__duration">
              <Clock size={16} />
              {service.duration} min
            </span>
          </li>
        ))}
      </ul>

      <footer className="services__footer">
        <p>
          <ShieldCheck size={24} weight="duotone" />
          Garanta sua vaga em segundos pagando via Pix, direto no agendamento.
        </p>
        <Link {...bookingLink} className="btn btn--primary">
          <CalendarPlus size={22} weight="bold" />
          Agendar horário
        </Link>
      </footer>
    </section>
  );
}