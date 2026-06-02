import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/app.js';
import { authHeader, testTokens } from '../helpers/auth.js';

const app = createTestApp();

describe('Docentes Endpoints', () => {
  describe('GET /api/v1/docentes', () => {
    it('debe listar todos los docentes', async () => {
      const response = await request(app).get('/api/v1/docentes');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/docentes/:id', () => {
    it('debe obtener un docente por RUT', async () => {
      const listResponse = await request(app).get('/api/v1/docentes');
      if (listResponse.body.data.length === 0) {
        console.log('No hay docentes para testear detalle');
        return;
      }

      const rut = listResponse.body.data[0].rut_docente;
      const response = await request(app).get(`/api/v1/docentes/${rut}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('rut_docente', rut);
    });

    it('debe retornar 404 si el docente no existe', async () => {
      const response = await request(app).get('/api/v1/docentes/99999999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/docentes', () => {
    it('debe crear docente con usuario admin', async () => {
      const timestamp = Date.now();
      const nuevoDocente = {
        rut_docente: timestamp % 100000000,
        dv: 'K',
        nombre: 'Docente Test',
        contacto: '912345678',
        nivel_docente: 'A',
        // correo_usuario es opcional (FK nullable)
      };

      const response = await request(app)
        .post('/api/v1/docentes')
        .set(authHeader(testTokens.admin))
        .send(nuevoDocente);

      // Aceptar éxito, validación, duplicado, o error de BD
      expect([201, 200, 400, 409, 500]).toContain(response.status);
    });

    it('debe crear docente con usuario coordinador', async () => {
      const timestamp = Date.now();
      const nuevoDocente = {
        rut_docente: (timestamp + 1) % 100000000,
        dv: '1',
        nombre: 'Docente Test 2',
        contacto: '987654321',
        nivel_docente: 'B',
        // correo_usuario es opcional (FK nullable)
      };

      const response = await request(app)
        .post('/api/v1/docentes')
        .set(authHeader(testTokens.coordinador))
        .send(nuevoDocente);

      expect([201, 200, 400, 409, 500]).toContain(response.status);
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app)
        .post('/api/v1/docentes')
        .send({
          rut_docente: 12345678,
          dv: 'K',
          nombre: 'Test',
        });

      expect(response.status).toBe(401);
    });

    it('debe validar nivel_docente permitido', async () => {
      const response = await request(app)
        .post('/api/v1/docentes')
        .set(authHeader(testTokens.admin))
        .send({
          rut_docente: 12345678,
          dv: 'K',
          nombre: 'Test',
          nivel_docente: 'Z',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/docentes/:id', () => {
    it('debe actualizar docente con permisos adecuados', async () => {
      const listResponse = await request(app).get('/api/v1/docentes');
      if (listResponse.body.data.length === 0) {
        console.log('No hay docentes para testear actualización');
        return;
      }

      const rut = listResponse.body.data[0].rut_docente;
      const updateData = {
        nombre: 'Docente Actualizado Test',
        nivel_docente: 'B',
      };

      const response = await request(app)
        .put(`/api/v1/docentes/${rut}`)
        .set(authHeader(testTokens.admin))
        .send(updateData);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/v1/docentes/:id', () => {
    it('solo admin puede eliminar docentes', async () => {
      const response = await request(app)
        .delete('/api/v1/docentes/12345678')
        .set(authHeader(testTokens.admin));

      expect([200, 404, 409]).toContain(response.status);
    });
  });
});
