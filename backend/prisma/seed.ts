import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando o banco de dados para o seed premium com fotos...');
  await prisma.appointment.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

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

  // Serviços com fotos premium
  const svcHairCut = await prisma.service.create({ data: { 
    name: 'Corte Feminino Premium', duration: 60, price: 120.00, 
    description: 'Corte com visagismo, lavagem especial e finalização.',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
  }});
  const svcColor = await prisma.service.create({ data: { 
    name: 'Coloração / Mechas', duration: 150, price: 350.00, 
    description: 'Técnicas modernas de iluminação e coloração.',
    imageUrl: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80'
  }});
  const svcNails = await prisma.service.create({ data: { 
    name: 'Manicure e Pedicure', duration: 90, price: 70.00, 
    description: 'Cuidado completo das unhas com esmaltação premium.',
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?auto=format&fit=crop&w=600&q=80'
  }});
  const svcAesthetics = await prisma.service.create({ data: { 
    name: 'Limpeza de Pele Profunda', duration: 90, price: 150.00, 
    description: 'Limpeza com extração, peeling ultrassônico e máscara.',
    imageUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=600&q=80'
  }});
  const svcBarber = await prisma.service.create({ data: { 
    name: 'Corte Degradê Premium', duration: 45, price: 50.00, 
    description: 'Corte masculino moderno com acabamento na navalha.',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80'
  }});

  // Profissionais com fotos (Avatares)
  await prisma.professional.create({
    data: {
      name: 'Sofia Hairstylist',
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      services: { connect: [{ id: svcHairCut.id }, { id: svcColor.id }] }
    }
  });

  await prisma.professional.create({
    data: {
      name: 'Rafael Barbeiro',
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
      services: { connect: [{ id: svcBarber.id }] }
    }
  });

  await prisma.professional.create({
    data: {
      name: 'Amanda Estética',
      isActive: true,
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
      services: { connect: [{ id: svcAesthetics.id }, { id: svcNails.id }] }
    }
  });

  console.log('✅ Seed finalizado: Equipe e Serviços com fotos criados!');
}

main().catch(console.error).finally(() => prisma.$disconnect());