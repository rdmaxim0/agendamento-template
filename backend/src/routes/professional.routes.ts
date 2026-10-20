import { Router } from 'express';
import { prisma } from '../server.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';
import { z } from 'zod';

export const professionalRoutes = Router();

// CLIENTES: Busca os profissionais ativos
professionalRoutes.get('/', async (req, res) => {
  const { serviceId } = req.query;
  try {
    const professionals = await prisma.professional.findMany({
      where: {
        isActive: true,
        ...(serviceId ? { services: { some: { id: String(serviceId) } } } : {})
      },
      select: { id: true, name: true }
    });
    return res.json(professionals);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar profissionais." });
  }
});

// ADMIN: Lista todos os profissionais (incluindo inativos)
professionalRoutes.get('/admin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const professionals = await prisma.professional.findMany({
      orderBy: { createdAt: 'asc' }
    });
    return res.json(professionals);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar equipa." });
  }
});

// ADMIN: Cria um novo profissional
professionalRoutes.post('/', verifyToken, verifyAdmin, async (req: any, res: any) => {
  try {
    const { name } = z.object({ name: z.string().min(2) }).parse(req.body);
    
    // Liga automaticamente a todos os serviços para facilitar
    const allServices = await prisma.service.findMany({ select: { id: true } });
    
    const prof = await prisma.professional.create({
      data: {
        name,
        services: { connect: allServices }
      }
    });
    return res.status(201).json(prof);
  } catch (error) {
    return res.status(400).json({ error: "Dados inválidos." });
  }
});

// ADMIN: Ativa ou inativa um profissional
professionalRoutes.patch('/:id', verifyToken, verifyAdmin, async (req: any, res: any) => {
  try {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    const prof = await prisma.professional.update({
      where: { id: req.params.id },
      data: { isActive }
    });
    return res.json(prof);
  } catch (error) {
    return res.status(400).json({ error: "Dados inválidos." });
  }
});