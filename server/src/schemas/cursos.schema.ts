import { z } from 'zod';

/**
 * Schemas zod para el recurso `cursos`.
 * Mapean 1:1 a la tabla `cursos` definida en database/schema.sql.
 * NOTA: La PK es compuesta (id_carrera, id_curso).
 */

export const JornadaSchema = z.enum(['diurno', 'vespertino']);
export type Jornada = z.infer<typeof JornadaSchema>;

export const SemestreSchema = z.enum(['1', '2', '3', '4', '5', '6']);
export type Semestre = z.infer<typeof SemestreSchema>;

/**
 * Representación completa de un curso (output / row de DB).
 */
export const CursoSchema = z.object({
  id_carrera: z.string().min(1).max(4),
  id_curso: z.string().min(1).max(5),
  jornada: JornadaSchema,
  nombre: z.string().min(1).max(64),
  rut_docente: z.number().int().positive().nullable(),
  semestre: SemestreSchema,
  notas_ingresadas: z.number().int().min(0).max(100).nullable(),
  notas_curso: z.number().int().min(0).max(100),
});
export type Curso = z.infer<typeof CursoSchema>;

/**
 * Body para POST /cursos (create).
 */
export const CreateCursoSchema = z.object({
  id_carrera: z.string().trim().min(1).max(4),
  id_curso: z.string().trim().min(1).max(5),
  jornada: JornadaSchema.default('diurno'),
  nombre: z.string().trim().min(1).max(64),
  rut_docente: z.coerce.number().int().positive().nullable().optional(),
  semestre: SemestreSchema.default('1'),
  notas_ingresadas: z.coerce.number().int().min(0).max(100).nullable().optional(),
  notas_curso: z.coerce.number().int().min(0).max(100),
});
export type CreateCursoInput = z.infer<typeof CreateCursoSchema>;

/**
 * Body para PUT /cursos/:id_carrera/:id_curso (full update).
 * Los ids vienen del path, no del body.
 */
export const UpdateCursoSchema = z.object({
  jornada: JornadaSchema.optional(),
  nombre: z.string().trim().min(1).max(64).optional(),
  rut_docente: z.coerce.number().int().positive().nullable().optional(),
  semestre: SemestreSchema.optional(),
  notas_ingresadas: z.coerce.number().int().min(0).max(100).nullable().optional(),
  notas_curso: z.coerce.number().int().min(0).max(100).optional(),
});
export type UpdateCursoInput = z.infer<typeof UpdateCursoSchema>;

/**
 * Params :id_carrera y :id_curso del path (PK compuesta).
 */
export const CursoIdParamSchema = z.object({
  id_carrera: z.string().trim().min(1).max(4),
  id_curso: z.string().trim().min(1).max(5),
});
