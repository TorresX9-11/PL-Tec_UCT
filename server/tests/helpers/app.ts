import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRouter from '../../src/routes/index.js';
import { errorHandler, notFoundHandler } from '../../src/middleware/error.js';

/**
 * Crea una instancia de Express configurada para testing.
 * No inicia el servidor, solo retorna la app para usar con supertest.
 */
export function createTestApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
