import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({ host: '127.0.0.1', user: 'root', password: '1937462850', database: 'plataforma', multipleStatements: true });
  
  await pool.query('DROP TABLE IF EXISTS archivos');
  await pool.query('DROP TABLE IF EXISTS capacitaciones');
  
  const createArchivos = `
    CREATE TABLE IF NOT EXISTS archivos (
      id_archivo     INT AUTO_INCREMENT NOT NULL,
      correo_usuario VARCHAR(32),
      ruta           VARCHAR(255) NOT NULL,
      id_carrera     VARCHAR(4),
      id_curso       VARCHAR(5),
      PRIMARY KEY (id_archivo),
      FOREIGN KEY (correo_usuario) REFERENCES usuarios(correo_usuario)
    )
  `;
  
  const createCapacitaciones = `
    CREATE TABLE IF NOT EXISTS capacitaciones (
      id_capacitacion INT AUTO_INCREMENT NOT NULL,
      rut_docente     INT NOT NULL,
      nombre          VARCHAR(100) NOT NULL,
      institucion     VARCHAR(100),
      anio            INT,
      horas           INT,
      archivo_adjunto VARCHAR(255),
      PRIMARY KEY (id_capacitacion),
      FOREIGN KEY (rut_docente) REFERENCES docentes(rut_docente)
    )
  `;
  
  await pool.query(createArchivos);
  await pool.query(createCapacitaciones);
  
  console.log('Tables recreated successfully');
  process.exit(0);
}

main().catch(console.error);
