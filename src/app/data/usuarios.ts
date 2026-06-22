/**
 * Acceso a datos del recurso `usuarios` — Plataforma TEC UCT (Fase 2)
 *
 * Mapea 1:1 a la tabla `usuarios` (correo_usuario PK, nombre, nivel). La
 * contraseña nunca se devuelve por el backend; solo se envía al crear/actualizar
 * y se hashea con bcrypt del lado del servidor.
 *
 * Todas las rutas de escritura requieren JWT de nivel admin.
 */

import { api, ApiError } from './apiClient';
import type { Nivel } from './auth';

export type { Nivel };

export interface Usuario {
  correo_usuario: string;
  nombre: string;
  nivel: Nivel;
}

export type DataSource = 'backend' | 'mock';

export interface ListUsuariosResult {
  data: Usuario[];
  source: DataSource;
}

export interface CreateUsuarioInput {
  correo_usuario: string;
  nombre: string;
  contrasena: string;
  nivel: Nivel;
}

export interface UpdateUsuarioInput {
  nombre: string;
  nivel: Nivel;
  /** Opcional: si viene vacío, no se cambia la contraseña. */
  contrasena?: string;
}

export async function listUsuarios(): Promise<ListUsuariosResult> {
  try {
    const rows = await api.get<Usuario[]>('/usuarios');
    return { data: rows, source: 'backend' };
  } catch (err) {
    if (err instanceof ApiError && err.isNetwork) {
      return { data: [], source: 'mock' };
    }
    throw err;
  }
}

export async function createUsuario(input: CreateUsuarioInput): Promise<void> {
  await api.post('/usuarios', {
    correo_usuario: input.correo_usuario.trim(),
    nombre: input.nombre.trim(),
    contrasena: input.contrasena,
    nivel: input.nivel,
  });
}

export async function updateUsuario(correo: string, input: UpdateUsuarioInput): Promise<void> {
  const body: Record<string, unknown> = {
    nombre: input.nombre.trim(),
    nivel: input.nivel,
  };
  if (input.contrasena) body.contrasena = input.contrasena;
  await api.put(`/usuarios/${encodeURIComponent(correo)}`, body);
}

export async function deleteUsuario(correo: string): Promise<void> {
  await api.del(`/usuarios/${encodeURIComponent(correo)}`);
}
