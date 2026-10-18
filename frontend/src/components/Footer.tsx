import { Link } from 'react-router-dom';
import { MapPin, WhatsappLogo, InstagramLogo } from '@phosphor-icons/react';
import '../styles/footer.scss';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappUrl = `https://wa.me/$`;

  return (
    <footer className="footer">
      <div className="footer__container">
        
        {/* COLUNA 1: Sobre */}
        <div className="footer__col">
          <Link to="/" className="footer__logo">
            <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>SUA</span> LOGO
          </Link>
          <p className="footer__desc">
            Elevamos o seu estilo ao próximo nível com atendimento premium e os melhores profissionais da cidade.
          </p>
        </div>

        {/* COLUNA 2: Links Rápidos */}
        <div className="footer__col">
          <h3 className="footer__title">Navegação</h3>
          <nav className="footer__nav">
            <Link to="/">Início</Link>
            <Link to="/servicos">Nossos Serviços</Link>
            <Link to="/agendar">Agendar Horário</Link>
            <Link to="/meus-agendamentos">As Minhas Reservas</Link>
          </nav>
        </div>

        {/* COLUNA 3: Contatos */}
        <div className="footer__col">
          <h3 className="footer__title">Contatos</h3>
          <ul className="footer__contact-list">
            <li>
              <MapPin size={20} color="var(--color-accent)" />
              <span>R. Exemplo, 123</span>
            </li>
            <li>
              <WhatsappLogo size={20} color="var(--color-accent)" />
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                (21)9000-0000
              </a>
            </li>
            <li>
              <InstagramLogo size={20} color="var(--color-accent)" />
              <a href={`https://instagram.com/SEUINSTAAAAAAAAAAAAAAAA`} target="_blank" rel="noopener noreferrer">
                @Seu_Instagram
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div className="footer__bottom">
        <p>&copy; {currentYear} Rdmaxim0. Todos os direitos reservados.</p>
        <p className="footer__developer">
          Desenvolvido por <a href={"https://gjrmengenharia.com.br"} target="_blank" rel="noopener noreferrer">GJRM Engenharia</a>
        </p>
      </div>
    </footer>
  );
}