import { z } from 'zod';

/**
 * Schemas zod para el recurso `capacitaciones`.
 * Mapean 1:1 a la tabla `capacitaciones` definida en database/schema.sql.
 */

/**
 * Representación completa de una capacitación (output / row de DB).
 */
export const CapacitacionSchema = z.object({
  id_capacitacion: z.number().int().positive(),
  rut_docente: z.number().int().positive().nullable(),
  titulo: z.string().max(64).nullable(),
  descripcion: z.string().nullable(),
});
export type Capacitacion = z.infer<typeof CapacitacionSchema>;

/**
 * Body para POST /capacitaciones (create).
 * El ID se genera automáticamente en la base de datos.
 */
export const CreateCapacitacionSchema = z.object({
  rut_docente: z.coerce.number().int().positive().nullable().optional(),
  titulo: z.string().trim().max(64).nullable().optional(),
  descripcion: z.string().trim().nullable().optional(),
});
export type CreateCapacitacionInput = z.infer<typeof CreateCapacitacionSchema>;

/**
 * Body para PUT /capacitaciones/:id (full update). El id viene del path, no del body.
 */
export const UpdateCapacitacionSchema = z.object({
  rut_docente: z.coerce.number().int().positive().nullable().optional(),
  titulo: z.string().trim().max(64).nullable().optional(),
  descripcion: z.string().trim().nullable().optional(),
});
export type UpdateCapacitacionInput = z.infer<typeof UpdateCapacitacionSchema>;

/**
 * Param :id_capacitacion del path.
 */
export const CapacitacionIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
