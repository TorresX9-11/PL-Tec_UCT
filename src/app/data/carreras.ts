/**
 * Acceso a datos del recurso `carreras` — Plataforma TEC UCT (Fase 2)
 *
 * Capa adaptadora entre el backend REST (tabla normalizada `carreras`,
 * snake_case, jornada en minúscula, PK = id_carrera CHAR(4)) y el tipo
 * `Carrera` que consume el frontend (id numérico, jornada capitalizada).
 *
 * Estrategia: si el backend no está disponible (error de red), las lecturas
 * caen automáticamente a los datos mock para no romper la UI en modo demo.
 * Las escrituras requieren backend + JWT (rutas protegidas).
 */

import { api, ApiError } from './apiClient';
import { mockCarreras, type Carrera } from './mockData';

/** Forma cruda devuelta por el backend (mapea 1:1 a la tabla `carreras`). */
interface BackendCarrera {
  id_carrera: string;
  nombre: string;
  jornada: 'diurno' | 'vespertino';
}

export type DataSource = 'backend' | 'mock';

export interface ListCarrerasResult {
  data: Carrera[];
  source: DataSource;
}

// ─── Mapeo backend ↔ frontend ────────────────────────────────────────────────

function jornadaToFrontend(j: BackendCarrera['jornada']): Carrera['jornada'] {
  return j === 'vespertino' ? 'Vespertina' : 'Diurna';
}

function jornadaToBackend(j: Carrera['jornada']): BackendCarrera['jornada'] {
  return j === 'Vespertina' ? 'vespertino' : 'diurno';
}

/**
 * El backend no expone un id numérico (la PK es el código). Sintetizamos un id
 * estable por posición de carga solo para keys de React y la columna "ID".
 * Las operaciones contra el backend siempre usan `codigo` (= id_carrera).
 */
function toFrontend(b: BackendCarrera, index: number): Carrera {
  return {
    id: index + 1,
    codigo: b.id_carrera,
    nombre: b.nombre,
    jornada: jornadaToFrontend(b.jornada),
  };
}

// ─── Operaciones ─────────────────────────────────────────────────────────────

/**
 * Lista carreras. Si el backend está caído (error de red), devuelve los datos
 * mock con `source: 'mock'`. Cualquier otro error se propaga.
 */
export async function listCarreras(): Promise<ListCarrerasResult> {
  try {
    const rows = await api.get<BackendCarrera[]>('/carreras');
    return { data: rows.map(toFrontend), source: 'backend' };
  } catch (err) {
    if (err instanceof ApiError && err.isNetwork) {
      return { data: mockCarreras, source: 'mock' };
    }
    throw err;
  }
}

/** Crea una carrera en el backend (requiere JWT admin/coordinador). */
export async function createCarrera(input: Omit<Carrera, 'id'>): Promise<void> {
  await api.post('/carreras', {
    id_carrera: input.codigo,
    nombre: input.nombre,
    jornada: jornadaToBackend(input.jornada),
  });
}

/** Actualiza una carrera identificada por su código (requiere JWT). */
export async function updateCarrera(
  codigo: string,
  input: Pick<Carrera, 'nombre' | 'jornada'>,
): Promise<void> {
  await api.put(`/carreras/${encodeURIComponent(codigo)}`, {
    nombre: input.nombre,
    jornada: jornadaToBackend(input.jornada),
  });
}

/** Elimina una carrera por su código (requiere JWT admin). */
export async function deleteCarrera(codigo: string): Promise<void> {
  await api.del(`/carreras/${encodeURIComponent(codigo)}`);
}
