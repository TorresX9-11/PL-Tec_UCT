import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db.js';
import type {
  Pago,
  CreatePagoInput,
  UpdatePagoInput,
} from '../schemas/pagos.schema.js';

/**
 * Capa de acceso a datos para `pagos`.
 * Toda consulta usa prepared statements (`pool.execute`) — evita SQL injection.
 */

type PagoRow = Pago & RowDataPacket;

export async function listPagos(): Promise<Pago[]> {
  const [rows] = await pool.execute<PagoRow[]>(
    'SELECT id_pago, id_propuesta, mes, notas FROM pagos ORDER BY id_pago ASC',
  );
  return rows.map(({ id_pago, id_propuesta, mes, notas }) => ({
    id_pago,
    id_propuesta,
    mes,
    notas,
  }));
}

export async function findPagoById(id: string): Promise<Pago | null> {
  const [rows] = await pool.execute<PagoRow[]>(
    'SELECT id_pago, id_propuesta, mes, notas FROM pagos WHERE id_pago = :id LIMIT 1',
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id_pago: row.id_pago,
    id_propuesta: row.id_propuesta,
    mes: row.mes,
    notas: row.notas,
  };
}

export async function createPago(input: CreatePagoInput): Promise<Pago> {
  // Convertir undefined a null para campos opcionales
  const dbInput = {
    ...input,
    notas: input.notas ?? null,
  };

  await pool.execute<ResultSetHeader>(
    'INSERT INTO pagos (id_pago, id_propuesta, mes, notas) VALUES (:id_pago, :id_propuesta, :mes, :notas)',
    dbInput,
  );
  return dbInput as Pago;
}

export async function updatePago(
  id: string,
  input: UpdatePagoInput,
): Promise<Pago | null> {
  // Construir query dinámica solo con campos proporcionados
  const updates: string[] = [];
  const params: Record<string, string | null> = { id };

  if (input.id_propuesta !== undefined) {
    updates.push('id_propuesta = :id_propuesta');
    params.id_propuesta = input.id_propuesta;
  }
  if (input.mes !== undefined) {
    updates.push('mes = :mes');
    params.mes = input.mes;
  }
  if (input.notas !== undefined) {
    updates.push('notas = :notas');
    params.notas = input.notas;
  }

  if (updates.length === 0) {
    // Si no hay campos para actualizar, retornar el pago existente
    return await findPagoById(id);
  }

  const query = `UPDATE pagos SET ${updates.join(', ')} WHERE id_pago = :id`;
  const [result] = await pool.execute<ResultSetHeader>(query, params);

  if (result.affectedRows === 0) return null;

  // Retornar pago actualizado
  return await findPagoById(id);
}

export async function deletePago(id: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM pagos WHERE id_pago = :id',
    { id },
  );
  return result.affectedRows > 0;
}
