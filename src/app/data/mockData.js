// Mock data para la plataforma TEC UCT
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
// Mock Data - Carreras
export const mockCarreras = [
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
export const mockAsignaturas = [
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
export const mockSeccionesAsignaturas = [
    // INF-101 (Programación I) - 2 secciones
    { id: 1, asignaturaId: 1, seccion: 1, docenteId: 1, horasP: 60, horasM: 20, horasA: 10,
        contenidoBlackboard: 'Validado', notasIngresadas: 2, notasTotales: 2, guiaAprendizaje: 'Validado' },
    { id: 2, asignaturaId: 1, seccion: 2, docenteId: 3, horasP: 60, horasM: 20, horasA: 10,
        contenidoBlackboard: 'Inexistente', notasIngresadas: 3, notasTotales: 3, guiaAprendizaje: 'Inexistente' },
    // INF-201 (POO) - 1 sección
    { id: 3, asignaturaId: 2, seccion: 1, docenteId: 1, horasP: 50, horasM: 15, horasA: 5,
        contenidoBlackboard: 'Validado', notasIngresadas: 1, notasTotales: 1, guiaAprendizaje: 'Validado' },
    // INF-302 (BD) - 1 sección
    { id: 4, asignaturaId: 3, seccion: 1, docenteId: 1, horasP: 45, horasM: 15, horasA: 10,
        contenidoBlackboard: 'Validado', notasIngresadas: 1, notasTotales: 1, guiaAprendizaje: 'Validado' },
    // ADM-101 (Contabilidad) - 3 grupos
    { id: 5, asignaturaId: 6, seccion: 1, docenteId: 2, horasP: 40, horasM: 20, horasA: 10,
        contenidoBlackboard: 'Validado', notasIngresadas: 1, notasTotales: 2, guiaAprendizaje: 'Por Revisar' },
    { id: 6, asignaturaId: 6, seccion: 2, docenteId: 6, horasP: 40, horasM: 20, horasA: 10,
        contenidoBlackboard: 'Por Revisar', notasIngresadas: 0, notasTotales: 2, guiaAprendizaje: 'Inexistente' },
    { id: 7, asignaturaId: 6, seccion: 3, docenteId: undefined, horasP: 40, horasM: 20, horasA: 10 }, // Sin asignar
    // ADM-301 (Marketing) - 2 grupos
    { id: 8, asignaturaId: 8, seccion: 1, docenteId: 2, horasP: 35, horasM: 15, horasA: 10,
        contenidoBlackboard: 'Por Revisar', notasIngresadas: 1, notasTotales: 2, guiaAprendizaje: 'Por Revisar' },
    { id: 9, asignaturaId: 8, seccion: 2, docenteId: undefined, horasP: 35, horasM: 15, horasA: 10 }, // Sin asignar
    // EDU-201 (Didáctica) - 2 secciones (ambas Ana)
    { id: 10, asignaturaId: 14, seccion: 1, docenteId: 4, horasP: 60, horasM: 15, horasA: 10,
        contenidoBlackboard: 'Validado', notasIngresadas: 2, notasTotales: 2, guiaAprendizaje: 'Validado' },
    { id: 11, asignaturaId: 14, seccion: 2, docenteId: 4, horasP: 60, horasM: 15, horasA: 10,
        contenidoBlackboard: 'Validado', notasIngresadas: 2, notasTotales: 2, guiaAprendizaje: 'Por Revisar' }
];
/**
 * Estado de las líneas de ingreso de una asignatura, calculado SIEMPRE desde los
 * registros reales de `mockSeccionesAsignaturas` (nunca desde `asignatura.tipoSeccion`
 * ni `asignatura.lineasIngreso`, que quedan como legacy).
 *
 * Reglas de negocio:
 *  - Máximo 3 líneas de ingreso por asignatura.
 *  - Si hay 2+ secciones (sin subGrupo), NO puede haber grupos.
 *  - Si hay 1 sección, puede dividirse en exactamente 2 grupos (A y B).
 */
export function getEstadoAsignatura(secciones) {
    const total = secciones.length;
    const tieneGrupos = secciones.some(s => s.subGrupo);
    const seccionesSinGrupo = secciones.filter(s => !s.subGrupo);
    return { total, tieneGrupos, seccionesSinGrupo };
}
// Helper para extraer RUT y DV
export function parseRUT(rutCompleto) {
    const cleaned = rutCompleto.replace(/\./g, '').replace('-', '');
    const dv = cleaned.slice(-1);
    const rut = cleaned.slice(0, -1);
    return { rut, dv };
}
// Helper para formatear RUT
export function formatRUT(rut, dv) {
    return `${rut}-${dv}`;
}
// Mock Data - Docentes Maestros
export const mockDocentesMaestros = [
    {
        id: 1,
        rut: '12345678',
        dv: '9',
        nombreCompleto: 'Juan Carlos Pérez González',
        correo: 'juan.perez@uct.cl',
        nivelDocente: 'A',
        fechaIngreso: '2020-03-15',
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
            { id: 1, nombre: 'Boleta Abril 2026', archivo: 'boleta_abril_2026.pdf', fecha: '30 Abril 2026', estado: 'Procesada' },
            { id: 2, nombre: 'Boleta Mayo 2026', archivo: 'boleta_mayo_2026.pdf', fecha: '30 Mayo 2026', estado: 'Procesada' },
            { id: 3, nombre: 'Boleta Junio 2026', archivo: 'boleta_junio_2026.pdf', fecha: '30 Junio 2026', estado: 'Procesada' },
            { id: 4, nombre: 'Boleta Julio 2026', archivo: 'boleta_julio_2026.pdf', fecha: '30 Julio 2026', estado: 'Procesada' }
        ],
        password: 'docente123'
    },
    {
        id: 2,
        rut: '13456789',
        dv: '0',
        nombreCompleto: 'María Teresa Rodríguez Silva',
        correo: 'maria.rodriguez@uct.cl',
        nivelDocente: 'B',
        fechaIngreso: '2019-08-01',
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
            { id: 5, nombre: 'Boleta Abril 2026', archivo: 'boleta_abril_2026.pdf', fecha: '30 Abril 2026', estado: 'Procesada' },
            { id: 6, nombre: 'Boleta Mayo 2026', archivo: 'boleta_mayo_2026.pdf', fecha: '30 Mayo 2026', estado: 'Procesada' }
        ],
        password: 'docente123'
    },
    {
        id: 3,
        rut: '14567890',
        dv: '1',
        nombreCompleto: 'Pedro Antonio Morales Castro',
        correo: 'pedro.morales@uct.cl',
        nivelDocente: 'A',
        fechaIngreso: '2021-03-10',
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
        rut: '15678901',
        dv: '2',
        nombreCompleto: 'Ana Patricia Fernández López',
        correo: 'ana.fernandez@uct.cl',
        nivelDocente: 'A',
        fechaIngreso: '2018-03-05',
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
            { id: 7, nombre: 'Boleta Abril 2026', archivo: 'boleta_abril_2026.pdf', fecha: '30 Abril 2026', estado: 'Procesada' },
            { id: 8, nombre: 'Boleta Mayo 2026', archivo: 'boleta_mayo_2026.pdf', fecha: '30 Mayo 2026', estado: 'Procesada' },
            { id: 9, nombre: 'Boleta Junio 2026', archivo: 'boleta_junio_2026.pdf', fecha: '30 Junio 2026', estado: 'Procesada' },
            { id: 10, nombre: 'Boleta Julio 2026', archivo: 'boleta_julio_2026.pdf', fecha: '30 Julio 2026', estado: 'Procesada' }
        ],
        password: 'docente123'
    },
    {
        id: 5,
        rut: '16789012',
        dv: '3',
        nombreCompleto: 'Roberto José Valenzuela Muñoz',
        correo: 'roberto.valenzuela@uct.cl',
        // nivelDocente sin asignar - no puede tener propuesta económica aún
        fechaIngreso: '2026-03-01',
        cvActualizado: 'Inexistente',
        certificadoTitulo: 'Inexistente',
        certificadoAntecedentes: 'Inexistente',
        certificadoInhabilidad: 'Inexistente',
        carnetIdentidad: 'Inexistente',
        capacitaciones: 0,
        contenidoSubido: false,
        notasIngresadas: 0,
        notasTotales: 0,
        guiaAprendizaje: 'Sin Guía',
        boletas: [],
        password: 'docente123'
    },
    {
        id: 6,
        rut: '17890123',
        dv: '4',
        nombreCompleto: 'Carmen Gloria Sánchez Torres',
        correo: 'carmen.sanchez@uct.cl',
        nivelDocente: 'B',
        fechaIngreso: '2022-03-15',
        cvActualizado: 'Validado',
        certificadoTitulo: 'Validado',
        certificadoAntecedentes: 'Validado',
        certificadoInhabilidad: 'Validado',
        carnetIdentidad: 'Validado',
        capacitaciones: 2,
        contenidoSubido: true,
        notasIngresadas: 0,
        notasTotales: 2,
        guiaAprendizaje: 'Pendiente',
        boletas: [],
        password: 'docente123'
    }
];
export const mockDocentesAcademicos = mockDocentesMaestros;
// Mock Data - Designaciones PMA ahora se manejan mediante mockSeccionesAsignaturas (ver arriba)
// Función para calcular propuesta automáticamente basada en secciones asignadas.
// `valorPropuesta` es el monto total que el cliente recibe desde otra parte y carga manualmente.
export function calcularPropuestaSemestral(docenteId, semestre, año, valorPropuesta = 0, seccionesFuente = mockSeccionesAsignaturas) {
    // Obtener todas las secciones del docente
    const seccionesDocente = seccionesFuente.filter(s => s.docenteId === docenteId);
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
export const mockPropuestasSemestrales = [
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
// ================================
// CUOTAS MENSUALES (NUEVO - fase 1 refactor)
// ================================
// Esta es la fuente de verdad cuota-a-cuota: cada cuota tiene su boleta embebida
// (si fue subida). Reemplaza la lógica suelta de `propuesta.boletasSubidas` que
// quedaba desincronizada con `docente.boletas[]`. Se mantienen ambos arrays
// existentes por compat con páginas actuales; las nuevas vistas usan helpers.
// Helper interno para construir cuotas pagadas con boleta procesada
function _cuotaPagada(id, propuestaId, numeroCuota, mes, montoBruto, fechaPago, boleta) {
    return {
        id,
        propuestaId,
        numeroCuota,
        mes,
        montoBruto,
        estadoPago: 'Pagada',
        fechaPago,
        boletaId: boleta.id,
        boletaEstado: 'Procesada'
    };
}
function _cuotaPendiente(id, propuestaId, numeroCuota, mes, montoBruto) {
    return {
        id,
        propuestaId,
        numeroCuota,
        mes,
        montoBruto,
        estadoPago: 'Pendiente',
        boletaEstado: 'Inexistente'
    };
}
// Mock cuotas: derivadas de cada propuesta. La boleta vinculada vive en
// `mockDocentesAcademicos[id].boletas[]` y se enlaza por boletaId.
export const mockCuotasMensuales = [
    // Juan (propuesta 1, diurno, 4 cuotas, todas pagadas)
    _cuotaPagada(1, 1, 1, 'Abril 2026', 862500, '2026-04-30', mockDocentesAcademicos[0].boletas[0]),
    _cuotaPagada(2, 1, 2, 'Mayo 2026', 862500, '2026-05-30', mockDocentesAcademicos[0].boletas[1]),
    _cuotaPagada(3, 1, 3, 'Junio 2026', 862500, '2026-06-30', mockDocentesAcademicos[0].boletas[2]),
    _cuotaPagada(4, 1, 4, 'Julio 2026', 862500, '2026-07-30', mockDocentesAcademicos[0].boletas[3]),
    // María (propuesta 2, diurno, 4 cuotas: 2 pagadas + 2 pendientes)
    _cuotaPagada(5, 2, 1, 'Abril 2026', 390000, '2026-04-30', mockDocentesAcademicos[1].boletas[0]),
    _cuotaPagada(6, 2, 2, 'Mayo 2026', 390000, '2026-05-30', mockDocentesAcademicos[1].boletas[1]),
    _cuotaPendiente(7, 2, 3, 'Junio 2026', 390000),
    _cuotaPendiente(8, 2, 4, 'Julio 2026', 390000),
    // Pedro (propuesta 3, diurno por sus secciones, 4 cuotas, todas pendientes)
    _cuotaPendiente(9, 3, 1, 'Abril 2026', 337500),
    _cuotaPendiente(10, 3, 2, 'Mayo 2026', 337500),
    _cuotaPendiente(11, 3, 3, 'Junio 2026', 337500),
    _cuotaPendiente(12, 3, 4, 'Julio 2026', 337500),
    // Ana (propuesta 4, diurno, 4 cuotas, todas pagadas)
    _cuotaPagada(13, 4, 1, 'Abril 2026', 552500, '2026-04-30', mockDocentesAcademicos[3].boletas[0]),
    _cuotaPagada(14, 4, 2, 'Mayo 2026', 552500, '2026-05-30', mockDocentesAcademicos[3].boletas[1]),
    _cuotaPagada(15, 4, 3, 'Junio 2026', 552500, '2026-06-30', mockDocentesAcademicos[3].boletas[2]),
    _cuotaPagada(16, 4, 4, 'Julio 2026', 552500, '2026-07-30', mockDocentesAcademicos[3].boletas[3])
];
// ================================
// HELPERS TIPADOS (NUEVO - fase 1 refactor)
// ================================
// Funciones de acceso reutilizables entre los 3 módulos (admin/académico/docente).
// Cuando se conecte el backend NestJS, esta capa se reemplaza por `src/app/data/api.ts`
// con la misma firma → ningún componente cambia.
/** Busca un docente (vista académica) por id. */
export function getDocenteById(id) {
    return mockDocentesAcademicos.find(d => d.id === id);
}
/** Login: busca docente por correo/RUT + password. */
export function getDocenteByCredenciales(login, password) {
    return mockDocentesAcademicos.find(d => (d.correo === login || d.rut === login) && d.password === password);
}
/** Devuelve la propuesta semestral activa de un docente. */
export function getPropuestaDocente(docenteId, semestre = 1, año = 2026) {
    return mockPropuestasSemestrales.find(p => p.docenteId === docenteId && p.semestre === semestre && p.año === año);
}
/** Devuelve todas las cuotas mensuales de un docente para un semestre. */
export function getCuotasDocente(docenteId, semestre = 1, año = 2026) {
    const propuesta = getPropuestaDocente(docenteId, semestre, año);
    if (!propuesta)
        return [];
    return mockCuotasMensuales.filter(c => c.propuestaId === propuesta.id);
}
/** Devuelve las cuotas SIN boleta subida (= boletas que el docente debe subir). */
export function getBoletasPendientes(docenteId, semestre = 1, año = 2026) {
    return getCuotasDocente(docenteId, semestre, año).filter(c => !c.boletaId || c.boletaEstado === 'Inexistente');
}
/** Devuelve los ramos asignados a un docente con asignatura y carrera resueltas. */
export function getRamosDocente(docenteId) {
    return mockSeccionesAsignaturas
        .filter(s => s.docenteId === docenteId)
        .map(s => {
        const asignatura = mockAsignaturas.find(a => a.id === s.asignaturaId);
        const carrera = asignatura ? mockCarreras.find(c => c.id === asignatura.carreraId) : undefined;
        return {
            seccion: s,
            asignatura,
            carrera,
            horasTotal: s.horasP + s.horasM + s.horasA
        };
    });
}
/** Genera el listado de meses esperados para las cuotas según jornada y semestre. */
export function getMesesCuotas(jornada, semestre, año) {
    if (semestre === 1) {
        const meses = ['Abril', 'Mayo', 'Junio', 'Julio'];
        if (jornada === 'Vespertina')
            meses.push('Agosto');
        return meses.map(m => `${m} ${año}`);
    }
    // Semestre 2
    const meses = ['Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    if (jornada === 'Vespertina')
        meses.push('Enero');
    return meses.map(m => `${m} ${año}`);
}
/** Busca una boleta por id recorriendo todas las boletas de todos los docentes académicos. */
export function getBoletaById(boletaId) {
    for (const doc of mockDocentesAcademicos) {
        const boleta = doc.boletas.find(b => b.id === boletaId);
        if (boleta)
            return { boleta, docenteId: doc.id };
    }
    return undefined;
}
export function getCuotasAdmin(semestre = 1, año = 2026) {
    const propuestasPorId = new Map(mockPropuestasSemestrales.map(p => [p.id, p]));
    const docentesPorId = new Map(mockDocentesMaestros.map(d => [d.id, d]));
    const out = [];
    for (const cuota of mockCuotasMensuales) {
        const propuesta = propuestasPorId.get(cuota.propuestaId);
        if (!propuesta)
            continue;
        if (propuesta.semestre !== semestre || propuesta.año !== año)
            continue;
        const docente = docentesPorId.get(propuesta.docenteId);
        if (!docente)
            continue;
        const boleta = cuota.boletaId ? getBoletaById(cuota.boletaId)?.boleta : undefined;
        out.push({ cuota, docente, boleta, propuesta });
    }
    return out;
}
export const mockCarrerasDisponibles = [
    { id_carrera: 'GADE', nombre: 'T.U. G. y Admin. Emp.' },
    { id_carrera: 'EENE', nombre: 'T.U. Elect. y Efi. Ener.' },
    { id_carrera: 'EDPA', nombre: 'T.U. Edu. Parv. y NB1' },
    { id_carrera: 'PROA', nombre: 'T.U. Prod. Agro. Sost.' },
    { id_carrera: 'INFO', nombre: 'T.U. Informática' },
    { id_carrera: 'EDDI', nombre: 'T.U. Edu. Dífer.' },
    { id_carrera: 'EPAV', nombre: 'T.U. Edu. Parv. NB1 V.' },
    { id_carrera: 'EEEV', nombre: 'T.U. Ele. y Efi. Ener. V.' },
    { id_carrera: 'GAEV', nombre: 'T.U. G. y Adm. Emp. V.' },
    { id_carrera: 'INFV', nombre: 'T.U. Informática V.' },
];
/** Devuelve el nombre legible de una carrera a partir de su código. */
export function getNombreCarrera(idCarrera) {
    if (!idCarrera)
        return null;
    return mockCarrerasDisponibles.find(c => c.id_carrera === idCarrera)?.nombre ?? idCarrera;
}
/** Mapeo de código de coordinador a IDs numéricos de carrera (para filtros académicos). */
export function getCarrerasByCoordinadorId(carreraId) {
    const mapa = {
        GADE: [2, 8],
        EENE: [3, 9],
        EDPA: [4, 10],
        PROA: [5],
        INFO: [1, 7],
        EDDI: [6]
    };
    return mapa[carreraId] || [];
}
export const mockCoordinadores = [
    { id_coordinador: 1, nombre: 'María González', rut: '12.222.222-2', correo_usuario: 'mgonzalez@uct.cl', id_carrera: 'GADE', tieneCredenciales: true },
    { id_coordinador: 2, nombre: 'Carlos Pérez', rut: '13.333.333-3', correo_usuario: null, id_carrera: 'EDPA', tieneCredenciales: false },
    { id_coordinador: 3, nombre: 'Ana Rodríguez', rut: '14.444.444-4', correo_usuario: 'arodriguez@uct.cl', id_carrera: null, tieneCredenciales: true },
];
export const mockSupervisores = [
    { id_supervisor: 1, nombre: 'Director Área TEC', correo_usuario: 'director.tec@uct.cl', rut: '11.111.111-1' }
];
//# sourceMappingURL=mockData.js.map