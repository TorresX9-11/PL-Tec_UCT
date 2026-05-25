// Mock data para la plataforma TEC UCT

export interface Docente {
  id: number;
  carrera: string;
  jornada: 'Diurna' | 'Vespertina';
  rut: string;
  nombreCompleto: string;
  nivelDocente: 'A' | 'B' | 'C';
  semestre: number;
  año: number;
  correo: string;
  montoTotalPropuesta: number;
  numeroCuotas: number;
  estado: 'Pendiente' | 'Pagado' | 'En proceso';
  valorCuotaBruto: number;
  boletaUrl?: string;
  recepcionBHE: boolean;
  saldo: number;
}

export const CARRERAS_DIURNAS = [
  'T.U. G. y Admin. Emp.',
  'T.U. Elect. y Efi. Ener.',
  'T.U. Edu. Parv. y NB1',
  'T.U. Prod. Agro. Sost.',
  'T.U. Informática',
  'T.U. Edu. Dífer.'
];

export const CARRERAS_VESPERTINAS = [
  'T.U. Edu. Parv. NB1 V.',
  'T.U. Ele. y Efi. Ener. V.',
  'T.U. G. y Adm. Emp. V.',
  'T.U. Informática V.'
];

export const TODAS_CARRERAS = [...CARRERAS_DIURNAS, ...CARRERAS_VESPERTINAS];

export const mockDocentes: Docente[] = [
  {
    id: 1,
    carrera: 'T.U. Informática',
    jornada: 'Diurna',
    rut: '12.345.678-9',
    nombreCompleto: 'Juan Carlos Pérez González',
    nivelDocente: 'A',
    semestre: 1,
    año: 2026,
    correo: 'juan.perez@uct.cl',
    montoTotalPropuesta: 2400000,
    numeroCuotas: 4,
    estado: 'Pagado',
    valorCuotaBruto: 600000,
    boletaUrl: '#',
    recepcionBHE: true,
    saldo: 0
  },
  {
    id: 2,
    carrera: 'T.U. G. y Admin. Emp.',
    jornada: 'Diurna',
    rut: '13.456.789-0',
    nombreCompleto: 'María Teresa Rodríguez Silva',
    nivelDocente: 'B',
    semestre: 1,
    año: 2026,
    correo: 'maria.rodriguez@uct.cl',
    montoTotalPropuesta: 1800000,
    numeroCuotas: 4,
    estado: 'En proceso',
    valorCuotaBruto: 450000,
    boletaUrl: '#',
    recepcionBHE: true,
    saldo: 900000
  },
  {
    id: 3,
    carrera: 'T.U. Informática V.',
    jornada: 'Vespertina',
    rut: '14.567.890-1',
    nombreCompleto: 'Pedro Antonio Morales Castro',
    nivelDocente: 'A',
    semestre: 1,
    año: 2026,
    correo: 'pedro.morales@uct.cl',
    montoTotalPropuesta: 2500000,
    numeroCuotas: 5,
    estado: 'Pendiente',
    valorCuotaBruto: 500000,
    recepcionBHE: false,
    saldo: 2500000
  },
  {
    id: 4,
    carrera: 'T.U. Edu. Parv. y NB1',
    jornada: 'Diurna',
    rut: '15.678.901-2',
    nombreCompleto: 'Ana Patricia Fernández López',
    nivelDocente: 'A',
    semestre: 1,
    año: 2026,
    correo: 'ana.fernandez@uct.cl',
    montoTotalPropuesta: 2200000,
    numeroCuotas: 4,
    estado: 'Pagado',
    valorCuotaBruto: 550000,
    boletaUrl: '#',
    recepcionBHE: true,
    saldo: 0
  },
  {
    id: 5,
    carrera: 'T.U. Elect. y Efi. Ener.',
    jornada: 'Diurna',
    rut: '16.789.012-3',
    nombreCompleto: 'Roberto José Valenzuela Muñoz',
    nivelDocente: 'C',
    semestre: 1,
    año: 2026,
    correo: 'roberto.valenzuela@uct.cl',
    montoTotalPropuesta: 1600000,
    numeroCuotas: 4,
    estado: 'En proceso',
    valorCuotaBruto: 400000,
    boletaUrl: '#',
    recepcionBHE: true,
    saldo: 800000
  },
  {
    id: 6,
    carrera: 'T.U. G. y Adm. Emp. V.',
    jornada: 'Vespertina',
    rut: '17.890.123-4',
    nombreCompleto: 'Carmen Gloria Sánchez Torres',
    nivelDocente: 'A',
    semestre: 1,
    año: 2026,
    correo: 'carmen.sanchez@uct.cl',
    montoTotalPropuesta: 2750000,
    numeroCuotas: 5,
    estado: 'En proceso',
    valorCuotaBruto: 550000,
    recepcionBHE: true,
    saldo: 1650000
  },
  {
    id: 7,
    carrera: 'T.U. Prod. Agro. Sost.',
    jornada: 'Diurna',
    rut: '18.901.234-5',
    nombreCompleto: 'Luis Alberto García Ramírez',
    nivelDocente: 'B',
    semestre: 1,
    año: 2026,
    correo: 'luis.garcia@uct.cl',
    montoTotalPropuesta: 2100000,
    numeroCuotas: 4,
    estado: 'Pagado',
    valorCuotaBruto: 525000,
    boletaUrl: '#',
    recepcionBHE: true,
    saldo: 0
  },
  {
    id: 8,
    carrera: 'T.U. Edu. Parv. NB1 V.',
    jornada: 'Vespertina',
    rut: '19.012.345-6',
    nombreCompleto: 'Patricia Alejandra Contreras Vega',
    nivelDocente: 'C',
    semestre: 1,
    año: 2026,
    correo: 'patricia.contreras@uct.cl',
    montoTotalPropuesta: 2000000,
    numeroCuotas: 5,
    estado: 'Pendiente',
    valorCuotaBruto: 400000,
    recepcionBHE: false,
    saldo: 2000000
  }
];

