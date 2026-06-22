/**
 * Autenticación del frontend — Plataforma TEC UCT
 *
 * Envuelve el endpoint real `POST /auth/login` del backend (JWT). Persiste el
 * token (vía apiClient) y el usuario autenticado en sessionStorage.
 *
 * NOTA (Fase 1): el resto de la app aún resuelve IDs (docenteId, carrera, etc.)
 * desde los datos mock. Este módulo provee el token real para que las próximas
 * fases puedan consumir endpoints protegidos sin re-cablear el login.
 */

import { apiRequest, setToken, clearToken, getToken } from './apiClient';

export type Nivel = 'docente' | 'coordinador' | 'academico' | 'supervisor' | 'admin';

export interface AuthUser {
  correo: string;
  nivel: Nivel;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

const USER_KEY = 'tec_auth_user';

/**
 * Inicia sesión contra el backend. Devuelve el usuario autenticado y persiste
 * token + usuario. Lanza `ApiError` si las credenciales son inválidas o si el
 * servidor no está disponible (ver `ApiError.isNetwork`).
 */
export async function login(correo: string, contrasena: string): Promise<AuthUser> {
  const res = await apiRequest<LoginResponse>('POST', '/auth/login', {
    correo_usuario: correo.trim(),
    contrasena,
  });
  setToken(res.token);
  try {
    sessionStorage.setItem(USER_KEY, JSON.stringify(res.user));
  } catch {
    /* ignore */
  }
  return res.user;
}

/** Usuario autenticado actual (o null si no hay sesión). */
export function getCurrentUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

/** Cierra la sesión: limpia token y usuario. */
export function logout(): void {
  clearToken();
  try {
    sessionStorage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
}

/** true si hay un token JWT activo. */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}
