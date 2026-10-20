import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { startCancelExpiredJob } from './jobs/cancelExpiredAppointments.js';

import { authRoutes } from './routes/auth.routes.js';
import { serviceRoutes } from './routes/service.routes.js'; 
import { appointmentRoutes } from './routes/appointment.routes.js';
import { professionalRoutes } from './routes/professional.routes.js';

export const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado pelo CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  message: { error: 'Demasiados pedidos a partir deste IP. Tente novamente mais tarde.' }
});
app.use(limiter);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes); 
app.use('/api/appointments', appointmentRoutes);
app.use('/api/professionals', professionalRoutes);

app.get('/ping', async (req, res) => {
  const servicesCount = await prisma.service.count();
  
  return res.json({ 
    message: 'API Premium de Agendamento Online e Blindada!',
    servicosCadastrados: servicesCount
  });
});

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`Servidor Seguro a correr na porta ${PORT}`);
  startCancelExpiredJob();
});