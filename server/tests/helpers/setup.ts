// Cargar variables de entorno de .env.test antes de cualquier import
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../../.env.test') });

// Asegurar JWT_SECRET válido para tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-32-chars-long!1234567890';
process.env.NODE_ENV = 'test';

import { beforeAll, afterAll } from 'vitest';
import { pool } from '../../src/config/db.js';

beforeAll(async () => {
  // Verificar conexión a base de datos
  try {
    await pool.execute('SELECT 1');
    console.log('[test] Database connection OK');
  } catch (error) {
    console.warn('[test] Database not available, some tests may fail');
  }
});

afterAll(async () => {
  // Cerrar pool de conexiones
  await pool.end();
  console.log('[test] Database pool closed');
});
