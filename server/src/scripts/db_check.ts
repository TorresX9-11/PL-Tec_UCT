import mysql from 'mysql2/promise';
async function run() {
  const pool = mysql.createPool({ host: '127.0.0.1', user: 'root', password: '1937462850', database: 'plataforma' });
  const [rows] = await pool.query('SELECT * FROM coordinadores');
  console.log('coordinadores:', rows);
  process.exit(0);
}
run();
