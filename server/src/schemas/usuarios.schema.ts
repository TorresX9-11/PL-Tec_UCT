import { z } from 'zod';

/**
 * Schemas zod para el recurso `usuarios`.
 * Mapean 1:1 a la tabla `usuarios` definida en database/schema.sql.
 */

export const NivelSchema = z.enum(['docente', 'coordinador', 'academico', 'supervisor', 'admin']);
export type Nivel = z.infer<typeof NivelSchema>;

/**
 * Representación completa de un usuario (output / row de DB).
 * NOTA: contrasena no se incluye en el output por seguridad.
 */
export const UsuarioSchema = z.object({
  correo_usuario: z.string().min(1).max(32),
  nombre: z.string().min(1).max(128),
  nivel: NivelSchema,
});
export type Usuario = z.infer<typeof UsuarioSchema>;

/**
 * Body para POST /usuarios (create).
 * NOTA: contrasena se hashea con bcrypt antes de guardar.
 */
export const CreateUsuarioSchema = z.object({
  correo_usuario: z.string().email().max(32),
  nombre: z.string().trim().min(1).max(128),
  contrasena: z.string().min(1).max(255),
  nivel: NivelSchema.default('docente'),
});
export type CreateUsuarioInput = z.infer<typeof CreateUsuarioSchema>;

/**
 * Body para PUT /usuarios/:id (full update). El id viene del path, no del body.
 * contrasena es opcional en update (si no se envía, no se cambia).
 */
export const UpdateUsuarioSchema = z.object({
  nombre: z.string().trim().min(1).max(128).optional(),
  contrasena: z.string().min(1).max(255).optional(),
  nivel: NivelSchema.optional(),
});
export type UpdateUsuarioInput = z.infer<typeof UpdateUsuarioSchema>;

/**
 * Param :correo_usuario del path.
 */
export const UsuarioIdParamSchema = z.object({
  id: z.string().email().max(32),
});
