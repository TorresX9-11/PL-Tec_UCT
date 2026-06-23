/**
 * Acceso a datos del recurso `cursos` — Plataforma TEC UCT (Fase 2+)
 *
 * Capa adaptadora entre el backend REST (tabla `cursos`, PK compuesta
 * id_carrera + id_curso) y el tipo `Asignatura` que consume el frontend.
 *
 * Decisión de mapeo (acordada con el usuario):
 *  - `id_curso` (parte de la PK) corresponde a la SIGLA del curso.
 *  - El backend no almacena `codigo`, `lineasIngreso`, `tipoSeccion` ni `año`:
 *    son campos solo-frontend y no se persisten.
 *  - `jornada` del curso se deriva de la carrera seleccionada.
 *
 * Estrategia: si el backend no está disponible (error de red), las lecturas
 * caen automáticamente a los datos mock para no romper la UI en modo demo.
 * Las escrituras requieren backend + JWT (rutas protegidas admin/coordinador).
 */

import { api, ApiError } from './apiClient';
import { mockAsignaturas, mockCarreras, type Asignatura } from './mockData';

/** Forma cruda devuelta por el backend (mapea 1:1 a la tabla `cursos`). */
export interface BackendCurso {
  id_carrera: string;
  id_curso: string;
  jornada: 'diurno' | 'vespertino';
  nombre: string;
  rut_docente: number | null;
  semestre: '1' | '2' | '3' | '4' | '5' | '6';
  notas_ingresadas: number | null;
  notas_curso: number;
}

export type DataSource = 'backend' | 'mock';

/**
 * Asignatura enriquecida con la clave compuesta del backend. El frontend usa
 * `id` numérico (sintético, estable por posición de carga) para keys de React y
 * para enlazar secciones; las operaciones contra el backend usan la PK real
 * (`idCarrera` + `idCurso`).
 */
export interface CursoAsignatura extends Asignatura {
  idCarrera: string;
  idCurso: string;
}

export interface ListCursosResult {
  data: CursoAsignatura[];
  source: DataSource;
}

/** Entrada para crear/editar un curso desde el frontend. */
export interface CursoInput {
  /** Código de carrera del backend (id_carrera, CHAR 4). */
  idCarrera: string;
  /** Sigla del curso = id_curso (CHAR 5). */
  sigla: string;
  nombre: string;
  semestre: number;
  jornada: 'diurno' | 'vespertino';
}

// ─── Mapeo backend ↔ frontend ────────────────────────────────────────────────

/**
 * Sintetiza un id numérico estable a partir de la clave compuesta para keys de
 * React, columna "ID" y enlace con secciones. Es determinístico por (carrera,
 * curso) para que las secciones (grupos) puedan resolver su `asignaturaId`.
 */
export function syntheticCursoId(idCarrera: string, idCurso: string): number {
  const key = `${idCarrera}::${idCurso}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function carreraIdFromCodigo(codigo: string): number {
  const found = mockCarreras.find((c) => c.codigo === codigo);
  return found ? found.id : 0;
}

function toFrontend(b: BackendCurso): CursoAsignatura {
  return {
    id: syntheticCursoId(b.id_carrera, b.id_curso),
    codigo: b.id_curso,
    sigla: b.id_curso,
    nombre: b.nombre,
    carreraId: carreraIdFromCodigo(b.id_carrera),
    lineasIngreso: 1,
    tipoSeccion: 'Sección',
    semestre: Number(b.semestre),
    año: new Date().getFullYear(),
    idCarrera: b.id_carrera,
    idCurso: b.id_curso,
  };
}

function semestreToBackend(n: number): BackendCurso['semestre'] {
  const clamped = Math.min(6, Math.max(1, Math.trunc(n) || 1));
  return String(clamped) as BackendCurso['semestre'];
}

// ─── Operaciones ─────────────────────────────────────────────────────────────

/**
 * Lista cursos. Si el backend está caído (error de red), devuelve los datos
 * mock (mapeados desde `mockAsignaturas`) con `source: 'mock'`. Cualquier otro
 * error se propaga.
 */
export async function listCursos(): Promise<ListCursosResult> {
  try {
    const rows = await api.get<BackendCurso[]>('/cursos');
    return { data: rows.map(toFrontend), source: 'backend' };
  } catch (err) {
    if (err instanceof ApiError && err.isNetwork) {
      const data: CursoAsignatura[] = mockAsignaturas.map((a) => ({
        ...a,
        idCarrera: mockCarreras.find((c) => c.id === a.carreraId)?.codigo ?? '',
        idCurso: a.sigla,
      }));
      return { data, source: 'mock' };
    }
    throw err;
  }
}

/** Crea un curso en el backend (requiere JWT admin/coordinador). */
export async function createCurso(input: CursoInput): Promise<void> {
  await api.post('/cursos', {
    id_carrera: input.idCarrera,
    id_curso: input.sigla.trim(),
    jornada: input.jornada,
    nombre: input.nombre.trim(),
    semestre: semestreToBackend(input.semestre),
    notas_curso: 0,
  });
}

/**
 * Actualiza un curso identificado por su PK compuesta (requiere JWT).
 * No permite cambiar la PK (carrera/sigla); para eso, borrar y recrear.
 */
export async function updateCurso(
  idCarrera: string,
  idCurso: string,
  input: Pick<CursoInput, 'nombre' | 'semestre' | 'jornada'>,
): Promise<void> {
  await api.put(`/cursos/${encodeURIComponent(idCarrera)}/${encodeURIComponent(idCurso)}`, {
    nombre: input.nombre.trim(),
    semestre: semestreToBackend(input.semestre),
    jornada: input.jornada,
  });
}

/** Elimina un curso por su PK compuesta (requiere JWT admin). */
export async function deleteCurso(idCarrera: string, idCurso: string): Promise<void> {
  await api.del(`/cursos/${encodeURIComponent(idCarrera)}/${encodeURIComponent(idCurso)}`);
}
