import { z } from 'zod';

/**
 * Schemas zod para el recurso `carreras`.
 * Mapean 1:1 a la tabla `carreras` definida en database/schema.sql.
 */

export const JornadaSchema = z.enum(['diurno', 'vespertino']);
export type Jornada = z.infer<typeof JornadaSchema>;

/**
 * Representación completa de una carrera (output / row de DB).
 */
export const CarreraSchema = z.object({
  id_carrera: z.string().min(1).max(4),
  nombre: z.string().min(1).max(64),
  jornada: JornadaSchema,
});
export type Carrera = z.infer<typeof CarreraSchema>;

/**
 * Body para POST /carreras (create).
 */
export const CreateCarreraSchema = z.object({
  id_carrera: z.string().trim().min(1).max(4),
  nombre: z.string().trim().min(1).max(64),
  jornada: JornadaSchema.default('diurno'),
});
export type CreateCarreraInput = z.infer<typeof CreateCarreraSchema>;

/**
 * Body para PUT /carreras/:id (full update). El id viene del path, no del body.
 */
export const UpdateCarreraSchema = z.object({
  nombre: z.string().trim().min(1).max(64),
  jornada: JornadaSchema,
});
export type UpdateCarreraInput = z.infer<typeof UpdateCarreraSchema>;

/**
 * Param :id_carrera del path.
 */
export const CarreraIdParamSchema = z.object({
  id: z.string().trim().min(1).max(4),
});
