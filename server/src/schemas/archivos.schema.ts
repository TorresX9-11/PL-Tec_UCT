import { z } from 'zod';

/**
 * Schemas zod para el recurso `archivos`.
 * Mapean 1:1 a la tabla `archivos` definida en database/schema.sql.
 */

/**
 * Representación completa de un archivo (output / row de DB).
 */
export const ArchivoSchema = z.object({
  id_archivo: z.number().int().positive(),
  correo_usuario: z.string().email().max(32).nullable(),
  tipo: z.string().max(4).nullable(),
  ruta: z.string().min(1).max(255),
});
export type Archivo = z.infer<typeof ArchivoSchema>;

/**
 * Body para POST /archivos (create).
 * El ID se genera automáticamente en la base de datos.
 */
export const CreateArchivoSchema = z.object({
  correo_usuario: z.string().email().max(32).nullable().optional(),
  tipo: z.string().trim().max(4).nullable().optional(),
  ruta: z.string().trim().min(1).max(255),
});
export type CreateArchivoInput = z.infer<typeof CreateArchivoSchema>;

/**
 * Body para PUT /archivos/:id (full update). El id viene del path, no del body.
 */
export const UpdateArchivoSchema = z.object({
  correo_usuario: z.string().email().max(32).nullable().optional(),
  tipo: z.string().trim().max(4).nullable().optional(),
  ruta: z.string().trim().min(1).max(255).optional(),
});
export type UpdateArchivoInput = z.infer<typeof UpdateArchivoSchema>;

/**
 * Param :id_archivo del path.
 */
export const ArchivoIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
