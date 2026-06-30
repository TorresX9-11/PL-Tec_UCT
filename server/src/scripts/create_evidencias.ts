import mysql from 'mysql2/promise';

async function run() {
  const pool = mysql.createPool({ host: '127.0.0.1', user: 'root', password: '1937462850', database: 'plataforma' });
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS evidencias_acreditacion (
      id_evidencia INT AUTO_INCREMENT PRIMARY KEY,
      id_hito INT NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      tipo VARCHAR(50) NOT NULL,
      descripcion TEXT,
      fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
      url_archivo VARCHAR(255),
      FOREIGN KEY (id_hito) REFERENCES hitos_acreditacion(id_hito)
    )
  `);

  console.log('Tabla evidencias_acreditacion creada');
  process.exit(0);
}
run();
