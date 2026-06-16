import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db.js';
import type {
  Propuesta,
  CreatePropuestaInput,
  UpdatePropuestaInput,
} from '../schemas/propuestas.schema.js';

/**
 * Capa de acceso a datos para `propuestas`.
 * Toda consulta usa prepared statements (`pool.execute`) — evita SQL injection.
 */

type PropuestaRow = Propuesta & RowDataPacket;

export async function listPropuestas(): Promise<Propuesta[]> {
  const [rows] = await pool.execute<PropuestaRow[]>(
    'SELECT id_propuesta, rut_docente, valor_propuesta, cuotas FROM propuestas ORDER BY id_propuesta ASC',
  );
  return rows.map(({ id_propuesta, rut_docente, valor_propuesta, cuotas }) => ({
    id_propuesta,
    rut_docente,
    valor_propuesta,
    cuotas,
  }));
}

export async function findPropuestaById(id: number): Promise<Propuesta | null> {
  const [rows] = await pool.execute<PropuestaRow[]>(
    'SELECT id_propuesta, rut_docente, valor_propuesta, cuotas FROM propuestas WHERE id_propuesta = :id LIMIT 1',
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id_propuesta: row.id_propuesta,
    rut_docente: row.rut_docente,
    valor_propuesta: row.valor_propuesta,
    cuotas: row.cuotas,
  };
}

export async function createPropuesta(input: CreatePropuestaInput): Promise<Propuesta> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO propuestas (rut_docente, valor_propuesta, cuotas) VALUES (:rut_docente, :valor_propuesta, :cuotas)',
    input,
  );
  return {
    id_propuesta: result.insertId as number,
    ...input,
  };
}

export async function updatePropuesta(
  id: number,
  input: UpdatePropuestaInput,
): Promise<Propuesta | null> {
  // Construir query dinámica solo con campos proporcionados
  const updates: string[] = [];
  const params: Record<string, string | number> = { id };

  if (input.rut_docente !== undefined) {
    updates.push('rut_docente = :rut_docente');
    params.rut_docente = input.rut_docente;
  }
  if (input.valor_propuesta !== undefined) {
    updates.push('valor_propuesta = :valor_propuesta');
    params.valor_propuesta = input.valor_propuesta;
  }
  if (input.cuotas !== undefined) {
    updates.push('cuotas = :cuotas');
    params.cuotas = input.cuotas;
  }

  if (updates.length === 0) {
    // Si no hay campos para actualizar, retornar la propuesta existente
    return await findPropuestaById(id);
  }

  const query = `UPDATE propuestas SET ${updates.join(', ')} WHERE id_propuesta = :id`;
  const [result] = await pool.execute<ResultSetHeader>(query, params);

  if (result.affectedRows === 0) return null;

  // Retornar propuesta actualizada
  return await findPropuestaById(id);
}

export async function deletePropuesta(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM propuestas WHERE id_propuesta = :id',
    { id },
  );
  return result.affectedRows > 0;
}
