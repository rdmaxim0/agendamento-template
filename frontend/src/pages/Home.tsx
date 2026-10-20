import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus } from '@phosphor-icons/react';
import ServicesMenu from '../components/ServicesMenu';
import { useBookingLink } from '../hooks/useBookingLink';
import LocationSection from '../components/LocationSection';
import Footer  from '../components/Footer'
import '../styles/home.scss';

// Novas imagens: salão, estética e detalhes de beleza
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80"
];

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);
  const bookingLink = useBookingLink();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500); // Ligeiramente mais lento para uma transição relaxante
    return () => clearInterval(timer);
  }, []);

  return (
    <>
    <main className="home">
      <section className="home__slider">
        {HERO_IMAGES.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Destaque Salão ${index + 1}`}
            className={`home__slider-img ${index === currentImage ? 'home__slider-img--active' : ''}`}
          />
        ))}
        <div className="home__slider-overlay"></div>
      </section>

      <section className="home__hero">
        <div className="home__hero-content">
          <h1>Realce a sua beleza autêntica.</h1>
          <p>Um momento só seu. Cuidado, estética e bem-estar numa experiência premium do início ao fim.</p>

          <Link {...bookingLink} className="home__cta">
            <CalendarPlus size={24} weight="bold" />
            Agendar o meu momento
          </Link>
        </div>
      </section>

      <ServicesMenu />
      <LocationSection />
    </main>
    <Footer />
    </>
  );
}