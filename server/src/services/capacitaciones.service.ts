import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db.js';
import type {
  Capacitacion,
  CreateCapacitacionInput,
  UpdateCapacitacionInput,
} from '../schemas/capacitaciones.schema.js';

/**
 * Capa de acceso a datos para `capacitaciones`.
 * Toda consulta usa prepared statements (`pool.execute`) — evita SQL injection.
 */

type CapacitacionRow = Capacitacion & RowDataPacket;

export async function listCapacitaciones(): Promise<Capacitacion[]> {
  const [rows] = await pool.execute<CapacitacionRow[]>(
    'SELECT id_capacitacion, rut_docente, titulo, descripcion FROM capacitaciones ORDER BY id_capacitacion ASC',
  );
  return rows.map(({ id_capacitacion, rut_docente, titulo, descripcion }) => ({
    id_capacitacion,
    rut_docente,
    titulo,
    descripcion,
  }));
}

export async function findCapacitacionById(id: number): Promise<Capacitacion | null> {
  const [rows] = await pool.execute<CapacitacionRow[]>(
    'SELECT id_capacitacion, rut_docente, titulo, descripcion FROM capacitaciones WHERE id_capacitacion = :id LIMIT 1',
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id_capacitacion: row.id_capacitacion,
    rut_docente: row.rut_docente,
    titulo: row.titulo,
    descripcion: row.descripcion,
  };
}

export async function createCapacitacion(input: CreateCapacitacionInput): Promise<Capacitacion> {
  // Convertir undefined a null para campos opcionales
  const dbInput = {
    rut_docente: input.rut_docente ?? null,
    titulo: input.titulo ?? null,
    descripcion: input.descripcion ?? null,
  };

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO capacitaciones (rut_docente, titulo, descripcion) VALUES (:rut_docente, :titulo, :descripcion)',
    dbInput,
  );
  return {
    id_capacitacion: result.insertId as number,
    ...dbInput,
  };
}

export async function updateCapacitacion(
  id: number,
  input: UpdateCapacitacionInput,
): Promise<Capacitacion | null> {
  // Construir query dinámica solo con campos proporcionados
  const updates: string[] = [];
  const params: Record<string, string | number | null> = { id };

  if (input.rut_docente !== undefined) {
    updates.push('rut_docente = :rut_docente');
    params.rut_docente = input.rut_docente;
  }
  if (input.titulo !== undefined) {
    updates.push('titulo = :titulo');
    params.titulo = input.titulo;
  }
  if (input.descripcion !== undefined) {
    updates.push('descripcion = :descripcion');
    params.descripcion = input.descripcion;
  }

  if (updates.length === 0) {
    // Si no hay campos para actualizar, retornar la capacitación existente
    return await findCapacitacionById(id);
  }

  const query = `UPDATE capacitaciones SET ${updates.join(', ')} WHERE id_capacitacion = :id`;
  const [result] = await pool.execute<ResultSetHeader>(query, params);

  if (result.affectedRows === 0) return null;

  // Retornar capacitación actualizada
  return await findCapacitacionById(id);
}

export async function deleteCapacitacion(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM capacitaciones WHERE id_capacitacion = :id',
    { id },
  );
  return result.affectedRows > 0;
}
