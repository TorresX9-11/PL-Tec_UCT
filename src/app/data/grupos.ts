/**
 * Acceso a datos del recurso `grupos` — Plataforma TEC UCT (Fase 2+)
 *
 * En el backend la tabla `grupos` representa lo que el frontend llama
 * "secciones" de una asignatura (SeccionAsignatura): cada fila es una sección
 * (1, 2 o 3) de un curso con su carga horaria PMA.
 *
 * Mapeo:
 *  - grupos.seccion ('1'|'2'|'3')              → SeccionAsignatura.seccion (number)
 *  - horas_presencial/mixto/administrativo     → horasP / horasM / horasA
 *  - Enlace con la asignatura: se resuelve por la clave compuesta del curso
 *    (id_carrera + id_curso) usando el MISMO id sintético que `cursos.ts`.
 *
 * Campos solo-frontend que NO existen en el backend (no se persisten):
 *  - `subGrupo` (división A/B), `docenteId` (designación por sección) y las
 *    validaciones académicas. La designación de docente por sección se mantiene
 *    en mock por ahora.
 *
 * Reglas de negocio (validar en la UI, ver `getEstadoAsignatura`):
 *  - Máximo 3 secciones por curso.
 *  - Si hay 2 o 3 secciones, NO pueden existir grupos (subgrupos).
 *  - Los grupos (A/B) solo pueden existir cuando hay una única sección activa.
 */

import { api, ApiError } from './apiClient';
import { mockSeccionesAsignaturas, type SeccionAsignatura } from './mockData';
import { syntheticCursoId, type DataSource } from './cursos';

/** Forma cruda devuelta por el backend (mapea 1:1 a la tabla `grupos`). */
export interface BackendGrupo {
  id_grupo: number;
  id_carrera: string;
  id_curso: string;
  seccion: '1' | '2' | '3';
  horas_presencial: number | null;
  horas_mixto: number | null;
  horas_administrativo: number | null;
}

export interface ListGruposResult {
  data: SeccionAsignatura[];
  source: DataSource;
}

/** Entrada para crear una sección (grupo) desde el frontend. */
export interface GrupoInput {
  idCarrera: string;
  idCurso: string;
  seccion: number; // 1 | 2 | 3
  horasP: number;
  horasM: number;
  horasA: number;
}

// ─── Mapeo backend ↔ frontend ────────────────────────────────────────────────

function toFrontend(g: BackendGrupo): SeccionAsignatura {
  return {
    id: g.id_grupo,
    asignaturaId: syntheticCursoId(g.id_carrera, g.id_curso),
    seccion: Number(g.seccion),
    horasP: g.horas_presencial ?? 0,
    horasM: g.horas_mixto ?? 0,
    horasA: g.horas_administrativo ?? 0,
  };
}

function seccionToBackend(n: number): BackendGrupo['seccion'] {
  const clamped = Math.min(3, Math.max(1, Math.trunc(n) || 1));
  return String(clamped) as BackendGrupo['seccion'];
}

// ─── Operaciones ─────────────────────────────────────────────────────────────

/**
 * Lista secciones (grupos). Si el backend está caído (error de red), devuelve
 * los datos mock con `source: 'mock'`. Cualquier otro error se propaga.
 */
export async function listGrupos(): Promise<ListGruposResult> {
  try {
    const rows = await api.get<BackendGrupo[]>('/grupos');
    return { data: rows.map(toFrontend), source: 'backend' };
  } catch (err) {
    if (err instanceof ApiError && err.isNetwork) {
      return { data: [...mockSeccionesAsignaturas], source: 'mock' };
    }
    throw err;
  }
}

/** Crea una sección (grupo) en el backend (requiere JWT admin/coordinador). */
export async function createGrupo(input: GrupoInput): Promise<void> {
  await api.post('/grupos', {
    id_carrera: input.idCarrera,
    id_curso: input.idCurso,
    seccion: seccionToBackend(input.seccion),
    horas_presencial: input.horasP,
    horas_mixto: input.horasM,
    horas_administrativo: input.horasA,
  });
}

/** Actualiza una sección (grupo) por su id (requiere JWT admin/coordinador). */
export async function updateGrupo(
  idGrupo: number,
  input: Pick<GrupoInput, 'horasP' | 'horasM' | 'horasA'>,
): Promise<void> {
  await api.put(`/grupos/${idGrupo}`, {
    horas_presencial: input.horasP,
    horas_mixto: input.horasM,
    horas_administrativo: input.horasA,
  });
}

/** Elimina una sección (grupo) por su id (requiere JWT admin). */
export async function deleteGrupo(idGrupo: number): Promise<void> {
  await api.del(`/grupos/${idGrupo}`);
}
