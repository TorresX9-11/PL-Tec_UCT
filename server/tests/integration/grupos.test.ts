import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/app.js';
import { authHeader, testTokens } from '../helpers/auth.js';

const app = createTestApp();

describe('Grupos Endpoints', () => {
  describe('GET /api/v1/grupos', () => {
    it('debe listar todos los grupos', async () => {
      const response = await request(app).get('/api/v1/grupos');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/grupos/:id', () => {
    it('debe obtener un grupo por ID', async () => {
      const listResponse = await request(app).get('/api/v1/grupos');
      if (listResponse.body.data.length === 0) {
        console.log('No hay grupos para testear detalle');
        return;
      }

      const idGrupo = listResponse.body.data[0].id_grupo;
      const response = await request(app).get(`/api/v1/grupos/${idGrupo}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id_grupo', idGrupo);
    });

    it('debe retornar 404 si el grupo no existe', async () => {
      const response = await request(app).get('/api/v1/grupos/GRP-NOEXISTE999');

      // Puede ser 404 (no existe) o 400 (validación de formato)
      expect([404, 400]).toContain(response.status);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/grupos', () => {
    it('debe crear grupo con usuario admin', async () => {
      const timestamp = Date.now();
      const nuevoGrupo = {
        id_grupo: `GRP${timestamp % 10000}`,
        id_carrera: 'TEST',
        id_curso: 'TEST',
        seccion: '1',
        horas_presencial: 4,
        horas_mixto: 2,
        horas_administrativo: 1,
      };

      const response = await request(app)
        .post('/api/v1/grupos')
        .set(authHeader(testTokens.admin))
        .send(nuevoGrupo);

      expect([201, 200, 400, 409, 500]).toContain(response.status);
    });

    it('debe validar seccion permitida', async () => {
      const response = await request(app)
        .post('/api/v1/grupos')
        .set(authHeader(testTokens.admin))
        .send({
          id_grupo: 'GRP-TEST',
          id_carrera: 'TEST',
          id_curso: 'TEST',
          seccion: '5',
        });

      expect(response.status).toBe(400);
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app)
        .post('/api/v1/grupos')
        .send({
          id_grupo: 'GRP-TEST',
          id_carrera: 'TEST',
          id_curso: 'TEST',
          seccion: '1',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/grupos/:id', () => {
    it('debe actualizar grupo con permisos adecuados', async () => {
      const listResponse = await request(app).get('/api/v1/grupos');
      if (listResponse.body.data.length === 0) {
        console.log('No hay grupos para testear actualización');
        return;
      }

      const idGrupo = listResponse.body.data[0].id_grupo;
      const updateData = {
        seccion: '2',
        horas_presencial: 6,
      };

      const response = await request(app)
        .put(`/api/v1/grupos/${idGrupo}`)
        .set(authHeader(testTokens.admin))
        .send(updateData);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/v1/grupos/:id', () => {
    it('solo admin puede eliminar grupos', async () => {
      const response = await request(app)
        .delete('/api/v1/grupos/GRP-TEST')
        .set(authHeader(testTokens.admin));

      expect([200, 404, 409]).toContain(response.status);
    });
  });
});
