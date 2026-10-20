import { Router } from 'express';
import { sendAppointmentEmail } from '../lib/email.js';
import { z } from 'zod';
import { prisma } from '../server.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';
import type { AuthRequest } from '../middlewares/auth.middleware.js';
import { getAvailableSlots } from '../lib/availability.js';
import { createPixPayment, getPixPayment } from '../lib/mercadopago.js';

export const appointmentRoutes = Router();

const availableSchema = z.object({
  serviceId: z.string().min(1, "O serviço é obrigatório."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use o formato AAAA-MM-DD."),
  professionalId: z.string().nullable().optional().transform(val => val === 'null' ? null : val),
});

const createSchema = z.object({
  serviceId: z.string().min(1, "O serviço é obrigatório."),
  professionalId: z.string().nullable().optional(),
  startTime: z.coerce.date(),
  customerName: z.string().min(2, "O nome do cliente é obrigatório.").optional(),
  customerPhone: z.string().min(8, "O telefone do cliente é obrigatório.").optional(),
  paymentMethod: z.enum(['PIX', 'PIX_MANUAL', 'CASH']).optional().default('PIX'),
  changeFor: z.number().positive().optional(),
});

const listSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']).optional(),
});

appointmentRoutes.get('/available', async (req, res) => {
  try {
    const { serviceId, date, professionalId } = availableSchema.parse(req.query);
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ error: "Serviço não encontrado." });

    const slots = await getAvailableSlots(date, service.duration, service.id, professionalId);

    return res.json({
      date,
      service: service.name,
      slots: slots.map((s) => ({
        startTime: s.toISOString(),
        label: s.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }),
      })),
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

appointmentRoutes.post('/', verifyToken, async (req: AuthRequest, res: any) => {
  try {
    const { serviceId, professionalId, startTime, customerName, customerPhone, paymentMethod, changeFor } = createSchema.parse(req.body);
    const isAdmin = req.userRole === 'ADMIN';

    if (!isAdmin && (customerName !== undefined || customerPhone !== undefined)) {
      return res.status(403).json({ error: "Apenas administradores podem agendar em nome de um cliente." });
    }
    if (isAdmin && (!customerName || !customerPhone)) {
      return res.status(400).json({ error: "Informe o nome e o telefone do cliente." });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return res.status(404).json({ error: "Serviço não encontrado." });

    if (paymentMethod === 'CASH' && changeFor && changeFor < service.price) {
      return res.status(400).json({ error: "O valor para troco não pode ser inferior ao preço do serviço." });
    }

    const date = startTime.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
    const slots = await getAvailableSlots(date, service.duration, service.id, professionalId);
    const isFree = slots.some((s) => s.getTime() === startTime.getTime());

    if (!isFree) return res.status(409).json({ error: "Horário indisponível ou profissional ocupado. Escolha outro." });

    const endTime = new Date(startTime.getTime() + service.duration * 60_000);

    const appointment = await prisma.appointment.create({
      data: {
        userId: req.userId as string,
        serviceId,
        professionalId: professionalId || null,
        startTime,
        endTime,
        paymentMethod: isAdmin ? 'MANUAL' : paymentMethod,
        changeFor: paymentMethod === 'CASH' ? (changeFor || null) : null,
        ...(isAdmin && customerName && customerPhone
          ? { customerName, customerPhone, status: 'CONFIRMED' }
          : {}),
      },
    });

    if (isAdmin) {
      return res.status(201).json({ message: "Reserva manual criada e confirmada.", appointment });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId as string } });
    if (!user) return res.status(401).json({ error: "Usuário não encontrado." });

    const formattedDate = new Date(startTime).toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo', 
      dateStyle: 'short', 
      timeStyle: 'short' 
    });

    if (paymentMethod === 'PIX') {
      try {
        const pix = await createPixPayment({
          amount: service.price,
          description: service.name,
          payerEmail: user.email,
          payerFirstName: user.name || '',
          payerLastName: user.lastName || '',
          payerCpf: user.cpf || '19119119100',
          appointmentId: appointment.id,
        });

        const updated = await prisma.appointment.update({
          where: { id: appointment.id },
          data: { paymentId: pix.paymentId },
        });

        await sendAppointmentEmail(user.email, user.name, service.name, formattedDate, 'Aguardando pagamento Pix');

        return res.status(201).json({
          message: "Reserva criada! Aguardando pagamento.",
          appointment: updated,
          paymentMode: 'PIX_AUTO',
          pix: { qrCode: pix.qrCode, qrCodeBase64: pix.qrCodeBase64 },
        });
      } catch (paymentError) {
        console.error('[PIX] Erro ao gerar pagamento:', paymentError);
        await prisma.appointment.update({ where: { id: appointment.id }, data: { status: 'CANCELLED' } });
        return res.status(502).json({ error: "Não foi possível gerar o Pix. Tente novamente." });
      }
    }

    const statusTxt = paymentMethod === 'CASH' ? 'Pendente de aprovação (Dinheiro)' : 'Aguardando Pix Manual';
    await sendAppointmentEmail(user.email, user.name, service.name, formattedDate, statusTxt);

    return res.status(201).json({
      message: "Reserva registada com sucesso!",
      appointment,
      paymentMode: paymentMethod
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

appointmentRoutes.get('/me', verifyToken, async (req: AuthRequest, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: req.userId as string },
      include: { 
        service: { select: { name: true, price: true, duration: true } },
        professional: { select: { name: true } }
      },
      orderBy: { startTime: 'desc' },
    });
    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

appointmentRoutes.get('/:id/payment', verifyToken, async (req: AuthRequest, res: any) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id as string },
    });

    if (!appointment) return res.status(404).json({ error: "Reserva não encontrada." });
    if (appointment.userId !== req.userId) return res.status(403).json({ error: "Você não pode consultar esta reserva." });
    
    if (appointment.paymentMethod !== 'PIX' || !appointment.paymentId) {
      return res.status(409).json({ error: "Esta reserva não possui pagamento Pix Automático." });
    }

    const paymentInfo = await getPixPayment(appointment.paymentId);

    if (paymentInfo.status === 'approved' && appointment.status !== 'CONFIRMED') {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'CONFIRMED' }
      });
    }

    return res.json({
      appointmentStatus: paymentInfo.status === 'approved' ? 'CONFIRMED' : appointment.status,
      payment: paymentInfo
    });
  } catch (error) {
    console.error('[PIX] Erro ao consultar pagamento:', error);
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

appointmentRoutes.patch('/:id/cancel', verifyToken, async (req: AuthRequest, res: any) => {
  try {
    const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id as string } });
    if (!appointment) return res.status(404).json({ error: "Reserva não encontrada." });

    const isOwner = appointment.userId === req.userId;
    const isAdmin = req.userRole === 'ADMIN';

    if (!isOwner && !isAdmin) return res.status(403).json({ error: "Acesso negado." });
    if (appointment.status === 'CANCELLED') return res.status(409).json({ error: "Reserva já cancelada." });

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'CANCELLED' },
    });

    return res.json({ message: "Reserva cancelada.", appointment: updated });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

appointmentRoutes.get('/', verifyToken, verifyAdmin, async (req, res: any) => {
  try {
    const { status } = listSchema.parse(req.query);
    const appointments = await prisma.appointment.findMany({
      where: { ...(status !== undefined && { status }) },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        service: { select: { name: true, price: true } },
        professional: { select: { name: true } }
      },
      orderBy: { startTime: 'asc' },
    });
    return res.json(appointments);
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ errors: error.issues });
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

appointmentRoutes.patch('/:id/confirm', verifyToken, verifyAdmin, async (req, res: any) => {
  try {
    const appointment = await prisma.appointment.findUnique({ where: { id: req.params.id as string } });
    if (!appointment) return res.status(404).json({ error: "Reserva não encontrada." });
    if (appointment.status !== 'PENDING') return res.status(409).json({ error: "Só reservas PENDING podem ser confirmadas." });

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'CONFIRMED' },
    });

    return res.json({ message: "Reserva confirmada.", appointment: updated });
  } catch (error) {
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});