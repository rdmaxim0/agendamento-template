import { Resend } from 'resend';

// Inicializa o Resend com a chave do .env
const resend = new Resend(process.env.RESEND_API_KEY);

// O seu e-mail de administrador (onde vai receber os avisos de novas reservas)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string;

export async function sendAppointmentEmail(
  clientEmail: string,
  clientName: string,
  serviceName: string,
  dateLabel: string,
  statusLabel: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY não configurada. E-mail ignorado.");
    return;
  }

  try {
    // 1. E-mail para o Cliente
    await resend.emails.send({
      from: 'Barbearia <onboarding@resend.dev>', // O Resend usa este remetente na versão gratuita
      to: clientEmail,
      subject: 'Detalhes da sua reserva',
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h2>Olá, ${clientName}!</h2>
          <p>Recebemos a sua solicitação de agendamento. Aqui estão os detalhes:</p>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Serviço:</strong> ${serviceName}</p>
            <p><strong>Data e Hora:</strong> ${dateLabel}</p>
            <p><strong>Status:</strong> ${statusLabel}</p>
          </div>
          <p>Se escolheu pagar no local ou via Pix manual, aguarde a nossa confirmação.</p>
          <p>Obrigado pela preferência!</p>
        </div>
      `
    });

    // 2. E-mail para o Administrador (Você)
    await resend.emails.send({
      from: 'Sistema de Reservas <onboarding@resend.dev>',
      to: ADMIN_EMAIL,
      subject: `NOVA RESERVA: ${serviceName} - ${clientName}`,
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Nova Solicitação Recebida!</h2>
          <ul>
            <li><strong>Cliente:</strong> ${clientName} (${clientEmail})</li>
            <li><strong>Serviço:</strong> ${serviceName}</li>
            <li><strong>Horário:</strong> ${dateLabel}</li>
            <li><strong>Status/Pagamento:</strong> ${statusLabel}</li>
          </ul>
          <p>Acesse o painel de administração para gerir esta reserva.</p>
        </div>
      `
    });

    console.log(`📧 E-mails de notificação enviados com sucesso para ${clientEmail} e Admin.`);
  } catch (error) {
    console.error("❌ Erro ao enviar e-mails de notificação:", error);
  }
}