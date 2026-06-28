import mysql from 'mysql2/promise';
async function run() {
  const pool = mysql.createPool({ host: '127.0.0.1', user: 'root', password: '1937462850', database: 'plataforma' });
  await pool.query("ALTER TABLE grupos ADD COLUMN notas_estado ENUM('Inexistente', 'Por Revisar', 'Validado') DEFAULT 'Por Revisar'");
  console.log('Column notas_estado added to grupos');
  process.exit(0);
}
run();
