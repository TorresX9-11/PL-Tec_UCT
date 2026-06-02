import jwt from 'jsonwebtoken';
import type { UserLevel } from '../../src/middleware/auth.js';

// JWT_SECRET debe coincidir con el definido en .env.test
const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-32-chars-long!1234567890';

/**
 * Genera un token JWT válido para testing.
 * Usa el mismo JWT_SECRET que la aplicación para que el middleware lo valide.
 */
export function generateTestToken(correo: string, nivel: UserLevel): string {
  return jwt.sign(
    { correo, nivel },
    TEST_JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Headers de autorización para tests.
 */
export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Tokens predefinidos para diferentes niveles de usuario.
 */
export const testTokens = {
  admin: generateTestToken('admin@test.com', 'admin'),
  coordinador: generateTestToken('coordinador@test.com', 'coordinador'),
  docente: generateTestToken('docente@test.com', 'docente'),
  academico: generateTestToken('academico@test.com', 'academico'),
};