export type EstadoValidacion = 'Inexistente' | 'Por Revisar' | 'Validado';

export interface Boleta {
  id: number;
  nombre: string;
  archivo: string;
  fecha: string;
}

export interface DocenteAcademico {
  id: number;
  nombreCompleto: string;
  rut: string;
  correo: string;
  // Cambio a sistema de 3 estados
  cvActualizado: EstadoValidacion;
  certificadoTitulo: EstadoValidacion;
  certificadoAntecedentes: EstadoValidacion;
  certificadoInhabilidad: EstadoValidacion;
  carnetIdentidad: EstadoValidacion;
  capacitaciones: number;
  contenidoSubido: boolean;
  // Progreso de notas: cuántas evaluaciones tienen nota cargada vs el total esperado
  // (refleja `cursos.notas_ingresadas` / `cursos.notas_curso` en BD agregado por docente)
  notasIngresadas: number;
  notasTotales: number;
  guiaAprendizaje: 'Validado' | 'Pendiente' | 'Sin Guía';
  boletas: Boleta[];
  password?: string; // Para login de docentes
}

export const mockDocentesAcademicos: DocenteAcademico[] = [
  {
    id: 1,
    nombreCompleto: 'Juan Carlos Pérez González',
    rut: '12.345.678-9',
    correo: 'juan.perez@uct.cl',
    cvActualizado: 'Validado',
    certificadoTitulo: 'Validado',
    certificadoAntecedentes: 'Validado',
    certificadoInhabilidad: 'Validado',
    carnetIdentidad: 'Validado',
    capacitaciones: 5,
    contenidoSubido: true,
    notasIngresadas: 4,
    notasTotales: 4,
    guiaAprendizaje: 'Validado',
    boletas: [
      { id: 1, nombre: 'Boleta Marzo 2026', archivo: 'boleta_marzo_2026.pdf', fecha: '15 Marzo 2026' },
      { id: 2, nombre: 'Boleta Febrero 2026', archivo: 'boleta_febrero_2026.pdf', fecha: '15 Febrero 2026' }
    ],
    password: 'docente123'
  },
  {
    id: 2,
    nombreCompleto: 'María Teresa Rodríguez Silva',
    rut: '13.456.789-0',
    correo: 'maria.rodriguez@uct.cl',
    cvActualizado: 'Validado',
    certificadoTitulo: 'Validado',
    certificadoAntecedentes: 'Por Revisar',
    certificadoInhabilidad: 'Validado',
    carnetIdentidad: 'Validado',
    capacitaciones: 3,
    contenidoSubido: true,
    notasIngresadas: 2,
    notasTotales: 4,
    guiaAprendizaje: 'Pendiente',
    boletas: [
      { id: 3, nombre: 'Boleta Marzo 2026', archivo: 'boleta_marzo_2026.pdf', fecha: '10 Marzo 2026' }
    ],
    password: 'docente123'
  },
  {
    id: 3,
    nombreCompleto: 'Pedro Antonio Morales Castro',
    rut: '14.567.890-1',
    correo: 'pedro.morales@uct.cl',
    cvActualizado: 'Por Revisar',
    certificadoTitulo: 'Validado',
    certificadoAntecedentes: 'Validado',
    certificadoInhabilidad: 'Validado',
    carnetIdentidad: 'Inexistente',
    capacitaciones: 7,
    contenidoSubido: false,
    notasIngresadas: 3,
    notasTotales: 3,
    guiaAprendizaje: 'Sin Guía',
    boletas: [],
    password: 'docente123'
  },
  {
    id: 4,
    nombreCompleto: 'Ana Patricia Fernández López',
    rut: '15.678.901-2',
    correo: 'ana.fernandez@uct.cl',
    cvActualizado: 'Validado',
    certificadoTitulo: 'Validado',
    certificadoAntecedentes: 'Validado',
    certificadoInhabilidad: 'Validado',
    carnetIdentidad: 'Validado',
    capacitaciones: 4,
    contenidoSubido: true,
    notasIngresadas: 4,
    notasTotales: 4,
    guiaAprendizaje: 'Validado',
    boletas: [
      { id: 4, nombre: 'Boleta Marzo 2026', archivo: 'boleta_marzo_2026.pdf', fecha: '12 Marzo 2026' }
    ],
    password: 'docente123'
  }
];

