import { z } from 'zod';

/**
 * Schemas zod para autenticación.
 */

/**
 * Body para POST /auth/login.
 */
export const LoginSchema = z.object({
  correo_usuario: z.string().email().max(32),
  contrasena: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Respuesta de login exitoso.
 */
export const LoginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    correo: z.string(),
    nivel: z.enum(['docente', 'coordinador', 'academico', 'admin']),
  }),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
