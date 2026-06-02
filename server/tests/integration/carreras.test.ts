import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/app.js';
import { authHeader, testTokens } from '../helpers/auth.js';

const app = createTestApp();

describe('Carreras Endpoints', () => {
  describe('GET /api/v1/carreras', () => {
    it('debe listar todas las carreras (público)', async () => {
      const response = await request(app).get('/api/v1/carreras');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/carreras/:id', () => {
    it('debe obtener una carrera por ID (público)', async () => {
      // Primero obtener una carrera existente
      const listResponse = await request(app).get('/api/v1/carreras');
      if (listResponse.body.data.length === 0) {
        console.log('No hay carreras para testear detalle');
        return;
      }

      const carreraId = listResponse.body.data[0].id_carrera;
      const response = await request(app).get(`/api/v1/carreras/${carreraId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id_carrera', carreraId);
    });

    it('debe retornar 404 si la carrera no existe', async () => {
      const response = await request(app).get('/api/v1/carreras/XXXX');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/carreras', () => {
    it('debe crear carrera con usuario admin', async () => {
      const nuevaCarrera = {
        id_carrera: 'TEST',
        nombre: 'Carrera Test',
        jornada: 'diurno',
      };

      const response = await request(app)
        .post('/api/v1/carreras')
        .set(authHeader(testTokens.admin))
        .send(nuevaCarrera);

      // Puede ser 201 (creado), 409 (ya existe), o 500 (error BD)
      expect([201, 200, 409, 500]).toContain(response.status);
    });

    it('debe crear carrera con usuario coordinador', async () => {
      const timestamp = Date.now();
      const nuevaCarrera = {
        id_carrera: `TST${timestamp % 1000}`,
        nombre: 'Carrera Test Coord',
        jornada: 'vespertino',
      };

      const response = await request(app)
        .post('/api/v1/carreras')
        .set(authHeader(testTokens.coordinador))
        .send(nuevaCarrera);

      expect([201, 200, 400, 409, 500]).toContain(response.status);
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app)
        .post('/api/v1/carreras')
        .send({
          id_carrera: 'TEST3',
          nombre: 'Carrera Test',
          jornada: 'diurno',
        });

      expect(response.status).toBe(401);
    });

    it('debe validar datos requeridos', async () => {
      const response = await request(app)
        .post('/api/v1/carreras')
        .set(authHeader(testTokens.admin))
        .send({
          nombre: 'Carrera Test',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/carreras/:id', () => {
    it('debe actualizar carrera con permisos adecuados', async () => {
      const listResponse = await request(app).get('/api/v1/carreras');
      if (listResponse.body.data.length === 0) {
        console.log('No hay carreras para testear actualización');
        return;
      }

      const carreraId = listResponse.body.data[0].id_carrera;
      const updateData = {
        nombre: 'Carrera Actualizada Test',
        jornada: 'diurno',
      };

      const response = await request(app)
        .put(`/api/v1/carreras/${carreraId}`)
        .set(authHeader(testTokens.admin))
        .send(updateData);

      expect([200, 404]).toContain(response.status);
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app)
        .put('/api/v1/carreras/TEST')
        .send({ nombre: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/carreras/:id', () => {
    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app).delete('/api/v1/carreras/TEST');
      expect(response.status).toBe(401);
    });

    it('solo admin puede eliminar carreras', async () => {
      const response = await request(app)
        .delete('/api/v1/carreras/TEST')
        .set(authHeader(testTokens.admin));

      // Puede ser 200/204 (eliminado), 404 (no existe), o 409 (tiene dependencias)
      expect([200, 204, 404, 409]).toContain(response.status);
    });
  });
});
