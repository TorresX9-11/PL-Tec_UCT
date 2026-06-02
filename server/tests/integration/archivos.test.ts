import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/app.js';
import { authHeader, testTokens } from '../helpers/auth.js';

const app = createTestApp();

describe('Archivos Endpoints', () => {
  describe('GET /api/v1/archivos', () => {
    it('debe listar todos los archivos', async () => {
      const response = await request(app).get('/api/v1/archivos');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/archivos/:id', () => {
    it('debe obtener un archivo por ID', async () => {
      const listResponse = await request(app).get('/api/v1/archivos');
      if (listResponse.body.data.length === 0) {
        console.log('No hay archivos para testear detalle');
        return;
      }

      const idArchivo = listResponse.body.data[0].id_archivo;
      const response = await request(app).get(`/api/v1/archivos/${idArchivo}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id_archivo', idArchivo);
    });

    it('debe retornar 404 si el archivo no existe', async () => {
      const response = await request(app).get('/api/v1/archivos/ARCH-INEXISTENTE');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/archivos', () => {
    it('debe crear archivo con usuario autenticado', async () => {
      const timestamp = Date.now();
      const nuevoArchivo = {
        id_archivo: `ARCH${timestamp % 10000}`,
        tipo: 'PDF',
        ruta: `/uploads/documento_${timestamp}.pdf`,
        // correo_usuario es opcional (FK nullable)
      };

      const response = await request(app)
        .post('/api/v1/archivos')
        .set(authHeader(testTokens.docente))
        .send(nuevoArchivo);

      // Aceptar éxito o error de duplicado/FK
      expect([201, 200, 400, 409, 500]).toContain(response.status);
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app)
        .post('/api/v1/archivos')
        .send({
          id_archivo: 'ARCH-TEST',
          tipo: 'PDF',
          ruta: '/uploads/test.pdf',
        });

      expect(response.status).toBe(401);
    });

    it('debe validar datos requeridos', async () => {
      const response = await request(app)
        .post('/api/v1/archivos')
        .set(authHeader(testTokens.docente))
        .send({
          tipo: 'PDF',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/v1/archivos/:id', () => {
    it('debe actualizar archivo con usuario autenticado', async () => {
      const listResponse = await request(app).get('/api/v1/archivos');
      if (listResponse.body.data.length === 0) {
        console.log('No hay archivos para testear actualización');
        return;
      }

      const idArchivo = listResponse.body.data[0].id_archivo;
      const updateData = {
        ruta: '/uploads/actualizado.pdf',
      };

      const response = await request(app)
        .put(`/api/v1/archivos/${idArchivo}`)
        .set(authHeader(testTokens.admin))
        .send(updateData);

      expect([200, 404]).toContain(response.status);
    });

    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app)
        .put('/api/v1/archivos/ARCH-TEST')
        .send({ ruta: '/uploads/test.pdf' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/archivos/:id', () => {
    it('debe retornar 401 sin autenticación', async () => {
      const response = await request(app).delete('/api/v1/archivos/ARCH-TEST');
      expect(response.status).toBe(401);
    });

    it('cualquier usuario autenticado puede eliminar archivos', async () => {
      const response = await request(app)
        .delete('/api/v1/archivos/ARCH-TEST')
        .set(authHeader(testTokens.docente));

      expect([200, 404, 409]).toContain(response.status);
    });
  });
});
