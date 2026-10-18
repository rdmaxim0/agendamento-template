import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estendemos o Request do Express para guardar os dados do usuário logado
export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

// Middleware 1: confere se existe um token válido e descobre QUEM está logado
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: "Erro no formato do Token." });
  }

  // Ajuste: Forçamos o TypeScript a reconhecer o token estritamente como string
  const token = parts[1] as string;
  const secret = process.env.JWT_SECRET as string;

  if (!secret) {
    return res.status(500).json({ error: "Erro interno: JWT_SECRET não configurado." });
  }

  try {
    const decoded = jwt.verify(token, secret) as any;

    // Guardamos id e role para as próximas funções da rota usarem
    req.userId = decoded.id;
    req.userRole = decoded.role;

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

// Middleware 2: só deixa passar quem tem role ADMIN.
// IMPORTANTE: precisa rodar DEPOIS do verifyToken, que é quem preenche o req.userRole.
export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== 'ADMIN') {
    // 403 = "sei quem você é, mas você não tem permissão"
    // (diferente do 401, que é "não sei quem você é")
    return res.status(403).json({ error: "Acesso restrito a administradores." });
  }

  return next();
};