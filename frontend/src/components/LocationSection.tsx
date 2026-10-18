import { useEffect, useState } from 'react';
import { Clock, InstagramLogo, MapPin, NavigationArrow, WhatsappLogo } from '@phosphor-icons/react';
import '../styles/location.scss';

// 1. DADOS DO ESTABELECIMENTO
// Sincronizado manualmente com o availability.ts (09:00 às 19:00)
const address = 'Rua Exemplo, 123 - Centro, Rio de Janeiro';

const business = {
  name: 'SUA LOGO',
  address,
  phoneLabel: '(21) 90000-0000',
  whatsapp: '5521900000000',
  instagram: 'suamarca.oficial',
  directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`,
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117576.43859344406!2d-43.34442125191079!3d-22.93608107980838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9bde559108a45b%3A0x50f42f5ed7ce5f0!2sRio%20de%20Janeiro%2C%20State%20of%20Rio%20de%20Janeiro!5e0!3m2!1sen!2sbr!4v1729205562132!5m2!1sen!2sbr',
  
  timeZone: 'America/Sao_Paulo',
  openDays: [1, 2, 3, 4, 5, 6], // 0 = Dom, 1 = Seg ... 6 = Sáb
  openTime: '09:00',  // Equivale ao workStartHour = 9 no backend
  closeTime: '19:00', // Equivale ao workEndHour = 19 no backend
  
  hoursLabel: 'Segunda a sábado, das 09:00 às 19:00',
  closedLabel: 'Domingo: fechado',
};

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function isOpenNow(): boolean {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: business.timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23', 
  }).formatToParts(new Date());

  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

  const day = WEEKDAYS[read('weekday')];
  const now = Number(read('hour')) * 60 + Number(read('minute'));

  return (
    business.openDays.includes(day) &&
    now >= toMinutes(business.openTime) &&
    now < toMinutes(business.closeTime)
  );
}

export default function LocationSection() {
  const [open, setOpen] = useState(isOpenNow);

  useEffect(() => {
    const timer = setInterval(() => setOpen(isOpenNow()), 60_000);
    return () => clearInterval(timer); 
  }, []);

  const whatsappUrl = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent('Olá! Gostaria de tirar uma dúvida.')}`;

  return (
    <section className="location" id="localizacao" aria-labelledby="location-title">
      <div className="location__card">
        <div className="location__info">
          <h2 id="location-title">Onde estamos</h2>

          {/* ESTADO ABERTO/FECHADO */}
          <p className={`location__status location__status--${open ? 'open' : 'closed'}`}>
            {open ? 'Aberto agora' : 'Fechado agora'}
          </p>

          <ul className="location__list">
            <li>
              <MapPin size={24} weight="duotone" />
              <span>{business.address}</span>
            </li>
            <li>
              <Clock size={24} weight="duotone" />
              <div className="location__hours">
                <span>{business.hoursLabel}</span>
                <span>{business.closedLabel}</span>
              </div>
            </li>
            <li>
              <WhatsappLogo size={24} weight="duotone" />
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                {business.phoneLabel}
              </a>
            </li>
            <li>
              <InstagramLogo size={24} weight="duotone" />
              <a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noopener noreferrer">
                @{business.instagram}
              </a>
            </li>
          </ul>

          <div className="location__actions">
            <a className="btn btn--primary" href={business.directionsUrl} target="_blank" rel="noopener noreferrer">
              <NavigationArrow size={20} weight="bold" />
              Como chegar
            </a>
            <a className="btn btn--outline" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <WhatsappLogo size={20} weight="bold" />
              Chamar no WhatsApp
            </a>
          </div>
        </div>

        <div className="location__map">
          <iframe
            title={`Mapa com a localização da ${business.name}`}
            src={business.mapEmbedUrl}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}