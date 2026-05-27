import mysql, { type Pool, type PoolOptions } from 'mysql2/promise';
import { env } from './env.js';

/**
 * Pool de conexiones MySQL/MariaDB compartido por toda la app.
 * Usa prepared statements (`pool.execute`) en los services para prevenir SQLi.
 */
const poolOptions: PoolOptions = {
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  waitForConnections: true,
  namedPlaceholders: true,
  // Evita parseo automático de DECIMAL/BIGINT a Number (puede perder precisión).
  decimalNumbers: false,
  dateStrings: false,
};

export const pool: Pool = mysql.createPool(poolOptions);

/**
 * Verifica conectividad. Llamado al boot del servidor para fallar rápido.
 */
export async function pingDatabase(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}