// ================================
// MÓDULO CARRERAS Y ASIGNATURAS
// ================================

export interface Carrera {
  id: number;
  codigo: string;
  nombre: string;
  jornada: 'Diurna' | 'Vespertina';
}

export interface Asignatura {
  id: number;
  codigo: string;
  sigla: string;
  nombre: string;
  carreraId: number;
  lineasIngreso: number; // Número de secciones/grupos (1, 2, 3)
  tipoSeccion: 'Sección' | 'Grupo'; // Tipo de división
  semestre: number;
  año: number;
}

// Asignación de docente a una sección de asignatura
export interface SeccionAsignatura {
  id: number;
  asignaturaId: number;
  seccion: number; // 1, 2, 3...
  docenteId?: number; // ID del docente asignado, undefined si no asignado
  horasP: number;
  horasM: number;
  horasA: number;
}

// Mock Data - Carreras
export const mockCarreras: Carrera[] = [
  { id: 1, codigo: 'TUI-D', nombre: 'T.U. Informática', jornada: 'Diurna' },
  { id: 2, codigo: 'TUGAE-D', nombre: 'T.U. G. y Admin. Emp.', jornada: 'Diurna' },
  { id: 3, codigo: 'TUEEE-D', nombre: 'T.U. Elect. y Efi. Ener.', jornada: 'Diurna' },
  { id: 4, codigo: 'TUEPNB1-D', nombre: 'T.U. Edu. Parv. y NB1', jornada: 'Diurna' },
  { id: 5, codigo: 'TUPAS-D', nombre: 'T.U. Prod. Agro. Sost.', jornada: 'Diurna' },
  { id: 6, codigo: 'TUED-D', nombre: 'T.U. Edu. Dífer.', jornada: 'Diurna' },
  { id: 7, codigo: 'TUI-V', nombre: 'T.U. Informática V.', jornada: 'Vespertina' },
  { id: 8, codigo: 'TUGAE-V', nombre: 'T.U. G. y Adm. Emp. V.', jornada: 'Vespertina' },
  { id: 9, codigo: 'TUEEE-V', nombre: 'T.U. Ele. y Efi. Ener. V.', jornada: 'Vespertina' },
  { id: 10, codigo: 'TUEPNB1-V', nombre: 'T.U. Edu. Parv. NB1 V.', jornada: 'Vespertina' }
];

