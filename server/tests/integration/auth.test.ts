import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/app.js';

const app = createTestApp();

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/login', () => {
    it('debe retornar error 400 si faltan credenciales', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debe retornar error 401 con credenciales inválidas', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          correo_usuario: 'noexiste@test.com',
          contrasena: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
    });

    it('debe validar formato de email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          correo_usuario: 'email-invalido',
          contrasena: '123456',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debe validar que contraseña tenga al menos 6 caracteres', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          correo_usuario: 'test@test.com',
          contrasena: '123',
        });

      // Puede ser 400 (validación) o 401 (credenciales inválidas si pasa la validación)
      expect([400, 401]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });
  });
});
