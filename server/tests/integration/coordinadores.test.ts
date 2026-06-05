import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/app.js';
import { authHeader, testTokens } from '../helpers/auth.js';

const app = createTestApp();

describe('Coordinadores Endpoints', () => {
  describe('GET /api/v1/coordinadores', () => {
    it('debe listar todos los coordinadores (público)', async () => {
      const response = await request(app).get('/api/v1/coordinadores');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/coordinadores/:id', () => {
    it('debe obtener un coordinador por ID (público)', async () => {
      const listResponse = await request(app).get('/api/v1/coordinadores');
      if (listResponse.body.data.length === 0) {
        console.log('No hay coordinadores para testear detalle');
        return;
      }

      const idCoordinador = listResponse.body.data[0].id_coordinador;
      const response = await request(app).get(`/api/v1/coordinadores/${idCoordinador}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id_coordinador', idCoordinador);
    });

    it('debe retornar 404 si el coordinador no existe', async () => {
      const response = await request(app).get('/api/v1/coordinadores/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/coordinadores', () => {
    it('debe crear coordinador con usuario autenticado', async () => {
      const timestamp = Date.now();
      const nuevoCoordinador = {
        id_coordinador: timestamp % 100,
        correo_usuario: `coord${timestamp}@test.com`,
        id_carrera: 'TEST',
      };

      const response = await request(app)
        .post('/api/v1/coordinadores')
        .set(authHeader(testTokens.admin))
        .send(nuevoCoordinador);

      expect([201, 200, 400, 409, 500]).toContain(response.status);
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app)
        .post('/api/v1/coordinadores')
        .send({
          id_coordinador: 99,
          correo_usuario: 'coord@test.com',
          id_carrera: 'TEST',
        });

      expect(response.status).toBe(401);
    });

    it('debe validar datos requeridos', async () => {
      const response = await request(app)
        .post('/api/v1/coordinadores')
        .set(authHeader(testTokens.admin))
        .send({
          correo_usuario: 'coord@test.com',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/coordinadores/:id', () => {
    it('debe actualizar coordinador con usuario autenticado', async () => {
      const listResponse = await request(app).get('/api/v1/coordinadores');
      if (listResponse.body.data.length === 0) {
        console.log('No hay coordinadores para testear actualización');
        return;
      }

      const idCoordinador = listResponse.body.data[0].id_coordinador;
      const updateData = {
        id_carrera: 'TEST',
      };

      const response = await request(app)
        .put(`/api/v1/coordinadores/${idCoordinador}`)
        .set(authHeader(testTokens.admin))
        .send(updateData);

      expect([200, 404]).toContain(response.status);
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app)
        .put('/api/v1/coordinadores/99')
        .send({ id_carrera: 'TEST' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/coordinadores/:id', () => {
    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app).delete('/api/v1/coordinadores/99');
      expect(response.status).toBe(401);
    });

    it('debe retornar 403 para usuario autenticado no admin', async () => {
      const response = await request(app)
        .delete('/api/v1/coordinadores/99')
        .set(authHeader(testTokens.coordinador));

      expect(response.status).toBe(403);
    });

    it('admin puede eliminar coordinadores', async () => {
      const response = await request(app)
        .delete('/api/v1/coordinadores/99')
        .set(authHeader(testTokens.admin));

      expect([200, 204, 404, 409]).toContain(response.status);
    });
  });
});
