import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db.js';
import type {
  Capacitacion,
  CreateCapacitacionInput,
  UpdateCapacitacionInput,
} from '../schemas/capacitaciones.schema.js';

type CapacitacionRow = Capacitacion & RowDataPacket;

export async function listCapacitaciones(): Promise<Capacitacion[]> {
  const [rows] = await pool.execute<CapacitacionRow[]>(
    'SELECT id_capacitacion, rut_docente, nombre, institucion, anio, horas, archivo_adjunto FROM capacitaciones ORDER BY id_capacitacion ASC',
  );
  return rows.map(({ id_capacitacion, rut_docente, nombre, institucion, anio, horas, archivo_adjunto }) => ({
    id_capacitacion,
    rut_docente,
    nombre,
    institucion,
    anio,
    horas,
    archivo_adjunto,
  }));
}

export async function findCapacitacionById(id: number): Promise<Capacitacion | null> {
  const [rows] = await pool.execute<CapacitacionRow[]>(
    'SELECT id_capacitacion, rut_docente, nombre, institucion, anio, horas, archivo_adjunto FROM capacitaciones WHERE id_capacitacion = :id LIMIT 1',
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id_capacitacion: row.id_capacitacion,
    rut_docente: row.rut_docente,
    nombre: row.nombre,
    institucion: row.institucion,
    anio: row.anio,
    horas: row.horas,
    archivo_adjunto: row.archivo_adjunto,
  };
}

export async function createCapacitacion(input: CreateCapacitacionInput): Promise<Capacitacion> {
  const dbInput = {
    rut_docente: input.rut_docente ?? null,
    nombre: input.nombre ?? null,
    institucion: input.institucion ?? null,
    anio: input.anio ?? null,
    horas: input.horas ?? null,
    archivo_adjunto: input.archivo_adjunto ?? null,
  };

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO capacitaciones (rut_docente, nombre, institucion, anio, horas, archivo_adjunto) VALUES (:rut_docente, :nombre, :institucion, :anio, :horas, :archivo_adjunto)',
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
  const updates: string[] = [];
  const params: Record<string, string | number | null> = { id };

  if (input.rut_docente !== undefined) {
    updates.push('rut_docente = :rut_docente');
    params.rut_docente = input.rut_docente;
  }
  if (input.nombre !== undefined) {
    updates.push('nombre = :nombre');
    params.nombre = input.nombre;
  }
  if (input.institucion !== undefined) {
    updates.push('institucion = :institucion');
    params.institucion = input.institucion;
  }
  if (input.anio !== undefined) {
    updates.push('anio = :anio');
    params.anio = input.anio;
  }
  if (input.horas !== undefined) {
    updates.push('horas = :horas');
    params.horas = input.horas;
  }
  if (input.archivo_adjunto !== undefined) {
    updates.push('archivo_adjunto = :archivo_adjunto');
    params.archivo_adjunto = input.archivo_adjunto;
  }

  if (updates.length === 0) {
    return await findCapacitacionById(id);
  }

  const query = `UPDATE capacitaciones SET ${updates.join(', ')} WHERE id_capacitacion = :id`;
  const [result] = await pool.execute<ResultSetHeader>(query, params);

  if (result.affectedRows === 0) return null;

  return await findCapacitacionById(id);
}

export async function deleteCapacitacion(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM capacitaciones WHERE id_capacitacion = :id',
    { id },
  );
  return result.affectedRows > 0;
}
