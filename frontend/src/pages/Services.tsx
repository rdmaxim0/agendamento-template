import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from '@phosphor-icons/react';
import { useServices } from '../hooks/useServices';
import '../styles/services-page.scss'; // antes era services.scss (agora esse é só da Home)

export default function Services() {
  // isError vem do React Query: fica true quando a API falha
  const { data: services, isLoading, isError } = useServices();

  return (
    <main className="services-page">
      <header className="services-page__header">
        <h1>Nossos serviços</h1>
        <p>Explore o nosso catálogo e garanta o seu momento.</p>
      </header>

      {/* Três estados antes da lista: carregando, erro e vazio */}
      {isLoading && <p className="services-page__status">Carregando o catálogo...</p>}

      {isError && (
        <p className="services-page__status">Não foi possível carregar os serviços. Tente novamente em instantes.</p>
      )}

      {!isLoading && !isError && services?.length === 0 && (
        <p className="services-page__status">Ainda não há serviços cadastrados.</p>
      )}

      {services && services.length > 0 && (
        <div className="services-page__grid">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className="premium-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              // Cada card entra um pouquinho depois do anterior
              transition={{ delay: index * 0.06, duration: 0.4 }}
            >
              <div className="premium-card__glow"></div>
              <div className="premium-card__content">
                <h2>{service.name}</h2>

                <p className="premium-card__desc">
                  {service.description || 'A excelência técnica que você já conhece, agora com um toque premium.'}
                </p>

                {/* Duração à esquerda, preço em destaque à direita */}
                <div className="premium-card__meta">
                  <span className="premium-card__duration">
                    <Clock size={16} weight="bold" />
                    {service.duration} min
                  </span>
                  <span className="premium-card__price">
                    {service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                {/* O Booking lê ?service=... e já deixa o serviço escolhido */}
                <Link to={`/agendar?service=${service.id}`} className="btn btn--outline premium-card__btn">
                  Agendar este serviço
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}