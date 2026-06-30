/**
 * Acceso a datos del recurso `pagos` — Plataforma TEC UCT
 *
 * Adaptador entre el backend REST (tabla `pagos`) y el tipo
 * `CuotaMensual` del frontend.
 */

import { api, ApiError } from './apiClient';
import { mockCuotasMensuales, type CuotaMensual } from './mockData';

export interface BackendPago {
  id_pago: number;
  id_propuesta: number;
  mes: string;
  notas: string | null;
  estado_pago: 'Pendiente' | 'Pagada';
  fecha_pago: string | null;
  estado_boleta: 'Faltante' | 'Subida' | 'Procesada' | 'Con Observación';
}

export type DataSource = 'backend' | 'mock';

export interface ListPagosResult {
  data: CuotaMensual[];
  source: DataSource;
}

/** Entrada para crear un pago. Normalmente se generaría desde backend al crear propuesta. */
export interface PagoInput {
  propuestaId: number;
  mes: string;
  notas?: string | null;
  estadoPago?: 'Pendiente' | 'Pagada';
  fechaPago?: string | null;
  boletaEstado?: 'Faltante' | 'Subida' | 'Procesada' | 'Con Observación';
}

// ─── Mapeo backend ↔ frontend ────────────────────────────────────────────────

function toFrontend(p: BackendPago): CuotaMensual {
  return {
    id: p.id_pago,
    propuestaId: p.id_propuesta,
    mes: p.mes,
    estadoPago: p.estado_pago,
    fechaPago: p.fecha_pago ?? undefined,
    boletaEstado: p.estado_boleta,
    // docenteId, valorCuotaBruto y boletaId se deben rellenar en la capa de vista
    // vinculando con la propuesta correspondiente.
    docenteId: 0,
    valorCuotaBruto: 0,
    notas: p.notas,
    // Reutilizamos el campo notas como mensajes para no romper compatibilidad
    // (ver uso en mensajesAdmin.ts, que idealmente se debe migrar también a este campo).
  };
}

// ─── Operaciones ─────────────────────────────────────────────────────────────

export async function listPagos(): Promise<ListPagosResult> {
  try {
    const rows = await api.get<BackendPago[]>('/pagos');
    return { data: rows.map(toFrontend), source: 'backend' };
  } catch (err) {
    if (err instanceof ApiError && err.isNetwork) {
      return { data: [...mockCuotasMensuales], source: 'mock' };
    }
    throw err;
  }
}

export async function createPago(input: PagoInput): Promise<void> {
  await api.post('/pagos', {
    id_propuesta: input.propuestaId,
    mes: input.mes,
    notas: input.notas ?? null,
    estado_pago: input.estadoPago,
    fecha_pago: input.fechaPago,
    estado_boleta: input.boletaEstado,
  });
}

export async function updatePago(
  id: number,
  input: Partial<Pick<PagoInput, 'estadoPago' | 'fechaPago' | 'boletaEstado' | 'notas'>>,
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (input.estadoPago !== undefined) body.estado_pago = input.estadoPago;
  if (input.fechaPago !== undefined) body.fecha_pago = input.fechaPago;
  if (input.boletaEstado !== undefined) body.estado_boleta = input.boletaEstado;
  if (input.notas !== undefined) body.notas = input.notas;

  await api.put(`/pagos/${id}`, body);
}

export async function deletePago(id: number): Promise<void> {
  await api.del(`/pagos/${id}`);
}
