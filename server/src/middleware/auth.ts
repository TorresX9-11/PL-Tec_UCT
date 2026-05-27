import type { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from './error.js';

/**
 * Niveles de usuario según schema.sql → usuarios.nivel.
 */
export type UserLevel = 'docente' | 'coordinador' | 'academico' | 'admin';

export interface AuthPayload {
  correo: string;
  nivel: UserLevel;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * Firma un JWT con el payload mínimo. Usar al hacer login.
 */
export function signToken(payload: AuthPayload): string {
  const opts: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, opts);
}

/**
 * Middleware que exige Bearer token válido. Aún NO se aplica a rutas por defecto;
 * se monta selectivamente cuando se implemente el flujo de login.
 *
 * Uso:
 *   router.get('/me', requireAuth, handler);
 *   router.delete('/x', requireAuth, requireLevel('admin'), handler);
 */
export const requireAuth: RequestHandler = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new HttpError(401, 'UNAUTHENTICATED', 'Falta token de autenticación.'));
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    next(new HttpError(401, 'INVALID_TOKEN', 'Token inválido o expirado.'));
  }
};

/**
 * Middleware que exige uno de los niveles permitidos. Encadenar tras requireAuth.
 */
export const requireLevel =
  (...allowed: UserLevel[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      return next(new HttpError(401, 'UNAUTHENTICATED', 'Sesión requerida.'));
    }
    if (!allowed.includes(req.user.nivel)) {
      return next(new HttpError(403, 'FORBIDDEN', 'Nivel de usuario insuficiente.'));
    }
    next();
  };
