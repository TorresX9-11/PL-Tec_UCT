import { z } from 'zod';

/**
 * Schemas zod para el recurso `coordinadores`.
 * Mapean 1:1 a la tabla `coordinadores` definida en database/schema.sql.
 */

/**
 * Representación completa de un coordinador (output / row de DB).
 */
export const CoordinadorSchema = z.object({
  id_coordinador: z.number().int().positive(),
  correo_usuario: z.string().email().max(32).nullable(),
  id_carrera: z.string().max(4).nullable(),
});
export type Coordinador = z.infer<typeof CoordinadorSchema>;

/**
 * Body para POST /coordinadores (create).
 */
export const CreateCoordinadorSchema = z.object({
  correo_usuario: z.string().email().max(32).nullable().optional(),
  id_carrera: z.string().trim().max(4).nullable().optional(),
});
export type CreateCoordinadorInput = z.infer<typeof CreateCoordinadorSchema>;

/**
 * Body para PUT /coordinadores/:id (full update). El id viene del path, no del body.
 */
export const UpdateCoordinadorSchema = z.object({
  correo_usuario: z.string().email().max(32).nullable().optional(),
  id_carrera: z.string().trim().max(4).nullable().optional(),
});
export type UpdateCoordinadorInput = z.infer<typeof UpdateCoordinadorSchema>;

/**
 * Param :id_coordinador del path.
 */
export const CoordinadorIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Body para POST /coordinadores/:id/credenciales.
 * Crea o actualiza el usuario asociado (nivel 'coordinador') del coordinador.
 */
export const GestionarCredencialesSchema = z.object({
  correo_usuario: z.string().email().max(32),
  nombre: z.string().trim().min(1).max(128),
  contrasena: z.string().min(8).max(255),
});
export type GestionarCredencialesInput = z.infer<typeof GestionarCredencialesSchema>;

/**
 * Body para POST /coordinadores/:id/reset-password.
 * Resetea únicamente la contraseña del usuario asociado.
 */
export const ResetPasswordSchema = z.object({
  contrasena: z.string().min(8).max(255),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

/**
 * Body para PUT /coordinadores/:id/carrera.
 * `id_carrera` null para desasignar la carrera del coordinador.
 */
export const AsignarCarreraSchema = z.object({
  id_carrera: z.string().trim().max(4).nullable(),
});
export type AsignarCarreraInput = z.infer<typeof AsignarCarreraSchema>;
