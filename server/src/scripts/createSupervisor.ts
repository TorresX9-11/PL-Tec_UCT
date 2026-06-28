import { pool } from '../config/db.js';
import bcrypt from 'bcryptjs';

async function run() {
  const pass = await bcrypt.hash('1234', 10);
  await pool.query('INSERT IGNORE INTO usuarios (correo_usuario, contrasena, nivel, nombre) VALUES (?, ?, ?, ?)', ['supervisor@uct.cl', pass, 'supervisor', 'Supervisor de Prueba']);
  console.log('Supervisor creado');
  process.exit(0);
}

run();
