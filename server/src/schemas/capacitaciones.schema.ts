import { z } from 'zod';

export const CapacitacionSchema = z.object({
  id_capacitacion: z.number().int().positive(),
  rut_docente: z.number().int().positive().nullable(),
  nombre: z.string().max(100).nullable(),
  institucion: z.string().max(100).nullable(),
  anio: z.number().int().nullable(),
  horas: z.number().int().nullable(),
  archivo_adjunto: z.string().max(255).nullable(),
});
export type Capacitacion = z.infer<typeof CapacitacionSchema>;

export const CreateCapacitacionSchema = z.object({
  rut_docente: z.coerce.number().int().positive().nullable().optional(),
  nombre: z.string().trim().max(100).nullable().optional(),
  institucion: z.string().trim().max(100).nullable().optional(),
  anio: z.coerce.number().int().nullable().optional(),
  horas: z.coerce.number().int().nullable().optional(),
  archivo_adjunto: z.string().max(255).nullable().optional(),
});
export type CreateCapacitacionInput = z.infer<typeof CreateCapacitacionSchema>;

export const UpdateCapacitacionSchema = z.object({
  rut_docente: z.coerce.number().int().positive().nullable().optional(),
  nombre: z.string().trim().max(100).nullable().optional(),
  institucion: z.string().trim().max(100).nullable().optional(),
  anio: z.coerce.number().int().nullable().optional(),
  horas: z.coerce.number().int().nullable().optional(),
  archivo_adjunto: z.string().max(255).nullable().optional(),
});
export type UpdateCapacitacionInput = z.infer<typeof UpdateCapacitacionSchema>;

export const CapacitacionIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