// Mock Data - Asignaturas
export const mockAsignaturas: Asignatura[] = [
  // Informática Diurna
  { id: 1, codigo: 'INF-101', sigla: 'PROG1', nombre: 'Programación I', carreraId: 1, lineasIngreso: 2, tipoSeccion: 'Sección', semestre: 1, año: 2026 },
  { id: 2, codigo: 'INF-201', sigla: 'POO', nombre: 'Programación Orientada a Objetos', carreraId: 1, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },
  { id: 3, codigo: 'INF-302', sigla: 'BD', nombre: 'Bases de Datos', carreraId: 1, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },
  { id: 4, codigo: 'INF-401', sigla: 'REDES', nombre: 'Redes de Computadores', carreraId: 1, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },
  { id: 5, codigo: 'INF-405', sigla: 'SEG', nombre: 'Seguridad Informática', carreraId: 1, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },

  // Gestión y Administración Diurna
  { id: 6, codigo: 'ADM-101', sigla: 'CONT', nombre: 'Contabilidad General', carreraId: 2, lineasIngreso: 3, tipoSeccion: 'Grupo', semestre: 1, año: 2026 },
  { id: 7, codigo: 'ADM-205', sigla: 'RRHH', nombre: 'Gestión de Recursos Humanos', carreraId: 2, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },
  { id: 8, codigo: 'ADM-301', sigla: 'MARK', nombre: 'Marketing Estratégico', carreraId: 2, lineasIngreso: 2, tipoSeccion: 'Grupo', semestre: 1, año: 2026 },
  { id: 9, codigo: 'ADM-401', sigla: 'FIN', nombre: 'Finanzas Corporativas', carreraId: 2, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },

  // Electricidad y Eficiencia Energética Diurna
  { id: 10, codigo: 'ELE-101', sigla: 'CIRC', nombre: 'Circuitos Eléctricos', carreraId: 3, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },
  { id: 11, codigo: 'ELE-201', sigla: 'ELEC', nombre: 'Electrónica Industrial', carreraId: 3, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },
  { id: 12, codigo: 'ELE-301', sigla: 'ENER', nombre: 'Sistemas de Energía', carreraId: 3, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },

  // Educación Parvularia Diurna
  { id: 13, codigo: 'EDU-105', sigla: 'PSIC', nombre: 'Psicología del Desarrollo', carreraId: 4, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },
  { id: 14, codigo: 'EDU-201', sigla: 'DID', nombre: 'Didáctica de la Educación Inicial', carreraId: 4, lineasIngreso: 2, tipoSeccion: 'Sección', semestre: 1, año: 2026 },
  { id: 15, codigo: 'EDU-305', sigla: 'EVAL', nombre: 'Evaluación en Educación Inicial', carreraId: 4, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },

  // Informática Vespertina
  { id: 16, codigo: 'INF-101V', sigla: 'PROG1', nombre: 'Programación I', carreraId: 7, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },
  { id: 17, codigo: 'INF-201V', sigla: 'POO', nombre: 'Programación Orientada a Objetos', carreraId: 7, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },
  { id: 18, codigo: 'INF-302V', sigla: 'BD', nombre: 'Bases de Datos', carreraId: 7, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },
  { id: 19, codigo: 'INF-401V', sigla: 'REDES', nombre: 'Redes de Computadores', carreraId: 7, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 },
  { id: 20, codigo: 'INF-405V', sigla: 'SEG', nombre: 'Seguridad Informática', carreraId: 7, lineasIngreso: 1, tipoSeccion: 'Sección', semestre: 1, año: 2026 }
];

// Mock Data - Secciones de Asignaturas con Docentes Asignados
export const mockSeccionesAsignaturas: SeccionAsignatura[] = [
  // INF-101 (Programación I) - 2 secciones
  { id: 1, asignaturaId: 1, seccion: 1, docenteId: 1, horasP: 60, horasM: 20, horasA: 10 },
  { id: 2, asignaturaId: 1, seccion: 2, docenteId: 3, horasP: 60, horasM: 20, horasA: 10 },

  // INF-201 (POO) - 1 sección
  { id: 3, asignaturaId: 2, seccion: 1, docenteId: 1, horasP: 50, horasM: 15, horasA: 5 },

  // INF-302 (BD) - 1 sección
  { id: 4, asignaturaId: 3, seccion: 1, docenteId: 1, horasP: 45, horasM: 15, horasA: 10 },

  // ADM-101 (Contabilidad) - 3 grupos
  { id: 5, asignaturaId: 6, seccion: 1, docenteId: 2, horasP: 40, horasM: 20, horasA: 10 },
  { id: 6, asignaturaId: 6, seccion: 2, docenteId: 6, horasP: 40, horasM: 20, horasA: 10 },
  { id: 7, asignaturaId: 6, seccion: 3, docenteId: undefined, horasP: 40, horasM: 20, horasA: 10 }, // Sin asignar

  // ADM-301 (Marketing) - 2 grupos
  { id: 8, asignaturaId: 8, seccion: 1, docenteId: 2, horasP: 35, horasM: 15, horasA: 10 },
  { id: 9, asignaturaId: 8, seccion: 2, docenteId: undefined, horasP: 35, horasM: 15, horasA: 10 }, // Sin asignar

  // EDU-201 (Didáctica) - 2 secciones
  { id: 10, asignaturaId: 14, seccion: 1, docenteId: 4, horasP: 60, horasM: 15, horasA: 10 },
  { id: 11, asignaturaId: 14, seccion: 2, docenteId: 4, horasP: 60, horasM: 15, horasA: 10 }
];

