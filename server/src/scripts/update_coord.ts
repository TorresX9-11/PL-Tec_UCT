import mysql from 'mysql2/promise';
async function run() {
  const pool = mysql.createPool({ host: '127.0.0.1', user: 'root', password: '1937462850', database: 'plataforma' });
  await pool.query('UPDATE coordinadores SET id_carrera = "GADE" WHERE correo_usuario="mgonzalez@uct.cl"');
  console.log('Updated mgonzalez to GADE');
  process.exit(0);
}
run();
