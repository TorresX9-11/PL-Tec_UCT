import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { pingDatabase } from './config/db.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

/**
 * Bootstrap del servidor Express.
 *
 * Orden de middleware (importante):
 *   1. helmet      → headers de seguridad
 *   2. cors        → política de orígenes (frontend Vite)
 *   3. morgan      → logging HTTP en dev
 *   4. json/urlencoded → parsing de body
 *   5. /api/v1     → router de la API
 *   6. notFound    → 404 para rutas no montadas
 *   7. errorHandler → captura errores tipados/zod/db
 */
async function main(): Promise<void> {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet({
    crossOriginResourcePolicy: false,
    xFrameOptions: false,
    contentSecurityPolicy: false,
  }));
  app.use(
    cors({
      // En desarrollo reflejamos el origen de la petición (permite localhost,
      // 127.0.0.1 y el proxy del browser preview). En producción se restringe
      // a la lista blanca de CORS_ORIGINS.
      origin: env.NODE_ENV === 'development' ? true : env.CORS_ORIGINS,
      credentials: true,
    }),
  );

  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use('/archivos', express.static(path.join(process.cwd(), 'public', 'archivos')));

  // Exponer carpeta uploads para visualizar archivos como PDFs
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  // Verifica DB al arrancar; advierte pero no detiene si falla (útil en dev sin BD aún).
  try {
    await pingDatabase();
    // eslint-disable-next-line no-console
    console.log(`[db] conexión OK → ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      `[db] no se pudo conectar a ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}. Endpoints que tocan DB fallarán hasta resolverlo.`,
      err instanceof Error ? err.message : err,
    );
  }

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[http] API escuchando en http://localhost:${env.PORT}/api/v1 (env=${env.NODE_ENV})`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[fatal] el servidor no pudo arrancar:', err);
  process.exit(1);
});
