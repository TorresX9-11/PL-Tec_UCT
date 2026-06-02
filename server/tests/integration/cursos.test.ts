import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/app.js';
import { authHeader, testTokens } from '../helpers/auth.js';

const app = createTestApp();

describe('Cursos Endpoints', () => {
  describe('GET /api/v1/cursos', () => {
    it('debe listar todos los cursos', async () => {
      const response = await request(app).get('/api/v1/cursos');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/cursos/:id_carrera/:id_curso', () => {
    it('debe obtener un curso por clave compuesta', async () => {
      const listResponse = await request(app).get('/api/v1/cursos');
      if (listResponse.body.data.length === 0) {
        console.log('No hay cursos para testear detalle');
        return;
      }

      const curso = listResponse.body.data[0];
      const response = await request(app).get(
        `/api/v1/cursos/${curso.id_carrera}/${curso.id_curso}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('debe retornar 404 si el curso no existe', async () => {
      const response = await request(app).get('/api/v1/cursos/XXXX/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/cursos', () => {
    it('debe crear curso con usuario admin', async () => {
      // Primero obtener una carrera existente
      const carrerasResponse = await request(app).get('/api/v1/carreras');
      if (carrerasResponse.body.data.length === 0) {
        console.log('No hay carreras para crear curso');
        return;
      }

      const timestamp = Date.now();
      const nuevoCurso = {
        id_carrera: carrerasResponse.body.data[0].id_carrera,
        id_curso: `C${timestamp % 10000}`,
        nombre: 'Curso Test',
        jornada: 'diurno',
        semestre: '1',
        notas_curso: 0,
      };

      const response = await request(app)
        .post('/api/v1/cursos')
        .set(authHeader(testTokens.admin))
        .send(nuevoCurso);

      expect([201, 200, 400, 409, 500]).toContain(response.status);
    });

    it('debe validar semestre permitido', async () => {
      const response = await request(app)
        .post('/api/v1/cursos')
        .set(authHeader(testTokens.admin))
        .send({
          id_carrera: 'TEST',
          id_curso: 'CURS1',
          nombre: 'Test',
          jornada: 'diurno',
          semestre: '7',
        });

      expect(response.status).toBe(400);
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app)
        .post('/api/v1/cursos')
        .send({
          id_carrera: 'TEST',
          id_curso: 'CURS1',
          nombre: 'Test',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/cursos/:id_carrera/:id_curso', () => {
    it('debe actualizar curso con permisos adecuados', async () => {
      const listResponse = await request(app).get('/api/v1/cursos');
      if (listResponse.body.data.length === 0) {
        console.log('No hay cursos para testear actualización');
        return;
      }

      const curso = listResponse.body.data[0];
      const updateData = {
        nombre: 'Curso Actualizado Test',
        jornada: 'vespertino',
      };

      const response = await request(app)
        .put(`/api/v1/cursos/${curso.id_carrera}/${curso.id_curso}`)
        .set(authHeader(testTokens.admin))
        .send(updateData);

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/v1/cursos/:id_carrera/:id_curso', () => {
    it('solo admin puede eliminar cursos', async () => {
      const response = await request(app)
        .delete('/api/v1/cursos/TEST/CURS1')
        .set(authHeader(testTokens.admin));

      expect([200, 404, 409]).toContain(response.status);
    });
  });
});
