// Inicializa la base de datos de pruebas (DB_NAME) cargando el esquema desde
// ../../database/schema.sql. Uso:
//   DB_PASSWORD=admin node scripts/init-test-db.mjs
// Variables: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME (default plataforma_test).
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const host = process.env.DB_HOST || '127.0.0.1';
const port = Number(process.env.DB_PORT || 3306);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'plataforma_test';

const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
let sql = readFileSync(schemaPath, 'utf8');

// Quitar las sentencias CREATE DATABASE / USE del esquema original (apuntaba a `plataforma`).
sql = sql
  .replace(/CREATE DATABASE[^;]*;/i, '')
  .replace(/USE\s+\w+\s*;/i, '');

const bootstrap =
  `CREATE DATABASE IF NOT EXISTS \`${database}\`;\nUSE \`${database}\`;\n` + sql;

const conn = await mysql.createConnection({
  host,
  port,
  user,
  password,
  multipleStatements: true,
});

try {
  await conn.query(bootstrap);
  console.log(`[init-test-db] Esquema cargado en '${database}' (${host}:${port}).`);
} catch (err) {
  console.error('[init-test-db] Error:', err.message);
  process.exitCode = 1;
} finally {
  await conn.end();
}
