/**
 * Estado del workflow de PAGOS del administrador.
 *
 * - Pago de cuotas (estadoPago, fechaPago, referenciaPago).
 * - Estado de revisión de boletas (Subida / Procesada / Con Observación) +
 *   observación textual.
 *
 * Persistencia: dos claves en `localStorage`:
 *   - `pagos_admin_v1`     → `Record<cuotaId, OverrideCuota>`
 *   - `boletas_admin_v1`   → `Record<boletaId, OverrideBoleta>`
 *
 * Al importar este módulo, automáticamente se hidratan los arrays mock
 * (`mockCuotasMensuales`, `mockDocentesAcademicos[i].boletas[]`) con los
 * overrides guardados, de modo que cualquier consumidor (admin o docente)
 * que itere esos arrays vea el estado actualizado sin lógica extra.
 *
 * Cuando exista NestJS, este archivo se reemplaza por llamadas REST con
 * la misma firma; los componentes no cambian.
 */

import {
  mockCuotasMensuales,
  mockDocentesAcademicos,
  type Boleta,
  type CuotaMensual
} from './mockData';

const KEY_PAGOS = 'pagos_admin_v1';
const KEY_BOLETAS = 'boletas_admin_v1';
const EVENT_NAME = 'pagos-admin:update';

export interface OverrideCuota {
  estadoPago?: CuotaMensual['estadoPago'];
  fechaPago?: string;
  referenciaPago?: string;
}

export interface OverrideBoleta {
  estado?: NonNullable<Boleta['estado']>;
  observaciones?: string;
  /** Si el admin promueve la cuota a "Procesada", también queda reflejado acá para la UI del docente. */
  cuotaBoletaEstado?: NonNullable<CuotaMensual['boletaEstado']>;
}

type MapaCuotas = Record<number, OverrideCuota>;
type MapaBoletas = Record<number, OverrideBoleta>;

// ---------- read / write ----------

function read<T>(key: string): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : ({} as T);
  } catch {
    return {} as T;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function loadOverridesCuotas(): MapaCuotas {
  return read<MapaCuotas>(KEY_PAGOS);
}

export function loadOverridesBoletas(): MapaBoletas {
  return read<MapaBoletas>(KEY_BOLETAS);
}

// ---------- hidratación inicial ----------

/**
 * Aplica los overrides guardados sobre los arrays mock en memoria. Se invoca
 * una sola vez al importar este módulo (módulo singleton) y manualmente
 * después de cada mutación para que toda la app vea los cambios sin recargar.
 */
function hidratar(): void {
  const cuotas = loadOverridesCuotas();
  for (const cuota of mockCuotasMensuales) {
    const ov = cuotas[cuota.id];
    if (!ov) continue;
    if (ov.estadoPago !== undefined) cuota.estadoPago = ov.estadoPago;
    if (ov.fechaPago !== undefined) cuota.fechaPago = ov.fechaPago;
    if (ov.referenciaPago !== undefined) cuota.referenciaPago = ov.referenciaPago;
  }
  const boletas = loadOverridesBoletas();
  for (const docente of mockDocentesAcademicos) {
    for (const boleta of docente.boletas) {
      const ov = boletas[boleta.id];
      if (!ov) continue;
      if (ov.estado !== undefined) boleta.estado = ov.estado;
      if (ov.observaciones !== undefined) boleta.observaciones = ov.observaciones;
      // Sincronizar boletaEstado en la cuota vinculada
      if (ov.cuotaBoletaEstado !== undefined) {
        const cuota = mockCuotasMensuales.find(c => c.boletaId === boleta.id);
        if (cuota) cuota.boletaEstado = ov.cuotaBoletaEstado;
      }
    }
  }
}

hidratar();

// ---------- mutaciones ----------

function notify(): void {
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

/** Marca una cuota como pagada (o revierte a Pendiente si `pagada=false`). */
export function setEstadoCuota(
  cuotaId: number,
  data: { pagada: boolean; fechaPago?: string; referenciaPago?: string }
): void {
  const map = loadOverridesCuotas();
  if (data.pagada) {
    map[cuotaId] = {
      estadoPago: 'Pagada',
      fechaPago: data.fechaPago,
      referenciaPago: data.referenciaPago
    };
  } else {
    // Revertir: sobreescribir explícitamente a Pendiente y limpiar campos
    map[cuotaId] = {
      estadoPago: 'Pendiente',
      fechaPago: undefined,
      referenciaPago: undefined
    };
  }
  write(KEY_PAGOS, map);
  hidratar();
  notify();
}

/** Cambia el estado de revisión de una boleta y opcionalmente su observación. */
export function setEstadoBoleta(
  boletaId: number,
  data: { estado: NonNullable<Boleta['estado']>; observaciones?: string }
): void {
  const map = loadOverridesBoletas();
  const cuotaBoletaEstado: NonNullable<CuotaMensual['boletaEstado']> =
    data.estado === 'Procesada'
      ? 'Procesada'
      : data.estado === 'Con Observación'
        ? 'Con Observación'
        : 'Subida';
  map[boletaId] = {
    estado: data.estado,
    observaciones: data.observaciones,
    cuotaBoletaEstado
  };
  write(KEY_BOLETAS, map);
  hidratar();
  notify();
}

// ---------- suscripción ----------

/** Avisa a los componentes que algún estado de pago/boleta cambió. */
export function subscribePagosAdmin(onChange: () => void): () => void {
  const handleStorage = (e: StorageEvent) => {
    if (e.key === KEY_PAGOS || e.key === KEY_BOLETAS) {
      hidratar();
      onChange();
    }
  };
  const handleCustom = () => onChange();
  window.addEventListener('storage', handleStorage);
  window.addEventListener(EVENT_NAME, handleCustom);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(EVENT_NAME, handleCustom);
  };
}
