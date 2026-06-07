/**
 * Capa de abstracción API — Plataforma TEC UCT
 *
 * Versión actual (mock): re-exporta helpers y tipos desde mockData.ts.
 * Versión futura (NestJS): reemplazar los re-exports por llamadas fetch/axios
 * a la API REST. Los componentes que importen de aquí no cambian.
 */

// ─── TIPOS ─────────────────────────────────────────────────────────────────
export type {
  DocenteMaestro,
  DocenteAcademico,
  EstadoValidacion,
  Boleta,
  Carrera,
  Asignatura,
  SeccionAsignatura,
  PropuestaSemestral,
  CuotaMensual,
  CuotaConContexto,
  CarreraDisponible,
  Coordinador,
  Supervisor,
} from './mockData';

// ─── HELPERS DE ACCESO A DATOS ───────────────────────────────────────────────
export {
  getDocenteById,
  getDocenteByCredenciales,
  getPropuestaDocente,
  getCuotasDocente,
  getBoletasPendientes,
  getRamosDocente,
  getMesesCuotas,
  getBoletaById,
  getCuotasAdmin,
  getNombreCarrera,
  getCarrerasByCoordinadorId,
  parseRUT,
  formatRUT,
} from './mockData';

// ─── DATOS MOCK (para compatibilidad durante la fase mock) ──────────────────
// Cuando exista backend, estos exports se eliminarán y los componentes
// consumirán únicamente a través de los helpers de arriba.
export {
  mockDocentesMaestros,
  mockDocentesAcademicos,
  mockCarreras,
  mockAsignaturas,
  mockSeccionesAsignaturas,
  mockPropuestasSemestrales,
  mockCuotasMensuales,
  mockCoordinadores,
  mockSupervisores,
  mockCarrerasDisponibles,
  CARRERAS_DIURNAS,
  CARRERAS_VESPERTINAS,
  TODAS_CARRERAS,
} from './mockData';
