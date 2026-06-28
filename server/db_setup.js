import mysql from 'mysql2/promise';

async function run() {
  const pool = mysql.createPool({ host: '127.0.0.1', user: 'root', password: '1937462850', database: 'plataforma', multipleStatements: true });
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS historial_activo (
          id_historial INT AUTO_INCREMENT PRIMARY KEY,
          fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
          tipo ENUM('Validación', 'Designación', 'Pago', 'Boleta', 'Sistema') NOT NULL,
          modulo VARCHAR(100) NOT NULL,
          actor VARCHAR(100) NOT NULL,
          rut_docente INT NULL,
          descripcion TEXT NOT NULL,
          estado VARCHAR(50) NOT NULL,
          FOREIGN KEY (rut_docente) REFERENCES docentes(rut_docente) ON DELETE SET NULL
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS archivos_historicos (
          id_archivo INT AUTO_INCREMENT PRIMARY KEY,
          periodo_nombre VARCHAR(50) NOT NULL,
          fecha_cierre DATETIME DEFAULT CURRENT_TIMESTAMP,
          url_pdf_historial VARCHAR(255) NOT NULL,
          url_zip_boletas VARCHAR(255) NULL
      );
    `);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    process.exit(0);
  }
}
run();
