import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '1937462850',
    database: 'plataforma'
  });

  const [rows] = await pool.query('SELECT * FROM coordinadores');
  console.log(JSON.stringify(rows, null, 2));
  
  process.exit(0);
}
main();
