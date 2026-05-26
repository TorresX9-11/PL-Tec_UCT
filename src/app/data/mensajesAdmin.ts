/**
 * Mensajes/notas que el administrador escribe en una cuota mensual de la
 * propuesta del docente (ver `TablaPropuestasSemestrales` → Detalle de Propuesta).
 *
 * - Clave de almacenamiento: `mensajes_propuesta_${docenteId}` en `localStorage`.
 * - Estructura: `Record<cuotaId, mensaje>` donde `cuotaId` es el `id` real de
 *   `mockCuotasMensuales` (no un índice). Esto permite mapear 1:1 con la
 *   futura tabla `pagos` / `cuotas` del backend NestJS.
 * - Una cuota puede o no tener una boleta subida (`cuota.boletaId`). El mensaje
 *   queda atado a la cuota, no a la boleta, así no se pierde si la boleta aún
 *   no se carga.
 *
 * Cuando se conecte el backend, basta con reemplazar las funciones
 * `loadMensajes` / `saveMensajes` por llamadas a la API REST manteniendo la
 * misma firma.
 */

export type MensajesPorCuota = Record<number, string>;

const storageKey = (docenteId: number) => `mensajes_propuesta_${docenteId}`;

/** Lee todos los mensajes de un docente desde el storage. */
export function loadMensajes(docenteId: number): MensajesPorCuota {
  try {
    const raw = localStorage.getItem(storageKey(docenteId));
    return raw ? (JSON.parse(raw) as MensajesPorCuota) : {};
  } catch {
    return {};
  }
}

/** Guarda el mapa completo de mensajes de un docente. */
export function saveMensajes(docenteId: number, mensajes: MensajesPorCuota): void {
  try {
    localStorage.setItem(storageKey(docenteId), JSON.stringify(mensajes));
  } catch {
    /* ignore quota errors en mock */
  }
}

/** Actualiza/elimina el mensaje de una cuota puntual. Devuelve el nuevo mapa. */
export function setMensajeCuota(
  docenteId: number,
  cuotaId: number,
  mensaje: string
): MensajesPorCuota {
  const actual = loadMensajes(docenteId);
  const next = { ...actual };
  const valor = mensaje.trim();
  if (valor) {
    next[cuotaId] = valor;
  } else {
    delete next[cuotaId];
  }
  saveMensajes(docenteId, next);
  // Notificar a la misma pestaña (StorageEvent solo dispara entre pestañas)
  window.dispatchEvent(
    new CustomEvent('mensajes-admin:update', { detail: { docenteId } })
  );
  return next;
}

/**
 * Suscribirse a cambios en los mensajes de un docente.
 * Llama al callback con el nuevo mapa cuando alguien:
 *  - escribe en otra pestaña (storage event nativo)
 *  - llama a `setMensajeCuota` en la misma pestaña (custom event)
 */
export function subscribeMensajes(
  docenteId: number,
  onChange: (mensajes: MensajesPorCuota) => void
): () => void {
  const key = storageKey(docenteId);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === key) onChange(loadMensajes(docenteId));
  };
  const handleCustom = (e: Event) => {
    const detail = (e as CustomEvent<{ docenteId: number }>).detail;
    if (detail?.docenteId === docenteId) onChange(loadMensajes(docenteId));
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener('mensajes-admin:update', handleCustom);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('mensajes-admin:update', handleCustom);
  };
}
