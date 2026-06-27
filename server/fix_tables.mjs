import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({ host: '127.0.0.1', user: 'root', password: '1937462850', database: 'plataforma', multipleStatements: true });
  
  await pool.query('DROP TABLE IF EXISTS pagos');
  await pool.query('DROP TABLE IF EXISTS propuestas');
  
  const createPropuestas = `
    CREATE TABLE IF NOT EXISTS propuestas (
      id_propuesta    INT AUTO_INCREMENT NOT NULL,
      rut_docente     INT NOT NULL,
      valor_propuesta INT NOT NULL,
      cuotas          TINYINT,
      PRIMARY KEY (id_propuesta),
      FOREIGN KEY (rut_docente) REFERENCES docentes(rut_docente)
    )
  `;
  
  const createPagos = `
    CREATE TABLE IF NOT EXISTS pagos (
      id_pago      INT AUTO_INCREMENT NOT NULL ,
      id_propuesta INT NOT NULL,
      mes          ENUM('enero','febrero','marzo','abril',
                        'mayo','junio','julio','agosto',
                        'septiembre','octubre','noviembre','diciembre') NOT NULL,
      notas        TEXT(32767),
      estado_pago  ENUM('Pendiente', 'Pagada') DEFAULT 'Pendiente',
      fecha_pago   DATE,
      estado_boleta ENUM('Faltante', 'Subida', 'Procesada', 'Con Observación') DEFAULT 'Faltante',
      PRIMARY KEY (id_pago),
      FOREIGN KEY (id_propuesta) REFERENCES propuestas(id_propuesta)
    )
  `;
  
  await pool.query(createPropuestas);
  await pool.query(createPagos);
  
  console.log('Tables recreated successfully');
  process.exit(0);
}

main().catch(console.error);
