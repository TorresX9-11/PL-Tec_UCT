import { z } from 'zod';

/**
 * Schemas zod para el recurso `propuestas`.
 * Mapean 1:1 a la tabla `propuestas` definida en database/schema.sql.
 */

/**
 * Representación completa de una propuesta (output / row de DB).
 */
export const PropuestaSchema = z.object({
  id_propuesta: z.number().int().positive(),
  rut_docente: z.number().int().positive(),
  valor_propuesta: z.number().int().positive(),
  cuotas: z.number().int().min(1).max(12),
});
export type Propuesta = z.infer<typeof PropuestaSchema>;

/**
 * Body para POST /propuestas (create).
 * El ID se genera automáticamente en la base de datos.
 */
export const CreatePropuestaSchema = z.object({
  rut_docente: z.coerce.number().int().positive(),
  valor_propuesta: z.coerce.number().int().positive(),
  cuotas: z.coerce.number().int().min(1).max(12),
});
export type CreatePropuestaInput = z.infer<typeof CreatePropuestaSchema>;

/**
 * Body para PUT /propuestas/:id (full update). El id viene del path, no del body.
 */
export const UpdatePropuestaSchema = z.object({
  rut_docente: z.coerce.number().int().positive().optional(),
  valor_propuesta: z.coerce.number().int().positive().optional(),
  cuotas: z.coerce.number().int().min(1).max(12).optional(),
});
export type UpdatePropuestaInput = z.infer<typeof UpdatePropuestaSchema>;

/**
 * Param :id_propuesta del path.
 */
export const PropuestaIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
