/**
 * Acceso a datos del recurso `propuestas` — Plataforma TEC UCT
 *
 * Adaptador entre el backend REST (tabla `propuestas`) y el tipo
 * `PropuestaSemestral` del frontend.
 */

import { api, ApiError } from './apiClient';
import { mockPropuestasSemestrales, type PropuestaSemestral } from './mockData';

export interface BackendPropuesta {
  id_propuesta: number;
  rut_docente: number;
  valor_propuesta: number;
  cuotas: number;
}

export type DataSource = 'backend' | 'mock';

export interface ListPropuestasResult {
  data: PropuestaSemestral[];
  source: DataSource;
}

/** Entrada para crear/editar una propuesta desde el frontend. */
export interface PropuestaInput {
  docenteId: number; // rut
  montoTotalPropuesta: number;
  numeroCuotas: number;
}

// ─── Mapeo backend ↔ frontend ────────────────────────────────────────────────

function toFrontend(p: BackendPropuesta): PropuestaSemestral {
  return {
    id: p.id_propuesta,
    docenteId: p.rut_docente,
    montoTotalPropuesta: p.valor_propuesta,
    numeroCuotas: p.cuotas,
  };
}

// ─── Operaciones ─────────────────────────────────────────────────────────────

export async function listPropuestas(): Promise<ListPropuestasResult> {
  try {
    const rows = await api.get<BackendPropuesta[]>('/propuestas');
    return { data: rows.map(toFrontend), source: 'backend' };
  } catch (err) {
    if (err instanceof ApiError && err.isNetwork) {
      return { data: [...mockPropuestasSemestrales], source: 'mock' };
    }
    throw err;
  }
}

export async function createPropuesta(input: PropuestaInput): Promise<void> {
  await api.post('/propuestas', {
    rut_docente: input.docenteId,
    valor_propuesta: input.montoTotalPropuesta,
    cuotas: input.numeroCuotas,
  });
}

export async function updatePropuesta(id: number, input: Pick<PropuestaInput, 'montoTotalPropuesta' | 'numeroCuotas'>): Promise<void> {
  await api.put(`/propuestas/${id}`, {
    valor_propuesta: input.montoTotalPropuesta,
    cuotas: input.numeroCuotas,
  });
}

export async function deletePropuesta(id: number): Promise<void> {
  await api.del(`/propuestas/${id}`);
}
