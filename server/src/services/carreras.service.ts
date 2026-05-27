import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db.js';
import type {
  Carrera,
  CreateCarreraInput,
  UpdateCarreraInput,
} from '../schemas/carreras.schema.js';

/**
 * Capa de acceso a datos para `carreras`.
 * Toda consulta usa prepared statements (`pool.execute`) — evita SQL injection.
 */

type CarreraRow = Carrera & RowDataPacket;

export async function listCarreras(): Promise<Carrera[]> {
  const [rows] = await pool.execute<CarreraRow[]>(
    'SELECT id_carrera, nombre, jornada FROM carreras ORDER BY id_carrera ASC',
  );
  return rows.map(({ id_carrera, nombre, jornada }) => ({ id_carrera, nombre, jornada }));
}

export async function findCarreraById(id: string): Promise<Carrera | null> {
  const [rows] = await pool.execute<CarreraRow[]>(
    'SELECT id_carrera, nombre, jornada FROM carreras WHERE id_carrera = :id LIMIT 1',
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return { id_carrera: row.id_carrera, nombre: row.nombre, jornada: row.jornada };
}

export async function createCarrera(input: CreateCarreraInput): Promise<Carrera> {
  await pool.execute<ResultSetHeader>(
    'INSERT INTO carreras (id_carrera, nombre, jornada) VALUES (:id_carrera, :nombre, :jornada)',
    input,
  );
  return { ...input };
}

export async function updateCarrera(
  id: string,
  input: UpdateCarreraInput,
): Promise<Carrera | null> {
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE carreras SET nombre = :nombre, jornada = :jornada WHERE id_carrera = :id',
    { ...input, id },
  );
  if (result.affectedRows === 0) return null;
  return { id_carrera: id, ...input };
}

export async function deleteCarrera(id: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM carreras WHERE id_carrera = :id',
    { id },
  );
  return result.affectedRows > 0;
}
