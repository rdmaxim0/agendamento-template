import { prisma } from '../server.js';
import { getPixPayment } from './mercadopago.js';

// Consulta o Mercado Pago e atualiza a reserva se o pagamento foi aprovado
export async function syncAppointmentPayment(appointmentId: string) {
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });

  if (!appointment || !appointment.paymentId) return null;

  const payment = await getPixPayment(appointment.paymentId);
  let appointmentStatus = appointment.status;

  if (payment.status === 'approved') {
    if (appointment.status === 'PENDING') {
      // updateMany com "status: PENDING" no where protege contra corrida:
      // só confirma se ainda estiver pendente naquele instante
      await prisma.appointment.updateMany({
        where: { id: appointment.id, status: 'PENDING' },
        data: { status: 'CONFIRMED' },
      });
      appointmentStatus = 'CONFIRMED';
    } else if (appointment.status === 'CANCELLED') {
      // Caso de borda: o cliente pagou DEPOIS do cron cancelar a reserva.
      // Por enquanto só avisamos no log (precisaria de reembolso manual).
      console.warn(`[PIX] Pagamento aprovado para reserva já cancelada: ${appointment.id}`);
    }
  }

  return {
    appointmentStatus,
    paymentStatus: payment.status,
    // O QR só faz sentido enquanto o pagamento está pendente
    qrCode: payment.status === 'pending' ? payment.qrCode : null,
    qrCodeBase64: payment.status === 'pending' ? payment.qrCodeBase64 : null,
  };
}