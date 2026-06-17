/**
 * Historial de actividad — Plataforma TEC UCT
 *
 * Construye un registro unificado de actividades del sistema (validaciones,
 * designaciones, pagos y boletas) derivado de los datos mock actuales. Como el
 * resto de la capa de datos (ver `pagosAdmin.ts` y `api.ts`), está pensado para
 * ser reemplazado por llamadas REST sin cambiar los componentes: la función
 * `getHistorial()` mantendría su firma y solo cambiaría su implementación.
 *
 * Los overrides de pago/boleta guardados en localStorage ya están hidratados
 * sobre los arrays mock por `pagosAdmin.ts`, por lo que `getHistorial()` refleja
 * el estado en vivo al recalcularse tras cada cambio.
 */

import {
  mockDocentesMaestros,
  mockSeccionesAsignaturas,
  mockAsignaturas,
  mockCarreras,
  mockCuotasMensuales,
  mockPropuestasSemestrales,
  getBoletaById,
  type EstadoValidacion
} from './mockData';

export type TipoRegistro = 'Validación' | 'Designación' | 'Pago' | 'Boleta';

export interface RegistroHistorial {
  id: string;
  /** Fecha ISO (YYYY-MM-DD) usada para ordenar. */
  fecha: string;
  /** Fecha formateada para mostrar (es-CL). */
  fechaLabel: string;
  tipo: TipoRegistro;
  /** Módulo desde el que se originó la acción. */
  modulo: string;
  /** Rol/usuario que ejecutó la acción. */
  actor: string;
  /** Docente afectado por la acción (o '-'). */
  docente: string;
  descripcion: string;
  /** Estado resultante de la acción. */
  estado: string;
}

const MESES: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
};

/** Convierte una fecha tipo "30 Abril 2026" o "Abril 2026" a ISO YYYY-MM-DD. */
function parseFechaEs(texto: string): string {
  const partes = texto.trim().toLowerCase().split(/\s+/);
  let dia = 1;
  let mesNombre = '';
  let anio = new Date().getFullYear();
  if (partes.length === 3) {
    dia = parseInt(partes[0], 10) || 1;
    mesNombre = partes[1];
    anio = parseInt(partes[2], 10) || anio;
  } else if (partes.length === 2) {
    mesNombre = partes[0];
    anio = parseInt(partes[1], 10) || anio;
  }
  const mes = MESES[mesNombre] ?? 1;
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

function fechaLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-CL');
}

function nombreAsignatura(asignaturaId: number): { sigla: string; nombre: string; carrera: string } {
  const asig = mockAsignaturas.find(a => a.id === asignaturaId);
  const carrera = asig ? mockCarreras.find(c => c.id === asig.carreraId) : undefined;
  return {
    sigla: asig?.sigla ?? `Asig ${asignaturaId}`,
    nombre: asig?.nombre ?? '',
    carrera: carrera?.nombre ?? 'Sin carrera'
  };
}

function nombreDocente(docenteId?: number): string {
  if (docenteId === undefined) return '-';
  return mockDocentesMaestros.find(d => d.id === docenteId)?.nombreCompleto ?? `Docente ${docenteId}`;
}

const DOCUMENTOS_VALIDACION: { campo: keyof typeof mockDocentesMaestros[number]; label: string }[] = [
  { campo: 'cvActualizado', label: 'CV' },
  { campo: 'certificadoTitulo', label: 'Certificado de Título' },
  { campo: 'certificadoAntecedentes', label: 'Certificado de Antecedentes' },
  { campo: 'certificadoInhabilidad', label: 'Certificado de Inhabilidad' },
  { campo: 'carnetIdentidad', label: 'Carnet de Identidad' }
];

/**
 * Devuelve la lista completa de registros de actividad ordenada de la más
 * reciente a la más antigua.
 */
