import { Link } from 'react-router-dom';
import { CalendarPlus, Clock, Sparkle } from '@phosphor-icons/react';
import { useServices } from '../hooks/useServices';
import { useBookingLink } from '../hooks/useBookingLink';
import '../styles/services-menu.scss'; // Importa o nosso novo SCSS

export default function ServicesMenu() {
  const bookingLink = useBookingLink();
  const { data: services, isLoading } = useServices();

  return (
    <section className="services-editorial" id="servicos" aria-labelledby="services-title">
      <div className="services-editorial__container">
        <header className="services-editorial__header">
          <h2 id="services-title">O Nosso Editorial</h2>
          <p>Experiências imersivas desenhadas para o seu bem-estar e sofisticação.</p>
        </header>

        {isLoading && <p style={{ textAlign: 'center', color: 'var(--color-text)' }}>Carregando experiências...</p>}

        <div className="services-editorial__grid">
          {Array.isArray(services) && services.slice(0, 6).map((service) => (
            <Link key={service.id} to={`/agendar?service=${service.id}`} className="services-editorial__card">
              
              {/* Imagem de Fundo Fotográfica */}
              {service.imageUrl ? (
                <img 
                  src={service.imageUrl} 
                  alt={service.name} 
                  className="services-editorial__card-image" 
                />
              ) : (
                <div className="services-editorial__card-placeholder">
                  <Sparkle size={48} color="var(--color-muted)" />
                </div>
              )}

              {/* Filtro Escuro (Gradiente de baixo para cima) */}
              <div className="services-editorial__card-overlay"></div>

              {/* Texto sobreposto na parte inferior */}
              <div className="services-editorial__card-content">
                <h3>{service.name}</h3>
                
                <div className="services-editorial__card-meta">
                  <span className="price">
                    {service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  <span className="duration">
                    <Clock size={16} /> {service.duration} min
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <footer className="services-editorial__footer">
          <Link {...bookingLink} className="btn btn--primary">
            <CalendarPlus size={22} weight="bold" />
            Agendar Horário
          </Link>
        </footer>
      </div>
    </section>
  );
}