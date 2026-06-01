import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db.js';
import type {
  Docente,
  CreateDocenteInput,
  UpdateDocenteInput,
} from '../schemas/docentes.schema.js';

/**
 * Capa de acceso a datos para `docentes`.
 * Toda consulta usa prepared statements (`pool.execute`) — evita SQL injection.
 */

type DocenteRow = Docente & RowDataPacket;

export async function listDocentes(): Promise<Docente[]> {
  const [rows] = await pool.execute<DocenteRow[]>(
    'SELECT rut_docente, dv, correo_usuario, contacto, nombre, nivel_docente FROM docentes ORDER BY rut_docente ASC',
  );
  return rows.map(({ rut_docente, dv, correo_usuario, contacto, nombre, nivel_docente }) => ({
    rut_docente,
    dv,
    correo_usuario,
    contacto,
    nombre,
    nivel_docente,
  }));
}

export async function findDocenteById(id: number): Promise<Docente | null> {
  const [rows] = await pool.execute<DocenteRow[]>(
    'SELECT rut_docente, dv, correo_usuario, contacto, nombre, nivel_docente FROM docentes WHERE rut_docente = :id LIMIT 1',
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return {
    rut_docente: row.rut_docente,
    dv: row.dv,
    correo_usuario: row.correo_usuario,
    contacto: row.contacto,
    nombre: row.nombre,
    nivel_docente: row.nivel_docente,
  };
}

export async function createDocente(input: CreateDocenteInput): Promise<Docente> {
  // Convertir undefined a null para campos opcionales
  const dbInput = {
    ...input,
    correo_usuario: input.correo_usuario ?? null,
    contacto: input.contacto ?? null,
    nivel_docente: input.nivel_docente ?? null,
  };

  await pool.execute<ResultSetHeader>(
    'INSERT INTO docentes (rut_docente, dv, correo_usuario, contacto, nombre, nivel_docente) VALUES (:rut_docente, :dv, :correo_usuario, :contacto, :nombre, :nivel_docente)',
    dbInput,
  );
  return dbInput as Docente;
}

export async function updateDocente(
  id: number,
  input: UpdateDocenteInput,
): Promise<Docente | null> {
  // Construir query dinámica solo con campos proporcionados
  const updates: string[] = [];
  const params: Record<string, string | number | null> = { id };

  if (input.dv !== undefined) {
    updates.push('dv = :dv');
    params.dv = input.dv;
  }
  if (input.correo_usuario !== undefined) {
    updates.push('correo_usuario = :correo_usuario');
    params.correo_usuario = input.correo_usuario;
  }
  if (input.contacto !== undefined) {
    updates.push('contacto = :contacto');
    params.contacto = input.contacto;
  }
  if (input.nombre !== undefined) {
    updates.push('nombre = :nombre');
    params.nombre = input.nombre;
  }
  if (input.nivel_docente !== undefined) {
    updates.push('nivel_docente = :nivel_docente');
    params.nivel_docente = input.nivel_docente;
  }

  if (updates.length === 0) {
    // Si no hay campos para actualizar, retornar el docente existente
    return await findDocenteById(id);
  }

  const query = `UPDATE docentes SET ${updates.join(', ')} WHERE rut_docente = :id`;
  const [result] = await pool.execute<ResultSetHeader>(query, params);

  if (result.affectedRows === 0) return null;

  // Retornar docente actualizado
  return await findDocenteById(id);
}

export async function deleteDocente(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM docentes WHERE rut_docente = :id',
    { id },
  );
  return result.affectedRows > 0;
}
