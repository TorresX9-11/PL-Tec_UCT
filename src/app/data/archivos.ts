import { api } from './apiClient';

export interface BackendArchivo {
  id_archivo: number;
  correo_usuario: string | null;
  ruta: string;
  id_carrera: string | null;
  id_curso: string | null;
  fecha_subida?: string;
}

export interface Archivo {
  id: number;
  correoUsuario: string | null;
  ruta: string;
  idCarrera: string | null;
  idCurso: string | null;
  nombre: string;
  fechaSubida?: string;
}

export interface UploadArchivoInput {
  correo_usuario?: string;
  ruta: string;
  id_carrera?: string;
  id_curso?: string;
}

function toFrontend(a: BackendArchivo): Archivo {
  // Extract filename from ruta
  const parts = a.ruta.split('/');
  const nombre = parts[parts.length - 1];

  return {
    id: a.id_archivo,
    correoUsuario: a.correo_usuario,
    ruta: a.ruta,
    idCarrera: a.id_carrera,
    idCurso: a.id_curso,
    nombre,
    fechaSubida: a.fecha_subida
  };
}

export async function listArchivos(): Promise<Archivo[]> {
  const rows = await api.get<BackendArchivo[]>('/archivos');
  return rows.map(toFrontend);
}

export async function getArchivo(id: number): Promise<Archivo> {
  const row = await api.get<BackendArchivo>(`/archivos/${id}`);
  return toFrontend(row);
}

export async function uploadArchivo(input: UploadArchivoInput): Promise<Archivo> {
  const row = await api.post<BackendArchivo>('/archivos', input);
  return toFrontend(row);
}

export async function uploadFisico(file: File, correo: string, ruta: string): Promise<Archivo> {
  const formData = new FormData();
  formData.append('correo_usuario', correo);
  formData.append('ruta', ruta);
  formData.append('archivo', file);

  const row = await api.post<BackendArchivo>('/archivos/upload', formData);
  return toFrontend(row);
}

export async function deleteArchivo(id: number): Promise<void> {
  await api.del(`/archivos/${id}`);
}
