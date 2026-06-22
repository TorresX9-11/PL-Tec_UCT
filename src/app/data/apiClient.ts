/**
 * Cliente HTTP del frontend — Plataforma TEC UCT
 *
 * Capa única que habla con el backend REST (`/server`). Encapsula:
 *  - Base URL (configurable vía VITE_API_URL).
 *  - Inyección del token JWT (Authorization: Bearer ...).
 *  - Parseo de la envoltura uniforme del backend (`{ data }` / `{ error }`).
 *  - Errores tipados (`ApiError`) que distinguen fallos de red de errores HTTP.
 *
 * Los módulos de dominio (auth.ts, y futuros recursos) usan estos helpers;
 * los componentes nunca llaman a `fetch` directamente.
 */

/** Base URL del backend. Cae a localhost:3001 si no hay variable de entorno. */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

const TOKEN_KEY = 'tec_auth_token';

// ─── Token (sessionStorage: se limpia al cerrar el navegador) ────────────────

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

// ─── Error tipado ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;
  /** true cuando el servidor no respondió (sin conexión, CORS, etc.). */
  readonly isNetwork: boolean;

  constructor(
    code: string,
    message: string,
    status: number,
    details?: unknown,
    isNetwork = false,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.isNetwork = isNetwork;
  }
}

// ─── Request base ────────────────────────────────────────────────────────────

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Ejecuta una request y devuelve el JSON crudo del backend (sin desenvolver).
 * Lanza `ApiError` ante fallo de red o respuesta no-2xx.
 */
export async function apiRequest<T = unknown>(
  method: Method,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'NETWORK_ERROR',
      'No se pudo conectar con el servidor. ¿Está el backend en ejecución?',
      0,
      undefined,
      true,
    );
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const err = (json as { error?: { code?: string; message?: string; details?: unknown } } | null)
      ?.error;
    throw new ApiError(
      err?.code ?? 'HTTP_ERROR',
      err?.message ?? `Error ${res.status}`,
      res.status,
      err?.details,
    );
  }

  return json as T;
}

// ─── Helpers REST (desenvuelven la envoltura `{ data }`) ─────────────────────

interface DataEnvelope<T> {
  data: T;
}

export const api = {
  get: <T>(path: string): Promise<T> =>
    apiRequest<DataEnvelope<T>>('GET', path).then((r) => r.data),
  post: <T>(path: string, body?: unknown): Promise<T> =>
    apiRequest<DataEnvelope<T>>('POST', path, body).then((r) => r.data),
  put: <T>(path: string, body?: unknown): Promise<T> =>
    apiRequest<DataEnvelope<T>>('PUT', path, body).then((r) => r.data),
  del: (path: string): Promise<void> => apiRequest<void>('DELETE', path).then(() => undefined),
};

/** Comprueba la salud del backend (`GET /health`). */
export async function checkHealth(): Promise<boolean> {
  try {
    await apiRequest('GET', '/health');
    return true;
  } catch {
    return false;
  }
}
