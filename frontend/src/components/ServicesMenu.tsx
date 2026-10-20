import { Link } from 'react-router-dom';
import { CalendarPlus, Clock, Sparkle } from '@phosphor-icons/react';
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
        <h2 id="services-title">Tratamentos em Destaque</h2>
        <p>A união perfeita entre técnica avançada e os melhores produtos do mercado.</p>
      </header>

      {isLoading && <p style={{ color: 'var(--color-muted)' }}>A carregar tratamentos...</p>}
      {isError && <p style={{ color: 'var(--color-danger)' }}>Não foi possível carregar as informações.</p>}

      <ul className="services__list">
        {Array.isArray(services) && services.slice(0, 4).map((service, index) => (
          <li
            key={service.id}
            className={`services__item ${index === 3 ? 'services__item--featured' : ''}`}
          >
            <div className="services__row">
              <h3 className="services__name">{service.name}</h3>
              {index === 3 && <span className="services__badge">Mais procurado</span>}
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
          <Sparkle size={24} weight="duotone" />
          A sua transformação começa aqui. Agendamento prático com confirmação instantânea.
        </p>
        <Link {...bookingLink} className="btn btn--primary">
          <CalendarPlus size={22} weight="bold" />
          Ver disponibilidade
        </Link>
      </footer>
    </section>
  );
}