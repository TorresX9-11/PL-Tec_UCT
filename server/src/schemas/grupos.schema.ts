import { z } from 'zod';

/**
 * Schemas zod para el recurso `grupos`.
 * Mapean 1:1 a la tabla `grupos` definida en database/schema.sql.
 */

export const SeccionSchema = z.enum(['1', '2', '3']);
export type Seccion = z.infer<typeof SeccionSchema>;

export const SubgrupoSchema = z.enum(['A', 'B']);
export type Subgrupo = z.infer<typeof SubgrupoSchema>;

/**
 * Representación completa de un grupo (output / row de DB).
 */
export const GrupoSchema = z.object({
  id_grupo: z.number().int().positive(),
  id_carrera: z.string().min(1).max(4),
  id_curso: z.string().min(1).max(5),
  seccion: SeccionSchema,
  subgrupo: SubgrupoSchema.nullable(),
  rut_docente: z.number().int().positive().nullable(),
  horas_presencial: z.number().int().min(0).nullable(),
  horas_mixto: z.number().int().min(0).nullable(),
  horas_administrativo: z.number().int().min(0).nullable(),
});
export type Grupo = z.infer<typeof GrupoSchema>;

/**
 * Body para POST /grupos (create).
 * El ID se genera automáticamente en la base de datos.
 */
export const CreateGrupoSchema = z.object({
  id_carrera: z.string().trim().min(1).max(4),
  id_curso: z.string().trim().min(1).max(5),
  seccion: SeccionSchema.default('1'),
  subgrupo: SubgrupoSchema.nullable().optional(),
  rut_docente: z.coerce.number().int().positive().nullable().optional(),
  horas_presencial: z.coerce.number().int().min(0).nullable().optional(),
  horas_mixto: z.coerce.number().int().min(0).nullable().optional(),
  horas_administrativo: z.coerce.number().int().min(0).nullable().optional(),
});
export type CreateGrupoInput = z.infer<typeof CreateGrupoSchema>;

/**
 * Body para PUT /grupos/:id (full update). El id viene del path, no del body.
 */
export const UpdateGrupoSchema = z.object({
  id_carrera: z.string().trim().min(1).max(4).optional(),
  id_curso: z.string().trim().min(1).max(4).optional(),
  seccion: SeccionSchema.optional(),
  subgrupo: SubgrupoSchema.nullable().optional(),
  rut_docente: z.coerce.number().int().positive().nullable().optional(),
  horas_presencial: z.coerce.number().int().min(0).nullable().optional(),
  horas_mixto: z.coerce.number().int().min(0).nullable().optional(),
  horas_administrativo: z.coerce.number().int().min(0).nullable().optional(),
});
export type UpdateGrupoInput = z.infer<typeof UpdateGrupoSchema>;

/**
 * Param :id_grupo del path.
 */
export const GrupoIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
