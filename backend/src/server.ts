import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import { startCancelExpiredJob } from './jobs/cancelExpiredAppointments.js';

// 1. As importações de TODAS as rotas
import { authRoutes } from './routes/auth.routes.js';
import { serviceRoutes } from './routes/service.routes.js'; 
import { appointmentRoutes } from './routes/appointment.routes.js';

export const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Endereços do seu Vite
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

// 2. O Express liga os URLs aos ficheiros de rotas correspondentes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes); 
app.use('/api/appointments', appointmentRoutes);

// Rota de Teste do Motor
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