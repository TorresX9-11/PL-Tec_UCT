import { z } from 'zod';

/**
 * Schemas zod para el recurso `docentes`.
 * Mapean 1:1 a la tabla `docentes` definida en database/schema.sql.
 */

export const NivelDocenteSchema = z.enum(['A', 'B', 'C']);
export type NivelDocente = z.infer<typeof NivelDocenteSchema>;

/**
 * Representación completa de un docente (output / row de DB).
 */
export const DocenteSchema = z.object({
  rut_docente: z.number().int().positive(),
  dv: z.string().length(1),
  correo_usuario: z.string().email().max(32).nullable(),
  contacto: z.string().max(12).nullable(),
  nombre: z.string().min(1).max(64),
  nivel_docente: NivelDocenteSchema.nullable(),
});
export type Docente = z.infer<typeof DocenteSchema>;

/**
 * Body para POST /docentes (create).
 */
export const CreateDocenteSchema = z.object({
  rut_docente: z.coerce.number().int().positive(),
  dv: z.string().length(1),
  correo_usuario: z.string().email().max(32).nullable().optional(),
  contacto: z.string().max(12).nullable().optional(),
  nombre: z.string().trim().min(1).max(64),
  nivel_docente: NivelDocenteSchema.nullable().optional(),
});
export type CreateDocenteInput = z.infer<typeof CreateDocenteSchema>;

/**
 * Body para PUT /docentes/:id (full update). El id viene del path, no del body.
 */
export const UpdateDocenteSchema = z.object({
  dv: z.string().length(1).optional(),
  correo_usuario: z.string().email().max(32).nullable().optional(),
  contacto: z.string().max(12).nullable().optional(),
  nombre: z.string().trim().min(1).max(64).optional(),
  nivel_docente: NivelDocenteSchema.nullable().optional(),
});
export type UpdateDocenteInput = z.infer<typeof UpdateDocenteSchema>;

/**
 * Param :rut_docente del path.
 */
export const DocenteIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
