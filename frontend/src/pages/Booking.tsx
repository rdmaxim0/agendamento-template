import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { useServices } from '../hooks/useServices';
import { useAvailableSlots } from '../hooks/useAvailableSlots';
import { useCreateAppointment } from '../hooks/useCreateAppointment';
import { getErrorMessage } from '../lib/getErrorMessage';
import { useProfessionals } from '../hooks/useProfessionals';
import Calendar from '../components/Calendar';
import '../styles/booking.scss';

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

type PaymentMethod = 'PIX' | 'PIX_MANUAL' | 'CASH';

export default function Booking() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [serviceId, setServiceId] = useState<string | null>(searchParams.get('service'));
  const [professionalId, setProfessionalId] = useState<string | null>(null); 
  const [date, setDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<{ startTime: string; label: string } | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [changeFor, setChangeFor] = useState(''); 

  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string } | null>(null);
  
  const [checkoutResult, setCheckoutResult] = useState<{ method: PaymentMethod, appointmentId: string } | null>(null);

  const { data: services } = useServices();
  const { data: professionalsList, isLoading: loadingProfs } = useProfessionals(serviceId);
  const createAppointment = useCreateAppointment();
  const isAdmin = user?.role === 'ADMIN';

  const manualDataInvalid = isAdmin && (customerName.trim().length < 2 || customerPhone.replace(/\D/g, '').length < 8);
  const dateString = date ? format(date, 'yyyy-MM-dd') : null;
  const { data: available, isLoading: loadingSlots } = useAvailableSlots(serviceId, dateString);
  const selectedService = services?.find((s) => s.id === serviceId);

  const { data: paymentInfo } = useQuery({
    queryKey: ['paymentStatus', createdAppointmentId],
    queryFn: async () => {
      const res = await api.get(`/appointments/${createdAppointmentId}/payment`);
      return res.data;
    },
    enabled: !!createdAppointmentId && !isAdmin && paymentMethod === 'PIX', 
    refetchInterval: (query) => {
      if (query.state.data?.appointmentStatus === 'CONFIRMED') return false;
      return 3000;
    },
  });

  useEffect(() => {
    if (paymentInfo && paymentMethod === 'PIX') {
      if (!pixData && paymentInfo.payment?.qrCodeBase64) {
        setPixData(paymentInfo.payment);
      }
      if (paymentInfo.appointmentStatus === 'CONFIRMED') {
        toast.success('Pagamento confirmado! A sua vaga está garantida.');
        setTimeout(() => navigate('/meus-agendamentos'), 2000);
      }
    }
  }, [paymentInfo, pixData, navigate, paymentMethod]);

  function handleSelectService(id: string) {
    setServiceId(id);
    setProfessionalId(null);
    setDate(null);
    setSlot(null);
  }

  function handleSelectProfessional(id: string) {
    setProfessionalId(id);
    setDate(null);
    setSlot(null);
  }

  function handleSelectDate(day: Date) {
    setDate(day);
    setSlot(null);
  }

  function copyPix() {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      toast.success('Código Pix copiado!');
    }
  }

  function handleConfirm() {
    if (!user) {
      toast.info('Faça login para confirmar sua reserva.');
      navigate('/login', { state: { from: `/agendar${serviceId ? `?service=${serviceId}` : ''}` } });
      return;
    }

    if (!serviceId || !slot || !selectedService || !professionalId) return;

    if (manualDataInvalid) {
      toast.error('Informe o nome e o telefone do cliente.');
      return;
    }

    const parsedChange = changeFor ? Number(changeFor) : undefined;
    if (!isAdmin && paymentMethod === 'CASH' && parsedChange !== undefined) {
      if (parsedChange < selectedService.price) {
        toast.error('O valor para troco não pode ser menor que o preço do serviço.');
        return;
      }
    }

    createAppointment.mutate(
      {
        serviceId,
        professionalId: professionalId === 'ANY' ? null : professionalId,
        startTime: slot.startTime,
        ...(isAdmin
          ? { customerName: customerName.trim(), customerPhone: customerPhone.trim() }
          : { paymentMethod, changeFor: parsedChange }),
      },
      {
        onSuccess: (data) => {
          if (isAdmin) {
            toast.success('Reserva manual criada e confirmada!');
            setSlot(null);
            setCustomerName('');
            setCustomerPhone('');
            navigate('/meus-agendamentos'); 
          } else {
            if (paymentMethod === 'PIX') {
              toast.success('Reserva criada! Aguardando pagamento.');
              setCreatedAppointmentId(data.appointment.id);
              if (data.pix?.qrCodeBase64) setPixData(data.pix);
            } else {
              toast.success('Reserva registada com sucesso!');
              setCheckoutResult({ method: paymentMethod, appointmentId: data.appointment.id });
            }
          }
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  }

  return (
    <main className="booking">
      <h1>{isAdmin ? 'Reserva manual' : 'Agendar horário'}</h1>

      {checkoutResult ? (
        <motion.section {...fadeIn} className="booking__summary booking__pix">
          <h2>Reserva Registada!</h2>
          
          {checkoutResult.method === 'PIX_MANUAL' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center', marginTop: '16px' }}>
              <p>Para garantir a sua vaga, transfira o valor exato para a nossa chave Pix:</p>
              
              <div style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--color-primary)', width: '100%' }}>
                <strong style={{ fontSize: '1.4rem', color: 'var(--color-accent)' }}>(21)9000-0000</strong>
                <br/><small style={{ color: 'var(--color-muted)' }}>Chave Celular - (21)9000-0000</small>
              </div>

              <button 
                className="btn btn--outline" 
                onClick={() => {
                  navigator.clipboard.writeText('(21)9000-0000');
                  toast.success('Chave Pix copiada!');
                }}
              >
                Copiar Chave Pix
              </button>

              <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
                A sua reserva ficará como "Aguardando pagamento" até o administrador confirmar o recebimento.
              </p>
            </div>
          )}

          {checkoutResult.method === 'CASH' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', textAlign: 'center', marginTop: '16px' }}>
              <div style={{ fontSize: '3rem' }}>💵</div>
              <p style={{ fontSize: '1.2rem', color: 'var(--color-text)', fontWeight: 'bold' }}>
                Pagamento no local selecionado.
              </p>
              <p style={{ color: 'var(--color-muted)', fontSize: '1rem', lineHeight: '1.5' }}>
                A sua reserva está pendente. Aguarde a confirmação do administrador para garantir a sua vaga.
              </p>
            </div>
          )}

          <button onClick={() => navigate('/meus-agendamentos')} className="btn btn--primary" style={{ width: '100%', marginTop: '24px' }}>
            Ver meus agendamentos
          </button>
        </motion.section>

      ) : createdAppointmentId && !isAdmin && paymentMethod === 'PIX' ? (
        <motion.section {...fadeIn} className="booking__summary booking__pix">
          <h2>Pagamento via Pix</h2>
          {paymentInfo?.appointmentStatus === 'CONFIRMED' ? (
            <div className="booking__pix-success">
              <h3>✅ Pagamento Aprovado!</h3>
              <p>A redirecionar para os seus agendamentos...</p>
            </div>
          ) : (
            <>
              <p>Escaneie o código abaixo na app do seu banco ou use a opção "Copia e Cola".</p>
              <p className="booking__pix-expire">Expira em 10 minutos.</p>
              
              {pixData?.qrCodeBase64 ? (
                <div className="booking__pix-qr-box">
                  <img 
                    src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`} 
                    alt="QR Code Pix" 
                    className="booking__pix-qr"
                  />
                  <button type="button" onClick={copyPix} className="booking__confirm">
                    Copiar código Pix
                  </button>
                </div>
              ) : (
                <p>A gerar QR Code seguro...</p>
              )}
            </>
          )}
        </motion.section>
      ) : (
        <>
          <section>
            <h2>1. Escolha o serviço</h2>
            <div className="booking__services">
              {services?.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handleSelectService(service.id)}
                  className={`booking__service ${service.id === serviceId ? 'booking__service--active' : ''}`}
                >
                  <strong>{service.name}</strong>
                  <span>
                    {service.duration} min ·{' '}
                    {service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {serviceId && (
            <motion.section {...fadeIn}>
              <h2>2. Escolha o profissional</h2>
              {loadingProfs && <p>Buscando especialistas...</p>}
              <div className="booking__services">
                <button
                  type="button"
                  onClick={() => handleSelectProfessional('ANY')}
                  className={`booking__service ${professionalId === 'ANY' ? 'booking__service--active' : ''}`}
                >
                  <strong>Sem preferência</strong>
                  <span>Qualquer profissional disponível</span>
                </button>
                
                {professionalsList?.map((prof) => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => handleSelectProfessional(prof.id)}
                    className={`booking__service ${professionalId === prof.id ? 'booking__service--active' : ''}`}
                  >
                    <strong>{prof.name}</strong>
                    <span>Especialista</span>
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {serviceId && professionalId && (
            <motion.section {...fadeIn}>
              <h2>3. Escolha a data</h2>
              <Calendar selected={date} onSelect={handleSelectDate} />
            </motion.section>
          )}

          {serviceId && professionalId && date && (
            <motion.section {...fadeIn}>
              <h2>4. Escolha o horário</h2>

              {loadingSlots && <p>Buscando horários...</p>}

              {available && available.slots.length === 0 && (
                <p className="booking__empty">Nenhum horário livre neste dia. Tente outra data.</p>
              )}

              <div className="booking__slots">
                {available?.slots.map((s) => (
                  <button
                    key={s.startTime}
                    type="button"
                    onClick={() => setSlot(s)}
                    className={`booking__slot ${slot?.startTime === s.startTime ? 'booking__slot--active' : ''}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {selectedService && professionalId && date && slot && (
            <motion.section {...fadeIn} className="booking__summary">
              <h2>Resumo</h2>
              <p>{selectedService.name}</p>
              <p>Profissional: {
                professionalId === 'ANY' 
                  ? 'Sem preferência' 
                  : professionalsList?.find(p => p.id === professionalId)?.name || 'Profissional'
              }</p>
              <p>{format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })} às {slot.label}</p>

              {isAdmin ? (
                <div className="booking__client">
                  <label>
                    Nome do cliente
                    <input
                      type="text"
                      placeholder="Ex: João Silva"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </label>
                  <label>
                    Telefone do cliente
                    <input
                      type="tel"
                      placeholder="(21) 90000-0000"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </label>
                </div>
              ) : (
                <div className="booking__client" style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--color-line)' }}>
                  <p style={{ color: 'var(--color-muted)', marginBottom: '12px', fontSize: '0.95rem' }}>Forma de pagamento</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      className={`booking__service ${paymentMethod === 'PIX' ? 'booking__service--active' : ''}`}
                      onClick={() => setPaymentMethod('PIX')}
                      style={{ padding: '14px' }}
                    >
                      <strong>Pix Automático</strong>
                      <span style={{ fontSize: '0.85rem' }}>Aprovação imediata (QR Code)</span>
                    </button>
                    
                    <button
                      type="button"
                      className={`booking__service ${paymentMethod === 'PIX_MANUAL' ? 'booking__service--active' : ''}`}
                      onClick={() => setPaymentMethod('PIX_MANUAL')}
                      style={{ padding: '14px' }}
                    >
                      <strong>Pix Manual</strong>
                      <span style={{ fontSize: '0.85rem' }}>Chave celular/email</span>
                    </button>

                    <button
                      type="button"
                      className={`booking__service ${paymentMethod === 'CASH' ? 'booking__service--active' : ''}`}
                      onClick={() => setPaymentMethod('CASH')}
                      style={{ padding: '14px' }}
                    >
                      <strong>Dinheiro</strong>
                      <span style={{ fontSize: '0.85rem' }}>Pagamento no local</span>
                    </button>
                  </div>

                  {paymentMethod === 'CASH' && (
                    <label style={{ marginTop: '16px' }}>
                      Precisa de troco para quanto? (Opcional)
                      <input
                        type="number"
                        placeholder={`Valor do serviço: R$ ${selectedService.price}`}
                        value={changeFor}
                        onChange={(e) => setChangeFor(e.target.value)}
                      />
                    </label>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirm}
                disabled={createAppointment.isPending || manualDataInvalid}
                className="btn btn--primary"
                style={{ width: '100%', marginTop: '16px' }}
              >
                {createAppointment.isPending
                  ? 'Reservando...'
                  : isAdmin
                    ? 'Confirmar reserva manual'
                    : 'Confirmar reserva'}
              </button>
            </motion.section>
          )}
        </>
      )}
    </main>
  );
}