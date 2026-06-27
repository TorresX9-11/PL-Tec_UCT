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
    "SELECT id_pago, id_propuesta, mes, notas, estado_pago, DATE_FORMAT(fecha_pago, '%Y-%m-%d') as fecha_pago, estado_boleta FROM pagos ORDER BY id_pago ASC",
  );
  return rows.map(({ id_pago, id_propuesta, mes, notas, estado_pago, fecha_pago, estado_boleta }) => ({
    id_pago,
    id_propuesta,
    mes,
    notas,
    estado_pago,
    fecha_pago,
    estado_boleta,
  }));
}

export async function findPagoById(id: number): Promise<Pago | null> {
  const [rows] = await pool.execute<PagoRow[]>(
    "SELECT id_pago, id_propuesta, mes, notas, estado_pago, DATE_FORMAT(fecha_pago, '%Y-%m-%d') as fecha_pago, estado_boleta FROM pagos WHERE id_pago = :id LIMIT 1",
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id_pago: row.id_pago,
    id_propuesta: row.id_propuesta,
    mes: row.mes,
    notas: row.notas,
    estado_pago: row.estado_pago,
    fecha_pago: row.fecha_pago,
    estado_boleta: row.estado_boleta,
  };
}

export async function createPago(input: CreatePagoInput): Promise<Pago> {
  // Convertir undefined a null para campos opcionales
  const dbInput = {
    id_propuesta: input.id_propuesta,
    mes: input.mes,
    notas: input.notas ?? null,
    estado_pago: input.estado_pago ?? 'Pendiente',
    fecha_pago: input.fecha_pago ?? null,
    estado_boleta: input.estado_boleta ?? 'Faltante',
  };

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO pagos (id_propuesta, mes, notas, estado_pago, fecha_pago, estado_boleta) VALUES (:id_propuesta, :mes, :notas, :estado_pago, :fecha_pago, :estado_boleta)',
    dbInput,
  );
  return {
    id_pago: result.insertId as number,
    ...dbInput,
  };
}

export async function updatePago(
  id: number,
  input: UpdatePagoInput,
): Promise<Pago | null> {
  // Construir query dinámica solo con campos proporcionados
  const updates: string[] = [];
  const params: Record<string, string | number | null> = { id };

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
  if (input.estado_pago !== undefined) {
    updates.push('estado_pago = :estado_pago');
    params.estado_pago = input.estado_pago;
  }
  if (input.fecha_pago !== undefined) {
    updates.push('fecha_pago = :fecha_pago');
    params.fecha_pago = input.fecha_pago;
  }
  if (input.estado_boleta !== undefined) {
    updates.push('estado_boleta = :estado_boleta');
    params.estado_boleta = input.estado_boleta;
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

export async function deletePago(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM pagos WHERE id_pago = :id',
    { id },
  );
  return result.affectedRows > 0;
}