// ================================
// SISTEMA PMA - MÓDULO ADMINISTRACIÓN
// ================================

// CAPA 1: TABLA MAESTRA DE DOCENTES (Simplificado)
export interface DocenteMaestro {
  id: number;
  rut: string; // Sin guión ni DV
  dv: string; // Dígito verificador separado
  nombreCompleto: string;
  correo: string;
  nivelDocente?: 'A' | 'B' | 'C'; // Opcional - sin nivel no se puede hacer propuesta económica
  fechaIngreso: string;
}

// Helper para extraer RUT y DV
export function parseRUT(rutCompleto: string): { rut: string; dv: string } {
  const cleaned = rutCompleto.replace(/\./g, '').replace('-', '');
  const dv = cleaned.slice(-1);
  const rut = cleaned.slice(0, -1);
  return { rut, dv };
}

// Helper para formatear RUT
export function formatRUT(rut: string, dv: string): string {
  return `${rut}-${dv}`;
}

// CAPA 2: DESIGNACIÓN PMA - Ahora se maneja mediante SeccionAsignatura (ver arriba)

// CAPA 3: PROPUESTA SEMESTRAL (AUTO-GENERADA)
export interface PropuestaSemestral {
  id: number;
  docenteId: number;
  semestre: number;
  año: number;
  totalHorasP: number;
  totalHorasM: number;
  totalHorasA: number;
  totalHoras: number;
  montoTotalPropuesta: number;
  numeroCuotas: number;
  valorCuotaBruto: number;
  estadoPago: 'Pendiente' | 'En Proceso' | 'Pagado';
  cuotasPagadas: number;
  saldo: number;
  // Estados de boletas
  boletasSubidas: number;
  boletasEstado: 'Sin Boletas' | 'Incompletas' | 'Procesadas' | 'Con Observación' | 'Todas OK';
  recepcionBHE: boolean;
}

// DETALLE DE CUOTAS MENSUALES
export interface CuotaMensual {
  id: number;
  propuestaId: number;
  numeroCuota: number;
  mes: string;
  montoBruto: number;
  estadoPago: 'Pendiente' | 'Pagada';
  fechaPago?: string;
  boletaId?: number;
  boletaEstado?: 'Inexistente' | 'Subida' | 'Procesada' | 'Con Observación';
  observaciones?: string;
}

// Mock Data - Docentes Maestros
export const mockDocentesMaestros: DocenteMaestro[] = [
  {
    id: 1,
    rut: '12345678',
    dv: '9',
    nombreCompleto: 'Juan Carlos Pérez González',
    correo: 'juan.perez@uct.cl',
    nivelDocente: 'A',
    fechaIngreso: '2020-03-15'
  },
  {
    id: 2,
    rut: '13456789',
    dv: '0',
    nombreCompleto: 'María Teresa Rodríguez Silva',
    correo: 'maria.rodriguez@uct.cl',
    nivelDocente: 'B',
    fechaIngreso: '2019-08-01'
  },
  {
    id: 3,
    rut: '14567890',
    dv: '1',
    nombreCompleto: 'Pedro Antonio Morales Castro',
    correo: 'pedro.morales@uct.cl',
    nivelDocente: 'A',
    fechaIngreso: '2021-03-10'
  },
  {
    id: 4,
    rut: '15678901',
    dv: '2',
    nombreCompleto: 'Ana Patricia Fernández López',
    correo: 'ana.fernandez@uct.cl',
    nivelDocente: 'A',
    fechaIngreso: '2018-03-05'
  },
  {
    id: 5,
    rut: '16789012',
    dv: '3',
    nombreCompleto: 'Roberto José Valenzuela Muñoz',
    correo: 'roberto.valenzuela@uct.cl',
    // nivelDocente sin asignar - no puede tener propuesta económica aún
    fechaIngreso: '2026-03-01'
  },
  {
    id: 6,
    rut: '17890123',
    dv: '4',
    nombreCompleto: 'Carmen Gloria Sánchez Torres',
    correo: 'carmen.sanchez@uct.cl',
    nivelDocente: 'B',
    fechaIngreso: '2022-03-15'
  }
];

