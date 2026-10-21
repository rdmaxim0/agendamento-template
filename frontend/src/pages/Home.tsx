import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  SparkleIcon, 
  ScissorsIcon, 
  HandHeartIcon, 
  FlowerIcon,
  UserIcon,
  ClockIcon,
  ArrowRightIcon
} from '@phosphor-icons/react';
import { useServices } from '../hooks/useServices';
import { useAuth } from '../hooks/useAuth';
import '../styles/home.scss';

// Categorias disponíveis no filtro
const CATEGORIES = [
  { id: 'Todos', label: 'Todos', icon: SparkleIcon },
  { id: 'Cabelo', label: 'Cabelo', icon: ScissorsIcon },
  { id: 'Unhas', label: 'Unhas', icon: HandHeartIcon },
  { id: 'Estetica', label: 'Estética', icon: FlowerIcon },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: services, isLoading } = useServices();
  
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Filtro Inteligente: Busca por texto + Categoria baseada em palavras-chave no nome do serviço
  const filteredServices = useMemo(() => {
    if (!Array.isArray(services)) return [];
    
    return services.filter(service => {
      const matchSearch = service.name.toLowerCase().includes(search.toLowerCase());
      
      let matchCategory = true;
      const name = service.name.toLowerCase();
      
      if (activeCategory === 'Cabelo') {
        matchCategory = name.includes('corte') || name.includes('coloração') || name.includes('mechas') || name.includes('barba');
      } else if (activeCategory === 'Unhas') {
        matchCategory = name.includes('manicure') || name.includes('pedicure') || name.includes('gel');
      } else if (activeCategory === 'Estetica') {
        matchCategory = name.includes('pele') || name.includes('massagem') || name.includes('sobrancelha');
      }

      return matchSearch && matchCategory;
    });
  }, [services, search, activeCategory]);

  return (
    <main className="home-app">
      {/* Cabeçalho Topo */}
      <header className="home-app__header">
        <div className="logo">
          <FlowerIcon size={24} weight="fill" color="var(--color-primary)" />
          <span>atelier.</span>
        </div>
        <button onClick={() => navigate(user ? '/perfil' : '/login')} className="login-btn">
          <UserIcon size={18} />
          {user ? 'Perfil' : 'Entrar'}
        </button>
      </header>

      {/* Saudação e Pesquisa */}
      <section className="home-app__greeting">
        <span className="subtitle">UM TEMPO PARA VOCÊ</span>
        <div className="title-row">
          <h1>O que vamos cuidar hoje?</h1>
          <Link to="/servicos" className="see-all">Ver todos <ArrowRightIcon size={14} weight="bold" /></Link>
        </div>

        <div className="search-bar">
          <MagnifyingGlassIcon size={20} color="var(--color-muted)" />
          <input 
            type="text" 
            placeholder="Qual serviço você procura?" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Carrossel de Categorias */}
      <nav className="home-app__categories">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button 
              key={cat.id} 
              className={`category-chip ${isActive ? 'category-chip--active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <Icon size={18} weight={isActive ? "fill" : "regular"} />
              {cat.label}
            </button>
          );
        })}
      </nav>

      {/* Lista de Serviços */}
      <section className="home-app__services">
        {isLoading && <p className="loading">Buscando tratamentos...</p>}
        {!isLoading && filteredServices.length === 0 && (
          <p className="empty">Nenhum serviço encontrado para esta busca.</p>
        )}

        <div className="services-list">
          {filteredServices.map(service => {
            // Define uma tag visual baseada no nome para imitar o design
            const tag = service.name.includes('Corte') || service.name.includes('Coloração') ? 'Cabelo' 
                      : service.name.includes('Manicure') || service.name.includes('Gel') ? 'Unhas' 
                      : 'Estética';

            return (
              <article key={service.id} className="service-card">
                <div className="service-card__image">
                  {service.imageUrl ? (
                    <img src={service.imageUrl} alt={service.name} />
                  ) : (
                    <div className="placeholder"><SparkleIcon size={24} /></div>
                  )}
                </div>
                
                <div className="service-card__info">
                  <span className="tag">{tag}</span>
                  <h3>{service.name}</h3>
                  <span className="duration">
                    <ClockIcon size={14} /> {service.duration} min
                  </span>
                  
                  <div className="bottom-row">
                    <span className="price">
                      {service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <Link to={`/agendar?service=${service.id}`} className="book-btn">
                      Agendar <ArrowRightIcon size={14} weight="bold" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}