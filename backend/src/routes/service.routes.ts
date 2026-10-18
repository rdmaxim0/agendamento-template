import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../server.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.middleware.js';

export const serviceRoutes = Router();

// Zod: Regras obrigatórias para cadastrar um serviço
const serviceSchema = z.object({
  name: z.string().min(2, "O nome do serviço é obrigatório."),
  description: z.string().optional(),
  price: z.number().positive("O preço deve ser maior que zero."),
  duration: z.number().int().positive("A duração (em minutos) é obrigatória."),
});

// .partial() torna todos os campos opcionais: no PUT o admin pode
// mandar só o que quer alterar (ex: apenas o preço)
const updateServiceSchema = serviceSchema.partial();

// GET /api/services -> Pública (para os clientes verem os serviços disponíveis)
serviceRoutes.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json(services);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao carregar serviços." });
  }
});

// POST /api/services -> Só ADMIN
// verifyToken descobre quem é o usuário; verifyAdmin confere se ele é ADMIN.
// (Antes só havia o verifyToken, o que deixava qualquer cliente logado criar serviços.)
serviceRoutes.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const data = serviceSchema.parse(req.body);

    const newService = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description ?? null, // sem descrição vira null no banco
        price: data.price,
        duration: data.duration,
      },
    });

    return res.status(201).json({
      message: "Serviço adicionado com sucesso!",
      service: newService,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// PUT /api/services/:id -> Só ADMIN (edita um serviço)
serviceRoutes.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const data = updateServiceSchema.parse(req.body);

    // Remove os campos undefined antes de enviar ao Prisma
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined)
    );

    const service = await prisma.service.update({
      // "as string": o TypeScript não tem certeza de que o param é uma string simples
      where: { id: req.params.id as string },
      data: cleanData,
    });

    return res.json({ message: "Serviço atualizado!", service });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    // P2025 = código do Prisma para "registro não encontrado"
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Serviço não encontrado." });
    }
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// DELETE /api/services/:id -> Só ADMIN (remove um serviço)
serviceRoutes.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const serviceId = req.params.id as string;

    // Se existem reservas ligadas a esse serviço, o banco não deixa apagar
    // (chave estrangeira). Avisamos antes, com uma mensagem clara.
    const linked = await prisma.appointment.count({
      where: { serviceId },
    });

    if (linked > 0) {
      return res.status(409).json({
        error: "Este serviço possui agendamentos e não pode ser removido.",
      });
    }

    await prisma.service.delete({ where: { id: serviceId } });

    // 204 = sucesso, sem conteúdo para devolver
    return res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Serviço não encontrado." });
    }
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});