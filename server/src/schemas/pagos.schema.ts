import { z } from 'zod';

/**
 * Schemas zod para el recurso `pagos`.
 * Mapean 1:1 a la tabla `pagos` definida en database/schema.sql.
 */

export const MesSchema = z.enum([
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]);
export type Mes = z.infer<typeof MesSchema>;

/**
 * Representación completa de un pago (output / row de DB).
 */
export const PagoSchema = z.object({
  id_pago: z.string().min(1).max(16),
  id_propuesta: z.string().min(1).max(16),
  mes: MesSchema,
  notas: z.string().nullable(),
});
export type Pago = z.infer<typeof PagoSchema>;

/**
 * Body para POST /pagos (create).
 */
export const CreatePagoSchema = z.object({
  id_pago: z.string().trim().min(1).max(16),
  id_propuesta: z.string().trim().min(1).max(16),
  mes: MesSchema,
  notas: z.string().trim().nullable().optional(),
});
export type CreatePagoInput = z.infer<typeof CreatePagoSchema>;

/**
 * Body para PUT /pagos/:id (full update). El id viene del path, no del body.
 */
export const UpdatePagoSchema = z.object({
  id_propuesta: z.string().trim().min(1).max(16).optional(),
  mes: MesSchema.optional(),
  notas: z.string().trim().nullable().optional(),
});
export type UpdatePagoInput = z.infer<typeof UpdatePagoSchema>;

/**
 * Param :id_pago del path.
 */
export const PagoIdParamSchema = z.object({
  id: z.string().trim().min(1).max(16),
});
