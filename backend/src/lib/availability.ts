import { prisma } from '../server.js';
import { startOfDay, endOfDay, parseISO, setHours, setMinutes, isBefore, isAfter, addMinutes } from 'date-fns';

export async function getAvailableSlots(
  dateString: string, 
  serviceDuration: number,
  serviceId: string,              // NOVO: Precisamos saber o serviço
  professionalId?: string | null  // NOVO: E o profissional (se escolhido)
) {
  const date = parseISO(dateString);
  
  // CONFIGURAÇÕES DO ESTABELECIMENTO
  const workStartHour = 9;   // Abre às 09:00
  const workEndHour = 19;    // Fecha às 19:00
  const lunchStartHour = 12; // Início do almoço
  const lunchEndHour = 13;   // Fim do almoço
  const intervalMinutes = 30; // Mostrar horários a cada 30 min (09:00, 09:30, 10:00)

  // 1. Busca os profissionais ativos que realizam ESTE serviço
  const professionals = await prisma.professional.findMany({
    where: {
      isActive: true,
      services: { some: { id: serviceId } }
    }
  });

  // Se não há ninguém cadastrado/ativo para este serviço, não há vagas
  if (professionals.length === 0) return [];

  // 2. Filtro base de agendamentos do dia
  const appointmentFilter: any = {
    startTime: { gte: startOfDay(date), lte: endOfDay(date) },
    status: { not: 'CANCELLED' }
  };

  // Se escolheu um profissional, filtramos a agenda só dele. 
  // Se for "Sem preferência", pegamos a agenda de TODOS que fazem o serviço.
  if (professionalId) {
    appointmentFilter.professionalId = professionalId;
  } else {
    appointmentFilter.professionalId = { in: professionals.map(p => p.id) };
  }

  const appointments = await prisma.appointment.findMany({
    where: appointmentFilter
  });

  const slots: Date[] = [];
  const now = new Date();

  // 3. Gera os blocos de horário
  for (let h = workStartHour; h < workEndHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const slotStart = setMinutes(setHours(date, h), m);
      const slotEnd = addMinutes(slotStart, serviceDuration);

      // Regra 1: Horário passado
      if (isBefore(slotStart, now)) continue;

      // Regra 2: O serviço não pode terminar depois do horário de fechar
      if (isAfter(slotEnd, setHours(date, workEndHour))) continue;
      
      // Regra 3: O serviço não pode invadir a hora de almoço
      const lunchStart = setHours(date, lunchStartHour);
      const lunchEnd = setHours(date, lunchEndHour);
      if (isBefore(slotStart, lunchEnd) && isAfter(slotEnd, lunchStart)) continue;

      // Regra 4: Detetor de Colisão (A mágica do Salão)
      let isAvailable = false;

      if (professionalId) {
        // Se o cliente quer um profissional específico, vemos se ELE tem colisão
        const isOverlapping = appointments.some(appt => {
          return isBefore(slotStart, appt.endTime) && isAfter(slotEnd, appt.startTime);
        });
        isAvailable = !isOverlapping;
      } else {
        // SEM PREFERÊNCIA: Verificamos se há pelo menos UM profissional livre neste horário
        for (const prof of professionals) {
          const profAppointments = appointments.filter(a => a.professionalId === prof.id);
          const isOverlapping = profAppointments.some(appt => {
            return isBefore(slotStart, appt.endTime) && isAfter(slotEnd, appt.startTime);
          });
          
          if (!isOverlapping) {
            isAvailable = true; // Achamos um livre! O horário fica disponível para o cliente
            break; 
          }
        }
      }

      if (isAvailable) {
        slots.push(slotStart);
      }
    }
  }

  return slots;  
}