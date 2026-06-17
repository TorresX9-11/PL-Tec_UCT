import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db.js';
import type {
  Archivo,
  CreateArchivoInput,
  UpdateArchivoInput,
} from '../schemas/archivos.schema.js';

/**
 * Capa de acceso a datos para `archivos`.
 * Toda consulta usa prepared statements (`pool.execute`) — evita SQL injection.
 */

type ArchivoRow = Archivo & RowDataPacket;

export async function listArchivos(): Promise<Archivo[]> {
  const [rows] = await pool.execute<ArchivoRow[]>(
    'SELECT id_archivo, correo_usuario, ruta FROM archivos ORDER BY id_archivo ASC',
  );
  return rows.map(({ id_archivo, correo_usuario, ruta }) => ({
    id_archivo,
    correo_usuario,
    tipo: null,
    ruta,
  }));
}

export async function findArchivoById(id: number): Promise<Archivo | null> {
  const [rows] = await pool.execute<ArchivoRow[]>(
    'SELECT id_archivo, correo_usuario, ruta FROM archivos WHERE id_archivo = :id LIMIT 1',
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id_archivo: row.id_archivo,
    correo_usuario: row.correo_usuario,
    tipo: null,
    ruta: row.ruta,
  };
}

export async function createArchivo(input: CreateArchivoInput): Promise<Archivo> {
  // Convertir undefined a null para campos opcionales
  const dbInput = {
    correo_usuario: input.correo_usuario ?? null,
    ruta: input.ruta,
  };

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO archivos (correo_usuario, ruta) VALUES (:correo_usuario, :ruta)',
    dbInput,
  );

  return {
    id_archivo: result.insertId as number,
    correo_usuario: dbInput.correo_usuario,
    tipo: null,
    ruta: dbInput.ruta,
  };
}

export async function updateArchivo(
  id: number,
  input: UpdateArchivoInput,
): Promise<Archivo | null> {
  // Construir query dinámica solo con campos proporcionados
  const updates: string[] = [];
  const params: Record<string, string | number | null> = { id };

  if (input.correo_usuario !== undefined) {
    updates.push('correo_usuario = :correo_usuario');
    params.correo_usuario = input.correo_usuario;
  }
  if (input.ruta !== undefined) {
    updates.push('ruta = :ruta');
    params.ruta = input.ruta;
  }

  if (updates.length === 0) {
    // Si no hay campos para actualizar, retornar el archivo existente
    return await findArchivoById(id);
  }

  const query = `UPDATE archivos SET ${updates.join(', ')} WHERE id_archivo = :id`;
  const [result] = await pool.execute<ResultSetHeader>(query, params);

  if (result.affectedRows === 0) return null;

  // Retornar archivo actualizado
  return await findArchivoById(id);
}

export async function deleteArchivo(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM archivos WHERE id_archivo = :id',
    { id },
  );
  return result.affectedRows > 0;
}
