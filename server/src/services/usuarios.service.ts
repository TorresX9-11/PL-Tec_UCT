import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db.js';
import type {
  Usuario,
  CreateUsuarioInput,
  UpdateUsuarioInput,
} from '../schemas/usuarios.schema.js';

/**
 * Capa de acceso a datos para `usuarios`.
 * Toda consulta usa prepared statements (`pool.execute`) — evita SQL injection.
 */

type UsuarioRow = Usuario & RowDataPacket;

export async function listUsuarios(): Promise<Usuario[]> {
  const [rows] = await pool.execute<UsuarioRow[]>(
    'SELECT correo_usuario, nombre, nivel, debe_cambiar_pass FROM usuarios ORDER BY correo_usuario ASC',
  );
  return rows.map(({ correo_usuario, nombre, nivel, debe_cambiar_pass }) => ({ 
    correo_usuario, 
    nombre, 
    nivel, 
    debe_cambiar_pass: Boolean(debe_cambiar_pass)
  }));
}

export async function findUsuarioById(id: string): Promise<Usuario | null> {
  const [rows] = await pool.execute<UsuarioRow[]>(
    'SELECT correo_usuario, nombre, nivel, debe_cambiar_pass FROM usuarios WHERE correo_usuario = :id LIMIT 1',
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return { 
    correo_usuario: row.correo_usuario, 
    nombre: row.nombre, 
    nivel: row.nivel,
    debe_cambiar_pass: Boolean(row.debe_cambiar_pass)
  };
}

export async function createUsuario(input: CreateUsuarioInput): Promise<Usuario> {
  await pool.execute<ResultSetHeader>(
    'INSERT INTO usuarios (correo_usuario, nombre, contrasena, nivel, debe_cambiar_pass) VALUES (:correo_usuario, :nombre, :contrasena, :nivel, :debe_cambiar_pass)',
    { ...input, debe_cambiar_pass: input.debe_cambiar_pass ? 1 : 0 },
  );
  // Retornar sin contrasena por seguridad
  const { contrasena, ...usuario } = input;
  return usuario;
}

export async function updateUsuario(
  id: string,
  input: UpdateUsuarioInput,
): Promise<Usuario | null> {
  // Construir query dinámica solo con campos proporcionados
  const updates: string[] = [];
  const params: Record<string, string | number> = { id };

  if (input.nombre !== undefined) {
    updates.push('nombre = :nombre');
    params.nombre = input.nombre;
  }
  if (input.contrasena !== undefined) {
    updates.push('contrasena = :contrasena');
    params.contrasena = input.contrasena;
  }
  if (input.nivel !== undefined) {
    updates.push('nivel = :nivel');
    params.nivel = input.nivel;
  }
  if (input.debe_cambiar_pass !== undefined) {
    updates.push('debe_cambiar_pass = :debe_cambiar_pass');
    params.debe_cambiar_pass = input.debe_cambiar_pass ? 1 : 0;
  }

  if (updates.length === 0) {
    // Si no hay campos para actualizar, retornar el usuario existente
    return await findUsuarioById(id);
  }

  const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE correo_usuario = :id`;
  const [result] = await pool.execute<ResultSetHeader>(query, params);

  if (result.affectedRows === 0) return null;

  // Retornar usuario actualizado (sin contrasena)
  return await findUsuarioById(id);
}

export async function deleteUsuario(id: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM usuarios WHERE correo_usuario = :id',
    { id },
  );
  return result.affectedRows > 0;
}
