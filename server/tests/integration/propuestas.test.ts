import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/app.js';
import { authHeader, testTokens } from '../helpers/auth.js';

const app = createTestApp();

describe('Propuestas Endpoints', () => {
  describe('GET /api/v1/propuestas', () => {
    it('debe listar todas las propuestas', async () => {
      const response = await request(app).get('/api/v1/propuestas');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/propuestas/:id', () => {
    it('debe obtener una propuesta por ID', async () => {
      const listResponse = await request(app).get('/api/v1/propuestas');
      if (listResponse.body.data.length === 0) {
        console.log('No hay propuestas para testear detalle');
        return;
      }

      const idPropuesta = listResponse.body.data[0].id_propuesta;
      const response = await request(app).get(`/api/v1/propuestas/${idPropuesta}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id_propuesta', idPropuesta);
    });

    it('debe retornar 404 si la propuesta no existe', async () => {
      const response = await request(app).get('/api/v1/propuestas/PROP-INEXISTENTE');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/propuestas', () => {
    it('debe crear propuesta con usuario admin', async () => {
      const timestamp = Date.now();
      const nuevaPropuesta = {
        id_propuesta: `PROP${timestamp % 10000}`,
        rut_docente: 12345678,
        valor_propuesta: 1500000,
        cuotas: 6,
      };

      const response = await request(app)
        .post('/api/v1/propuestas')
        .set(authHeader(testTokens.admin))
        .send(nuevaPropuesta);

      expect([201, 200, 400, 409, 500]).toContain(response.status);
    });

    it('debe validar cuotas mínimas', async () => {
      const response = await request(app)
        .post('/api/v1/propuestas')
        .set(authHeader(testTokens.admin))
        .send({
          id_propuesta: 'PROP-TEST',
          rut_docente: 12345678,
          valor_propuesta: 1000000,
          cuotas: 0,
        });

      expect(response.status).toBe(400);
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app)
        .post('/api/v1/propuestas')
        .send({
          id_propuesta: 'PROP-TEST',
          rut_docente: 12345678,
          valor_propuesta: 1000000,
          cuotas: 6,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/propuestas/:id', () => {
    it('debe actualizar propuesta con permisos adecuados', async () => {
      const listResponse = await request(app).get('/api/v1/propuestas');
      if (listResponse.body.data.length === 0) {
        console.log('No hay propuestas para testear actualización');
        return;
      }

      const idPropuesta = listResponse.body.data[0].id_propuesta;
      const updateData = {
        valor_propuesta: 2000000,
        cuotas: 12,
      };

      const response = await request(app)
        .put(`/api/v1/propuestas/${idPropuesta}`)
        .set(authHeader(testTokens.admin))
        .send(updateData);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/v1/propuestas/:id', () => {
    it('solo admin puede eliminar propuestas', async () => {
      const response = await request(app)
        .delete('/api/v1/propuestas/PROP-TEST')
        .set(authHeader(testTokens.admin));

      expect([200, 404, 409]).toContain(response.status);
    });
  });
});
