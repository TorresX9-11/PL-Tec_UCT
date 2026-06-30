import { z } from 'zod';

export const CoordinadorSchema = z.object({
  id_coordinador: z.number(),
  correo_usuario: z.string().email().max(32),
  id_carrera: z.string().max(32).nullable().optional(),
  nombre: z.string().min(1).max(128),
  rut: z.string().min(1).max(20),
});
export type Coordinador = z.infer<typeof CoordinadorSchema>;

export const CreateCoordinadorSchema = z.object({
  correo_usuario: z.string().email().max(32),
  id_carrera: z.string().max(32).nullable().optional(),
  nombre: z.string().min(1).max(128),
  rut: z.string().min(1).max(20),
});
export type CreateCoordinadorInput = z.infer<typeof CreateCoordinadorSchema>;

export const UpdateCoordinadorSchema = z.object({
  id_carrera: z.string().max(32).nullable().optional(),
  nombre: z.string().min(1).max(128).optional(),
  rut: z.string().min(1).max(20).optional(),
  correo_usuario: z.string().email().max(32).optional(),
});
export type UpdateCoordinadorInput = z.infer<typeof UpdateCoordinadorSchema>;
