import { api, ApiError } from './apiClient';

export interface BackendCapacitacion {
  id_capacitacion: number;
  rut_docente: number;
  nombre: string;
  institucion: string | null;
  anio: number | null;
  horas: number | null;
  archivo_adjunto: string | null;
}

export interface Capacitacion {
  id: number;
  docenteId: number;
  nombre: string;
  institucion: string;
  anio: number;
  horas: number;
  archivoUrl?: string;
}

function toFrontend(c: BackendCapacitacion): Capacitacion {
  return {
    id: c.id_capacitacion,
    docenteId: c.rut_docente,
    nombre: c.nombre,
    institucion: c.institucion || '',
    anio: c.anio || new Date().getFullYear(),
    horas: c.horas || 0,
    archivoUrl: c.archivo_adjunto || undefined,
  };
}

export async function listCapacitaciones(): Promise<Capacitacion[]> {
  try {
    const rows = await api.get<BackendCapacitacion[]>('/capacitaciones');
    return rows.map(toFrontend);
  } catch (err) {
    if (err instanceof ApiError && err.isNetwork) {
      return [];
    }
    throw err;
  }
}

export interface CreateCapacitacionInput {
  rut_docente: number;
  nombre: string;
  institucion?: string;
  anio?: number;
  horas?: number;
  archivo_adjunto?: string;
}

export async function createCapacitacion(input: CreateCapacitacionInput): Promise<Capacitacion> {
  const row = await api.post<BackendCapacitacion>('/capacitaciones', input);
  return toFrontend(row);
}
