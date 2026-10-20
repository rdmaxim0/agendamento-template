import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('A limpar o banco de dados para o novo seed premium...');
  
  // Limpa as tabelas existentes
  await prisma.appointment.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  // 1. Criar Utilizador Administrador
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@salao.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '21999999999'
    },
  });

  // 2. Criar Serviços Separados por Área
  const svcHairCut = await prisma.service.create({ data: { name: 'Corte Feminino Premium', duration: 60, price: 120.00, description: 'Corte com visagismo, lavagem especial e finalização.' }});
  const svcColor = await prisma.service.create({ data: { name: 'Coloração / Mechas', duration: 150, price: 350.00, description: 'Técnicas modernas de iluminação e coloração com proteção dos fios.' }});
  const svcNails = await prisma.service.create({ data: { name: 'Manicure e Pedicure', duration: 90, price: 70.00, description: 'Cuidado completo das unhas com esmaltação premium e hidratação.' }});
  const svcGel = await prisma.service.create({ data: { name: 'Alongamento em Gel', duration: 120, price: 180.00, description: 'Unhas longas, naturais e resistentes com manutenção.' }});
  const svcAesthetics = await prisma.service.create({ data: { name: 'Limpeza de Pele Profunda', duration: 90, price: 150.00, description: 'Limpeza com extração, peeling ultrassônico e máscara calmante.' }});
  const svcMassage = await prisma.service.create({ data: { name: 'Massagem Relaxante', duration: 60, price: 130.00, description: 'Massagem corporal completa com óleos essenciais para aliviar a tensão.' }});
  const svcBarber = await prisma.service.create({ data: { name: 'Corte Degradê Premium', duration: 45, price: 50.00, description: 'Corte masculino moderno com acabamento impecável na navalha.' }});
  const svcBeard = await prisma.service.create({ data: { name: 'Barboterapia', duration: 30, price: 40.00, description: 'Tratamento de barba com toalha quente, massagem facial e hidratação.' }});
  const svcBrows = await prisma.service.create({ data: { name: 'Design de Sobrancelha', duration: 30, price: 45.00, description: 'Mapeamento facial e design com aplicação opcional de henna.' }});

  // 3. Criar Profissionais e Vincular Especialidades
  await prisma.professional.create({
    data: {
      name: 'Sofia Hairstylist',
      isActive: true,
      services: { connect: [{ id: svcHairCut.id }, { id: svcColor.id }, { id: svcBrows.id }] }
    }
  });

  await prisma.professional.create({
    data: {
      name: 'Rafael Barbeiro',
      isActive: true,
      services: { connect: [{ id: svcBarber.id }, { id: svcBeard.id }] }
    }
  });

  await prisma.professional.create({
    data: {
      name: 'Camila Nail Designer',
      isActive: true,
      services: { connect: [{ id: svcNails.id }, { id: svcGel.id }] }
    }
  });

  await prisma.professional.create({
    data: {
      name: 'Amanda Estética',
      isActive: true,
      services: { connect: [{ id: svcAesthetics.id }, { id: svcMassage.id }, { id: svcBrows.id }] }
    }
  });

  await prisma.professional.create({
    data: {
      name: 'Lucas Estilo',
      isActive: true,
      services: { connect: [{ id: svcHairCut.id }, { id: svcColor.id }, { id: svcBarber.id }] }
    }
  });

  console.log('✅ Seed concluído: Salão Premium configurado com nova equipa e serviços!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });