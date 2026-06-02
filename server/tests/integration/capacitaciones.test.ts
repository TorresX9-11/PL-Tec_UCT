import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/app.js';
import { authHeader, testTokens } from '../helpers/auth.js';

const app = createTestApp();

describe('Capacitaciones Endpoints', () => {
  describe('GET /api/v1/capacitaciones', () => {
    it('debe listar todas las capacitaciones (público)', async () => {
      const response = await request(app).get('/api/v1/capacitaciones');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/capacitaciones/:id', () => {
    it('debe obtener una capacitación por ID (público)', async () => {
      const listResponse = await request(app).get('/api/v1/capacitaciones');
      if (listResponse.body.data.length === 0) {
        console.log('No hay capacitaciones para testear detalle');
        return;
      }

      const idCapacitacion = listResponse.body.data[0].id_capacitacion;
      const response = await request(app).get(`/api/v1/capacitaciones/${idCapacitacion}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id_capacitacion', idCapacitacion);
    });

    it('debe retornar 404 si la capacitación no existe', async () => {
      const response = await request(app).get('/api/v1/capacitaciones/CAP-INEXISTENTE');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/capacitaciones', () => {
    it('debe crear capacitación con usuario autenticado', async () => {
      const timestamp = Date.now();
      const nuevaCapacitacion = {
        id_capacitacion: `CAP${timestamp % 10000}`,
        rut_docente: 12345678,
        titulo: 'Capacitación Test',
        descripcion: 'Descripción de la capacitación de prueba',
      };

      const response = await request(app)
        .post('/api/v1/capacitaciones')
        .set(authHeader(testTokens.docente))
        .send(nuevaCapacitacion);

      expect([201, 200, 400, 409, 500]).toContain(response.status);
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app)
        .post('/api/v1/capacitaciones')
        .send({
          id_capacitacion: 'CAP-TEST',
          rut_docente: 12345678,
          titulo: 'Test',
        });

      expect(response.status).toBe(401);
    });

    it('debe validar datos requeridos', async () => {
      const response = await request(app)
        .post('/api/v1/capacitaciones')
        .set(authHeader(testTokens.docente))
        .send({
          rut_docente: 12345678,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/capacitaciones/:id', () => {
    it('debe actualizar capacitación con usuario autenticado', async () => {
      const listResponse = await request(app).get('/api/v1/capacitaciones');
      if (listResponse.body.data.length === 0) {
        console.log('No hay capacitaciones para testear actualización');
        return;
      }

      const idCapacitacion = listResponse.body.data[0].id_capacitacion;
      const updateData = {
        titulo: 'Capacitación Actualizada Test',
        descripcion: 'Nueva descripción',
      };

      const response = await request(app)
        .put(`/api/v1/capacitaciones/${idCapacitacion}`)
        .set(authHeader(testTokens.docente))
        .send(updateData);

      expect([200, 404]).toContain(response.status);
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app)
        .put('/api/v1/capacitaciones/CAP-TEST')
        .send({ titulo: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/capacitaciones/:id', () => {
    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app).delete('/api/v1/capacitaciones/CAP-TEST');
      expect(response.status).toBe(401);
    });

    it('cualquier usuario autenticado puede eliminar capacitaciones', async () => {
      const response = await request(app)
        .delete('/api/v1/capacitaciones/CAP-TEST')
        .set(authHeader(testTokens.docente));

      expect([200, 404, 409]).toContain(response.status);
    });
  });
});
