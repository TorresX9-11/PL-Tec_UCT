import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db.js';
import type {
  Coordinador,
  CreateCoordinadorInput,
  UpdateCoordinadorInput,
} from '../schemas/coordinadores.schema.js';

/**
 * Capa de acceso a datos para `coordinadores`.
 * Toda consulta usa prepared statements (`pool.execute`) — evita SQL injection.
 */

type CoordinadorRow = Coordinador & RowDataPacket;

export async function listCoordinadores(): Promise<Coordinador[]> {
  const [rows] = await pool.execute<CoordinadorRow[]>(
    'SELECT id_coordinador, correo_usuario, id_carrera FROM coordinadores ORDER BY id_coordinador ASC',
  );
  return rows.map(({ id_coordinador, correo_usuario, id_carrera }) => ({
    id_coordinador,
    correo_usuario,
    id_carrera,
  }));
}

export async function findCoordinadorById(id: number): Promise<Coordinador | null> {
  const [rows] = await pool.execute<CoordinadorRow[]>(
    'SELECT id_coordinador, correo_usuario, id_carrera FROM coordinadores WHERE id_coordinador = :id LIMIT 1',
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id_coordinador: row.id_coordinador,
    correo_usuario: row.correo_usuario,
    id_carrera: row.id_carrera,
  };
}

export async function createCoordinador(input: CreateCoordinadorInput): Promise<Coordinador> {
  // Convertir undefined a null para campos opcionales
  const dbInput = {
    ...input,
    correo_usuario: input.correo_usuario ?? null,
    id_carrera: input.id_carrera ?? null,
  };

  await pool.execute<ResultSetHeader>(
    'INSERT INTO coordinadores (id_coordinador, correo_usuario, id_carrera) VALUES (:id_coordinador, :correo_usuario, :id_carrera)',
    dbInput,
  );
  return dbInput as Coordinador;
}

export async function updateCoordinador(
  id: number,
  input: UpdateCoordinadorInput,
): Promise<Coordinador | null> {
  // Construir query dinámica solo con campos proporcionados
  const updates: string[] = [];
  const params: Record<string, string | number | null> = { id };

  if (input.correo_usuario !== undefined) {
    updates.push('correo_usuario = :correo_usuario');
    params.correo_usuario = input.correo_usuario;
  }
  if (input.id_carrera !== undefined) {
    updates.push('id_carrera = :id_carrera');
    params.id_carrera = input.id_carrera;
  }

  if (updates.length === 0) {
    // Si no hay campos para actualizar, retornar el coordinador existente
    return await findCoordinadorById(id);
  }

  const query = `UPDATE coordinadores SET ${updates.join(', ')} WHERE id_coordinador = :id`;
  const [result] = await pool.execute<ResultSetHeader>(query, params);

  if (result.affectedRows === 0) return null;

  // Retornar coordinador actualizado
  return await findCoordinadorById(id);
}

export async function deleteCoordinador(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM coordinadores WHERE id_coordinador = :id',
    { id },
  );
  return result.affectedRows > 0;
}
