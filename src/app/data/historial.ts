import { api } from './apiClient';

export type TipoRegistro = 'Validación' | 'Designación' | 'Pago' | 'Boleta' | 'Sistema';

export interface RegistroHistorial {
  id: string;
  fecha: string;
  fechaLabel: string;
  tipo: TipoRegistro;
  modulo: string;
  actor: string;
  docente: string;
  descripcion: string;
  estado: string;
}

export interface ArchivoHistorico {
  id: number;
  periodo_nombre: string;
  fecha_cierre: string;
  url_pdf_historial: string;
  url_zip_boletas: string | null;
}

export async function getHistorialActivo(): Promise<RegistroHistorial[]> {
  return await api.get<RegistroHistorial[]>('/historial/activo');
}

export async function getArchivosHistoricos(): Promise<ArchivoHistorico[]> {
  return await api.get<ArchivoHistorico[]>('/historial/archivos');
}

export async function cerrarSemestre(periodoNombre: string): Promise<{ message: string }> {
  return await api.post<{ message: string }>('/historial/cerrar-semestre', { periodoNombre });
}
