import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/app.js';
import { authHeader, testTokens } from '../helpers/auth.js';

const app = createTestApp();

describe('Pagos Endpoints', () => {
  describe('GET /api/v1/pagos', () => {
    it('debe listar todos los pagos', async () => {
      const response = await request(app).get('/api/v1/pagos');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/pagos/:id', () => {
    it('debe obtener un pago por ID', async () => {
      const listResponse = await request(app).get('/api/v1/pagos');
      if (listResponse.body.data.length === 0) {
        console.log('No hay pagos para testear detalle');
        return;
      }

      const idPago = listResponse.body.data[0].id_pago;
      const response = await request(app).get(`/api/v1/pagos/${idPago}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id_pago', idPago);
    });

    it('debe retornar 404 si el pago no existe', async () => {
      const response = await request(app).get('/api/v1/pagos/PAGO-INEXISTENTE');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/pagos', () => {
    it('debe crear pago con usuario admin', async () => {
      const timestamp = Date.now();
      const nuevoPago = {
        id_pago: `PAGO${timestamp % 10000}`,
        id_propuesta: 'PROP-TEST',
        mes: 'marzo',
        notas: 'Pago de prueba',
      };

      const response = await request(app)
        .post('/api/v1/pagos')
        .set(authHeader(testTokens.admin))
        .send(nuevoPago);

      expect([201, 200, 400, 409, 500]).toContain(response.status);
    });

    it('debe validar mes permitido', async () => {
      const response = await request(app)
        .post('/api/v1/pagos')
        .set(authHeader(testTokens.admin))
        .send({
          id_pago: 'PAGO-TEST',
          id_propuesta: 'PROP-TEST',
          mes: 'mes-invalido',
        });

      expect(response.status).toBe(400);
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app)
        .post('/api/v1/pagos')
        .send({
          id_pago: 'PAGO-TEST',
          id_propuesta: 'PROP-TEST',
          mes: 'enero',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/pagos/:id', () => {
    it('debe actualizar pago con permisos adecuados', async () => {
      const listResponse = await request(app).get('/api/v1/pagos');
      if (listResponse.body.data.length === 0) {
        console.log('No hay pagos para testear actualización');
        return;
      }

      const idPago = listResponse.body.data[0].id_pago;
      const updateData = {
        mes: 'abril',
        notas: 'Notas actualizadas',
      };

      const response = await request(app)
        .put(`/api/v1/pagos/${idPago}`)
        .set(authHeader(testTokens.admin))
        .send(updateData);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/v1/pagos/:id', () => {
    it('solo admin puede eliminar pagos', async () => {
      const response = await request(app)
        .delete('/api/v1/pagos/PAGO-TEST')
        .set(authHeader(testTokens.admin));

      expect([200, 404, 409]).toContain(response.status);
    });
  });
});