// Mock Data - Designaciones PMA ahora se manejan mediante mockSeccionesAsignaturas (ver arriba)

// Función para calcular propuesta automáticamente basada en secciones asignadas.
// `valorPropuesta` es el monto total que el cliente recibe desde otra parte y carga manualmente.
export function calcularPropuestaSemestral(
  docenteId: number,
  semestre: number,
  año: number,
  valorPropuesta: number = 0
): PropuestaSemestral {
  // Obtener todas las secciones del docente
  const seccionesDocente = mockSeccionesAsignaturas.filter(s => s.docenteId === docenteId);

  // Filtrar por semestre y año de las asignaturas
  const seccionesFiltradas = seccionesDocente.filter(seccion => {
    const asignatura = mockAsignaturas.find(a => a.id === seccion.asignaturaId);
    return asignatura && asignatura.semestre === semestre && asignatura.año === año;
  });

  const totalHorasP = seccionesFiltradas.reduce((sum, s) => sum + s.horasP, 0);
  const totalHorasM = seccionesFiltradas.reduce((sum, s) => sum + s.horasM, 0);
  const totalHorasA = seccionesFiltradas.reduce((sum, s) => sum + s.horasA, 0);
  const totalHoras = totalHorasP + totalHorasM + totalHorasA;
  const montoTotal = valorPropuesta;

  // Determinar jornada basada en la carrera de la primera asignatura
  const primeraAsignatura = seccionesFiltradas.length > 0
    ? mockAsignaturas.find(a => a.id === seccionesFiltradas[0].asignaturaId)
    : null;
  const carrera = primeraAsignatura ? mockCarreras.find(c => c.id === primeraAsignatura.carreraId) : null;
  const numeroCuotas = carrera?.jornada === 'Vespertina' ? 5 : 4;
  const valorCuota = numeroCuotas > 0 ? Math.round(montoTotal / numeroCuotas) : 0;

  return {
    id: docenteId,
    docenteId,
    semestre,
    año,
    totalHorasP,
    totalHorasM,
    totalHorasA,
    totalHoras,
    montoTotalPropuesta: montoTotal,
    numeroCuotas,
    valorCuotaBruto: valorCuota,
    estadoPago: 'Pendiente',
    cuotasPagadas: 0,
    saldo: montoTotal,
    boletasSubidas: 0,
    boletasEstado: 'Sin Boletas',
    recepcionBHE: false
  };
}

// Mock Data - Propuestas Semestrales (valor total ingresado manualmente)
export const mockPropuestasSemestrales: PropuestaSemestral[] = [
  {
    ...calcularPropuestaSemestral(1, 1, 2026, 3450000),
    estadoPago: 'Pagado',
    cuotasPagadas: 4,
    saldo: 0,
    boletasSubidas: 4,
    boletasEstado: 'Todas OK',
    recepcionBHE: true
  },
  {
    ...calcularPropuestaSemestral(2, 1, 2026, 1560000),
    estadoPago: 'En Proceso',
    cuotasPagadas: 2,
    saldo: 840000,
    boletasSubidas: 2,
    boletasEstado: 'Incompletas',
    recepcionBHE: true
  },
  {
    ...calcularPropuestaSemestral(3, 1, 2026, 1350000),
    estadoPago: 'Pendiente',
    cuotasPagadas: 0,
    saldo: 1350000,
    boletasSubidas: 0,
    boletasEstado: 'Sin Boletas',
    recepcionBHE: false
  },
  {
    ...calcularPropuestaSemestral(4, 1, 2026, 2210000),
    estadoPago: 'Pagado',
    cuotasPagadas: 4,
    saldo: 0,
    boletasSubidas: 4,
    boletasEstado: 'Todas OK',
    recepcionBHE: true
  }
];
