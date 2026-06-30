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

export type Nivel = 'docente' | 'coordinador' | 'supervisor' | 'admin';

export interface AuthUser {
  correo: string;
  nivel: Nivel;
  nombre?: string;
  id_carrera?: string;
  rut_docente?: number;
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
  
  const user: AuthUser = res.user;

  // Guardar en sessionStorage para que la app sepa quién está conectado.
  setToken(res.token);
  sessionStorage.setItem('tec_auth_token', res.token);
  sessionStorage.setItem('tec_auth_user', JSON.stringify(user));
  sessionStorage.setItem('tec_auth_timestamp', Date.now().toString());
  
  // Si la API no retorna el nombre (por si acaso), rellenamos con correo
  sessionStorage.setItem('userName', user.nombre || user.correo);
  sessionStorage.setItem('userRole', user.nivel);
  
  if (user.id_carrera) {
    sessionStorage.setItem('coordinadorCarreraId', user.id_carrera);
  }
  if (user.rut_docente) {
    sessionStorage.setItem('docenteId', user.rut_docente.toString());
  }

  return user;
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
    sessionStorage.removeItem('tec_auth_timestamp');
  } catch {
    /* ignore */
  }
}

/** true si hay un token JWT activo. */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}
