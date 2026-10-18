import cron from 'node-cron';
import { prisma } from '../server.js';

// Tempo máximo (em minutos) que uma reserva pode ficar aguardando pagamento
const PENDING_LIMIT_MINUTES = 10;

export function startCancelExpiredJob() {
  // "* * * * *" = roda a cada 1 minuto
  // (a ordem é: minuto hora dia-do-mês mês dia-da-semana)
  cron.schedule('* * * * *', async () => {
    try {
      // Calcula o "limite": agora menos 10 minutos.
      // Reservas criadas ANTES desse momento já expiraram.
      const limit = new Date(Date.now() - PENDING_LIMIT_MINUTES * 60_000);

      // updateMany altera vários registros de uma vez só
      const result = await prisma.appointment.updateMany({
        where: {
          status: 'PENDING',
          createdAt: { lt: limit }, // lt = "less than" (anterior a)
        },
        data: { status: 'CANCELLED' },
      });

      // Só escreve no terminal se algo foi cancelado, para não poluir o log
      if (result.count > 0) {
        console.log(`[CRON] ${result.count} reserva(s) expirada(s) cancelada(s).`);
      }
    } catch (error) {
      // Importante: um erro dentro do cron não pode derrubar o servidor
      console.error('[CRON] Erro ao cancelar reservas expiradas:', error);
    }
  });
}