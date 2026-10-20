import { Link } from 'react-router-dom';
import { CalendarPlus, Clock, Sparkle } from '@phosphor-icons/react';
import { useServices } from '../hooks/useServices';
import { useBookingLink } from '../hooks/useBookingLink';

// Um CSS em linha rápido para testar o luxo. Depois passamos para o arquivo .scss
const minimalCardStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
  background: 'transparent',
  border: 'none',
};

const imgStyle = {
  width: '100%',
  height: '240px',
  objectFit: 'cover' as const,
  borderRadius: '8px',
  boxShadow: 'var(--shadow-sm)',
};

export default function ServicesMenu() {
  const bookingLink = useBookingLink();
  const { data: services, isLoading } = useServices();

  return (
    <section className="services" id="servicos" style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 400, color: 'var(--color-primary)' }}>
          Experiências em Destaque
        </h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '1.1rem', marginTop: '10px' }}>
          Técnica avançada, produtos selecionados e um ambiente pensado para o seu relaxamento.
        </p>
      </header>

      {isLoading && <p style={{ textAlign: 'center' }}>Buscando o catálogo...</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
        {Array.isArray(services) && services.slice(0, 4).map((service) => (
          <article key={service.id} style={minimalCardStyle}>
            {service.imageUrl ? (
              <img src={service.imageUrl} alt={service.name} style={imgStyle} />
            ) : (
              <div style={{ ...imgStyle, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkle size={32} color="var(--color-muted)" />
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '8px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text)' }}>{service.name}</h3>
              <span style={{ fontSize: '1.1rem', color: 'var(--color-primary)', fontWeight: 500 }}>
                {service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            
            <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {service.description}
            </p>

            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text)', fontSize: '0.9rem', opacity: 0.8 }}>
              <Clock size={16} /> {service.duration} min
            </span>
          </article>
        ))}
      </div>

      <footer style={{ textAlign: 'center', marginTop: '60px' }}>
        <Link {...bookingLink} className="btn btn--primary" style={{ padding: '16px 36px', fontSize: '1.1rem' }}>
          <CalendarPlus size={22} weight="bold" />
          Agendar meu horário
        </Link>
      </footer>
    </section>
  );
}