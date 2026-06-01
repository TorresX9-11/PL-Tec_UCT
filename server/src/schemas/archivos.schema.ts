import { z } from 'zod';

/**
 * Schemas zod para el recurso `archivos`.
 * Mapean 1:1 a la tabla `archivos` definida en database/schema.sql.
 */

/**
 * Representación completa de un archivo (output / row de DB).
 */
export const ArchivoSchema = z.object({
  id_archivo: z.string().min(1).max(16),
  correo_usuario: z.string().email().max(32).nullable(),
  tipo: z.string().max(4).nullable(),
  ruta: z.string().min(1).max(64),
});
export type Archivo = z.infer<typeof ArchivoSchema>;

/**
 * Body para POST /archivos (create).
 */
export const CreateArchivoSchema = z.object({
  id_archivo: z.string().trim().min(1).max(16),
  correo_usuario: z.string().email().max(32).nullable().optional(),
  tipo: z.string().trim().max(4).nullable().optional(),
  ruta: z.string().trim().min(1).max(64),
});
export type CreateArchivoInput = z.infer<typeof CreateArchivoSchema>;

/**
 * Body para PUT /archivos/:id (full update). El id viene del path, no del body.
 */
export const UpdateArchivoSchema = z.object({
  correo_usuario: z.string().email().max(32).nullable().optional(),
  tipo: z.string().trim().max(4).nullable().optional(),
  ruta: z.string().trim().min(1).max(64).optional(),
});
export type UpdateArchivoInput = z.infer<typeof UpdateArchivoSchema>;

/**
 * Param :id_archivo del path.
 */
export const ArchivoIdParamSchema = z.object({
  id: z.string().trim().min(1).max(16),
});
