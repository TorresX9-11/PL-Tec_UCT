/**
 * Acceso a datos del recurso `docentes` — Plataforma TEC UCT (Fase 2)
 *
 * Adaptador entre el backend REST (tabla `docentes`: rut_docente INT, dv,
 * correo_usuario, contacto, nombre, nivel_docente) y el tipo rico
 * `DocenteMaestro` del frontend.
 *
 * NOTA sobre el modelo: la BD actual NO almacena los estados de validación
 * documental (CV, certificados, boletas, etc.) ni la fecha de ingreso. Esos
 * campos se rellenan con valores neutros al mapear, hasta que se amplíe el
 * esquema. El identificador real para operaciones es `rut_docente`.
 *
 * FK relevante: `docentes.correo_usuario` referencia `usuarios.correo_usuario`.
 * Por eso, al crear/editar, el correo debe corresponder a un usuario existente
 * (o quedar vacío); de lo contrario el backend responde error de BD.
 */

import { api, ApiError } from './apiClient';
import { createUsuario } from './usuarios';
import { mockDocentesMaestros, type DocenteMaestro, type EstadoValidacion } from './mockData';

interface BackendDocente {
  rut_docente: number;
  dv: string;
  correo_usuario: string | null;
  contacto: string | null;
  nombre: string;
  nivel_docente: 'A' | 'B' | 'C' | null;
  fecha_ingreso: string | null;
}

export type DataSource = 'backend' | 'mock';

export interface ListDocentesResult {
  data: DocenteMaestro[];
  source: DataSource;
}

const SIN_VALIDAR: EstadoValidacion = 'Inexistente';

/** Backend → DocenteMaestro. El id del frontend es el propio rut_docente. */
function toFrontend(b: BackendDocente): DocenteMaestro {
  return {
    id: b.rut_docente,
    rut: String(b.rut_docente),
    dv: b.dv,
    nombreCompleto: b.nombre,
    correo: b.correo_usuario ?? '',
    nivelDocente: b.nivel_docente ?? undefined,
    fechaIngreso: b.fecha_ingreso ? new Date(b.fecha_ingreso).toISOString() : '',
    // Campos no almacenados aún en la BD → valores neutros.
    cvActualizado: SIN_VALIDAR,
    certificadoTitulo: SIN_VALIDAR,
    certificadoAntecedentes: SIN_VALIDAR,
    certificadoInhabilidad: SIN_VALIDAR,
    carnetIdentidad: SIN_VALIDAR,
    capacitaciones: 0,
    contenidoSubido: false,
    notasIngresadas: 0,
    notasTotales: 0,
    guiaAprendizaje: 'Sin Guía',
    boletas: [],
  };
}

export async function listDocentes(): Promise<ListDocentesResult> {
  try {
    const rows = await api.get<BackendDocente[]>('/docentes');
    return { data: rows.map(toFrontend), source: 'backend' };
  } catch (err) {
    if (err instanceof ApiError && err.isNetwork) {
      return { data: mockDocentesMaestros, source: 'mock' };
    }
    throw err;
  }
}

export async function getDocente(rut: number): Promise<DocenteMaestro | null> {
  try {
    const row = await api.get<BackendDocente>(`/docentes/${rut}`);
    return toFrontend(row);
  } catch (err) {
    if (err instanceof ApiError && err.isNetwork) {
      return mockDocentesMaestros.find(d => d.id === rut) || null;
    }
    throw err;
  }
}

type DocenteInput = Omit<DocenteMaestro, 'id'>;

/**
 * Crea un docente (requiere JWT admin).
 *
 * Regla de negocio: al agregar un docente con correo, se le crea automáticamente
 * su cuenta de acceso (nivel `docente`) con contraseña temporal = su RUT sin
 * dígito verificador. El docente deberá cambiarla luego. Esto evita el error de
 * clave foránea `docentes.correo_usuario → usuarios.correo_usuario`.
 *
 * Si la cuenta ya existía (correo ya registrado), se omite la creación y solo
 * se enlaza el docente a esa cuenta.
 */
export async function createDocente(input: DocenteInput): Promise<void> {
  const correo = input.correo.trim();

  if (correo) {
    try {
      await createUsuario({
        correo_usuario: correo,
        nombre: input.nombreCompleto,
        // Contraseña temporal = RUT sin dígito verificador.
        contrasena: input.rut,
        nivel: 'docente',
      });
    } catch (err) {
      // 409: la cuenta ya existe → continuamos y solo enlazamos el docente.
      if (!(err instanceof ApiError && err.status === 409)) throw err;
    }
  }

  await api.post('/docentes', {
    rut_docente: Number(input.rut),
    dv: input.dv,
    nombre: input.nombreCompleto,
    correo_usuario: correo || null,
    nivel_docente: input.nivelDocente || null,
    fecha_ingreso: input.fechaIngreso ? new Date(input.fechaIngreso).toISOString().split('T')[0] : null,
  });
}

/**
 * Actualiza un docente por rut. Solo enviamos `correo_usuario` cuando viene un
 * valor no vacío, para no romper la FK al editar otros campos de docentes que
 * tienen correo nulo.
 */
export async function updateDocente(rut: number, input: DocenteInput): Promise<void> {
  const body: Record<string, unknown> = {
    dv: input.dv,
    nombre: input.nombreCompleto,
    nivel_docente: input.nivelDocente ?? null,
    fecha_ingreso: input.fechaIngreso ? new Date(input.fechaIngreso).toISOString().split('T')[0] : null,
  };
  if (input.correo) body.correo_usuario = input.correo;
  await api.put(`/docentes/${rut}`, body);
}

/** Elimina un docente por rut (requiere JWT admin). */
export async function deleteDocente(rut: number): Promise<void> {
  await api.del(`/docentes/${rut}`);
}
