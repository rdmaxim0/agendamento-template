import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus } from '@phosphor-icons/react';
import ServicesMenu from '../components/ServicesMenu';
import { useBookingLink } from '../hooks/useBookingLink';
import LocationSection from '../components/LocationSection';
import Footer  from '../components/Footer'
import '../styles/home.scss';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=80"
];

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);
  // { to, state }: /agendar se estiver logado, /login (voltando para /agendar) se não
  const bookingLink = useBookingLink();

  // Troca a imagem do slider a cada 4 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
    <main className="home">
      {/* Slider e hero continuam iguais */}
      <section className="home__slider">
        {HERO_IMAGES.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Destaque ${index + 1}`}
            className={`home__slider-img ${index === currentImage ? 'home__slider-img--active' : ''}`}
          />
        ))}
        <div className="home__slider-overlay"></div>
      </section>

      <section className="home__hero">
        <div className="home__hero-content">
          <h1>Eleve o seu estilo ao próximo nível.</h1>
          <p>Agendamento rápido, prático e sem complicações. Uma experiência premium do início ao fim.</p>

          <Link {...bookingLink} className="home__cta">
            <CalendarPlus size={24} weight="bold" />
            Agendar Horário
          </Link>
        </div>
      </section>

      {/* Seções novas, cada uma no seu componente */}
      <ServicesMenu />
      <LocationSection />
    </main>
    <Footer />
    </>
  );
}