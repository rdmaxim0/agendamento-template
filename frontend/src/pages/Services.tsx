import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from '@phosphor-icons/react';
import { useServices } from '../hooks/useServices';
import '../styles/services-page.scss'; 

export default function Services() {
  const { data: services, isLoading, isError } = useServices();

  return (
    <main className="services-page">
      <header className="services-page__header">
        <h1>Experiências de Beleza</h1>
        <p>Explore os nossos tratamentos e reserve um tempo para cuidar de si.</p>
      </header>

      {isLoading && <p className="services-page__status">A preparar o nosso catálogo...</p>}

      {isError && (
        <p className="services-page__status">Não foi possível carregar os tratamentos. Tente novamente em instantes.</p>
      )}

      {!isLoading && !isError && services?.length === 0 && (
        <p className="services-page__status">Ainda não há tratamentos disponíveis de momento.</p>
      )}

      {Array.isArray(services) && services.length > 0 && (
        <div className="services-page__grid">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className="premium-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.4 }}
            >
              <div className="premium-card__glow"></div>
              <div className="premium-card__content">
                <h2>{service.name}</h2>

                <p className="premium-card__desc">
                  {service.description || 'Cuidado especializado com produtos premium para realçar a sua melhor versão.'}
                </p>

                <div className="premium-card__meta">
                  <span className="premium-card__duration">
                    <Clock size={16} weight="bold" />
                    {service.duration} min
                  </span>
                  <span className="premium-card__price">
                    {service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <Link to={`/agendar?service=${service.id}`} className="btn btn--outline premium-card__btn">
                  Reservar tratamento
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}