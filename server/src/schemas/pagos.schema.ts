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

export const EstadoPagoSchema = z.enum(['Pendiente', 'Pagada']);
export type EstadoPago = z.infer<typeof EstadoPagoSchema>;

export const EstadoBoletaSchema = z.enum(['Faltante', 'Subida', 'Procesada', 'Con Observación']);
export type EstadoBoleta = z.infer<typeof EstadoBoletaSchema>;

/**
 * Representación completa de un pago (output / row de DB).
 */
export const PagoSchema = z.object({
  id_pago: z.number().int().positive(),
  id_propuesta: z.number().int().positive(),
  mes: MesSchema,
  notas: z.string().nullable(),
  estado_pago: EstadoPagoSchema.nullable().default('Pendiente'),
  fecha_pago: z.string().nullable().optional(), // 'YYYY-MM-DD'
  estado_boleta: EstadoBoletaSchema.nullable().default('Faltante'),
});
export type Pago = z.infer<typeof PagoSchema>;

/**
 * Body para POST /pagos (create).
 * El ID se genera automáticamente en la base de datos.
 */
export const CreatePagoSchema = z.object({
  id_propuesta: z.coerce.number().int().positive(),
  mes: MesSchema,
  notas: z.string().trim().nullable().optional(),
  estado_pago: EstadoPagoSchema.optional(),
  fecha_pago: z.string().optional(),
  estado_boleta: EstadoBoletaSchema.optional(),
});
export type CreatePagoInput = z.infer<typeof CreatePagoSchema>;

/**
 * Body para PUT /pagos/:id (full update). El id viene del path, no del body.
 */
export const UpdatePagoSchema = z.object({
  id_propuesta: z.coerce.number().int().positive().optional(),
  mes: MesSchema.optional(),
  notas: z.string().trim().nullable().optional(),
  estado_pago: EstadoPagoSchema.optional(),
  fecha_pago: z.string().nullable().optional(),
  estado_boleta: EstadoBoletaSchema.optional(),
});
export type UpdatePagoInput = z.infer<typeof UpdatePagoSchema>;

/**
 * Param :id_pago del path.
 */
export const PagoIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