export function getHistorial(): RegistroHistorial[] {
  const registros: RegistroHistorial[] = [];

  // ── Validaciones documentales (módulo Académico) ──────────────────────────
  for (const docente of mockDocentesMaestros) {
    const isoIngreso = docente.fechaIngreso || `${new Date().getFullYear()}-01-01`;
    for (const doc of DOCUMENTOS_VALIDACION) {
      const estado = docente[doc.campo] as EstadoValidacion;
      if (estado === 'Inexistente') continue;
      registros.push({
        id: `val-doc-${docente.id}-${String(doc.campo)}`,
        fecha: isoIngreso,
        fechaLabel: fechaLabel(isoIngreso),
        tipo: 'Validación',
        modulo: 'Académico',
        actor: 'Coordinador Académico',
        docente: docente.nombreCompleto,
        descripcion: `Revisión de ${doc.label}`,
        estado
      });
    }
  }

  // ── Validaciones académicas por ramo (módulo Académico) ───────────────────
  for (const seccion of mockSeccionesAsignaturas) {
    if (seccion.docenteId === undefined) continue;
    const { sigla, nombre } = nombreAsignatura(seccion.asignaturaId);
    const docente = nombreDocente(seccion.docenteId);
    const isoBase =
      mockDocentesMaestros.find(d => d.id === seccion.docenteId)?.fechaIngreso ||
      `${new Date().getFullYear()}-01-01`;

    if (seccion.contenidoBlackboard && seccion.contenidoBlackboard !== 'Inexistente') {
      registros.push({
        id: `val-bb-${seccion.id}`,
        fecha: isoBase,
        fechaLabel: fechaLabel(isoBase),
        tipo: 'Validación',
        modulo: 'Académico',
        actor: 'Coordinador Académico',
        docente,
        descripcion: `Contenido Blackboard — ${sigla} ${nombre} (Sec ${seccion.seccion})`,
        estado: seccion.contenidoBlackboard
      });
    }
    if (seccion.guiaAprendizaje && seccion.guiaAprendizaje !== 'Inexistente') {
      registros.push({
        id: `val-guia-${seccion.id}`,
        fecha: isoBase,
        fechaLabel: fechaLabel(isoBase),
        tipo: 'Validación',
        modulo: 'Académico',
        actor: 'Coordinador Académico',
        docente,
        descripcion: `Guía de Aprendizaje — ${sigla} ${nombre} (Sec ${seccion.seccion})`,
        estado: seccion.guiaAprendizaje
      });
    }
  }

  // ── Designaciones PMA (módulo Administración) ─────────────────────────────
  for (const seccion of mockSeccionesAsignaturas) {
    if (seccion.docenteId === undefined) continue;
    const { sigla, nombre, carrera } = nombreAsignatura(seccion.asignaturaId);
    const docente = nombreDocente(seccion.docenteId);
    const horas = seccion.horasP + seccion.horasM + seccion.horasA;
    const grupo = seccion.subGrupo ? `${seccion.seccion}-${seccion.subGrupo}` : `${seccion.seccion}`;
    const isoBase =
      mockDocentesMaestros.find(d => d.id === seccion.docenteId)?.fechaIngreso ||
      `${new Date().getFullYear()}-01-01`;
    registros.push({
      id: `des-${seccion.id}`,
      fecha: isoBase,
      fechaLabel: fechaLabel(isoBase),
      tipo: 'Designación',
      modulo: 'Administración',
      actor: 'Administrador',
      docente,
      descripcion: `Designación en ${sigla} ${nombre} · ${carrera} (Sec ${grupo}) — ${horas} hrs (P${seccion.horasP}/M${seccion.horasM}/A${seccion.horasA})`,
      estado: 'Asignado'
    });
  }

  // ── Pagos y boletas (módulo Administración) ───────────────────────────────
  const propuestaToDocente = new Map<number, number>(
    mockPropuestasSemestrales.map(p => [p.id, p.docenteId])
  );
  for (const cuota of mockCuotasMensuales) {
    const docenteId = propuestaToDocente.get(cuota.propuestaId);
    const docente = nombreDocente(docenteId);

    if (cuota.estadoPago === 'Pagada') {
      const iso = cuota.fechaPago || parseFechaEs(cuota.mes);
      registros.push({
        id: `pago-${cuota.id}`,
        fecha: iso,
        fechaLabel: fechaLabel(iso),
        tipo: 'Pago',
        modulo: 'Administración',
        actor: 'Administrador',
        docente,
        descripcion: `Pago cuota ${cuota.numeroCuota} (${cuota.mes}) — $${cuota.montoBruto.toLocaleString('es-CL')}${
          cuota.referenciaPago ? ` · Ref ${cuota.referenciaPago}` : ''
        }`,
        estado: 'Pagada'
      });
    }

    if (cuota.boletaId) {
      const boleta = getBoletaById(cuota.boletaId)?.boleta;
      if (boleta && boleta.estado) {
        const iso = parseFechaEs(boleta.fecha);
        registros.push({
          id: `bol-${boleta.id}`,
          fecha: iso,
          fechaLabel: fechaLabel(iso),
          tipo: 'Boleta',
          modulo: 'Administración',
          actor: 'Administrador',
          docente,
          descripcion: `${boleta.nombre}${boleta.observaciones ? ` · ${boleta.observaciones}` : ''}`,
          estado: boleta.estado
        });
      }
    }
  }

  return registros.sort((a, b) => (a.fecha < b.fecha ? 1 : a.fecha > b.fecha ? -1 : 0));
}
