import { api } from './apiClient';

export interface DashboardStats {
  totalDocentes: number;
  cvCompleto: number;
  documentacionCompleta: number;
  contenidoAlDia: number;
  notasAlDia: number;
}

export interface DocenteAcademico {
  rut_docente: number;
  dv: string;
  correo_usuario: string;
  contacto: string;
  nombre: string;
  nivel_docente: string;
  estado_cv: 'Inexistente' | 'Por Revisar' | 'Validado';
  estado_titulo: 'Inexistente' | 'Por Revisar' | 'Validado';
  estado_antecedentes: 'Inexistente' | 'Por Revisar' | 'Validado';
  estado_inhabilidad: 'Inexistente' | 'Por Revisar' | 'Validado';
  capacitaciones: number;
}

export interface GrupoAcademico {
  id_grupo: number;
  seccion: string;
  subgrupo: string | null;
  jornada: string;
  contenido_blackboard: 'Inexistente' | 'Por Revisar' | 'Validado';
  guia_aprendizaje: 'Inexistente' | 'Por Revisar' | 'Validado';
  notas_estado: 'Inexistente' | 'Por Revisar' | 'Validado';
  id_curso: string;
  nombre_curso: string;
  notas_curso: number;
  notas_ingresadas: number;
  rut_docente: number | null;
  nombre_docente: string | null;
}

export async function getDashboardStats(carreraId: string): Promise<DashboardStats> {
  return await api.get<DashboardStats>(`/academico/dashboard?carreraId=${encodeURIComponent(carreraId)}`);
}

export async function getDocentesPorCarrera(carreraId: string): Promise<DocenteAcademico[]> {
  return await api.get<DocenteAcademico[]>(`/academico/docentes?carreraId=${encodeURIComponent(carreraId)}`);
}

export async function validarDocente(rut: number, estados: Partial<DocenteAcademico>): Promise<void> {
  await api.put(`/academico/docentes/${rut}/validar`, estados);
}

export async function getGruposPorCarrera(carreraId: string): Promise<GrupoAcademico[]> {
  return await api.get<GrupoAcademico[]>(`/academico/grupos?carreraId=${encodeURIComponent(carreraId)}`);
}

export async function validarGrupo(id_grupo: number, estados: Partial<GrupoAcademico>): Promise<void> {
  await api.put(`/academico/grupos/${id_grupo}/validar`, estados);
}
