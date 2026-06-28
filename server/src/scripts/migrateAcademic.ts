import { pool } from '../config/db.js';

async function migrate() {
  try {
    console.log('Iniciando migracion academica...');
    
    // Añadir columnas a docentes
    await pool.query(`
      ALTER TABLE docentes 
      ADD COLUMN IF NOT EXISTS estado_cv ENUM('Inexistente', 'Por Revisar', 'Validado') DEFAULT 'Inexistente',
      ADD COLUMN IF NOT EXISTS estado_titulo ENUM('Inexistente', 'Por Revisar', 'Validado') DEFAULT 'Inexistente',
      ADD COLUMN IF NOT EXISTS estado_antecedentes ENUM('Inexistente', 'Por Revisar', 'Validado') DEFAULT 'Inexistente',
      ADD COLUMN IF NOT EXISTS estado_inhabilidad ENUM('Inexistente', 'Por Revisar', 'Validado') DEFAULT 'Inexistente';
    `);
    console.log('Columnas añadidas a tabla docentes.');

    // Añadir columnas a grupos
    await pool.query(`
      ALTER TABLE grupos
      ADD COLUMN IF NOT EXISTS contenido_blackboard ENUM('Inexistente', 'Por Revisar', 'Validado') DEFAULT 'Inexistente',
      ADD COLUMN IF NOT EXISTS guia_aprendizaje ENUM('Inexistente', 'Por Revisar', 'Validado') DEFAULT 'Inexistente';
    `);
    console.log('Columnas añadidas a tabla grupos.');

    console.log('Migración completada exitosamente.');
    process.exit(0);
  } catch (err) {
    console.error('Error durante la migración:', err);
    process.exit(1);
  }
}

migrate();
