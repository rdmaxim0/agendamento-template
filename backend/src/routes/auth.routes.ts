import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../server.js';

export const authRoutes = Router();

// Zod: Define as regras estritas para criar uma conta com CPF e Sobrenome
const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  lastName: z.string().min(2, "O sobrenome é obrigatório."),
  cpf: z.string().min(11, "CPF inválido."),
  email: z.string().email("Formato de e-mail inválido."),
  password: z.string().min(6, "A palavra-passe deve ter no mínimo 6 caracteres."),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'ADMIN']).default('CUSTOMER'),
});

authRoutes.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const userExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userExists) {
      return res.status(400).json({ error: "Este e-mail já está em uso." });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        lastName: data.lastName,
        cpf: data.cpf,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        phone: data.phone || null,
      },
    });

    return res.status(201).json({
      message: "Conta criada com sucesso!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error: any) {
    console.error("🚨 ERRO REAL NO REGISTO:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});

// Zod: Validação para o Login
const loginSchema = z.object({
  email: z.string().email("Formato de e-mail inválido."),
  password: z.string().min(1, "A palavra-passe é obrigatória."),
});

authRoutes.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return res.json({
      message: "Login efetuado com sucesso!",
      token,
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error: any) {
    console.error("🚨 ERRO REAL NO REGISTO:", error); 
    
    // Interceta o erro de duplicação do Prisma (P2002)
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('cpf')) {
        return res.status(400).json({ error: "Este CPF já está cadastrado no sistema." });
      }
      if (error.meta?.target?.includes('email')) {
        return res.status(400).json({ error: "Este e-mail já está em uso." });
      }
    }

    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.issues });
    }
    return res.status(500).json({ error: "Erro interno do servidor." });
  }
});