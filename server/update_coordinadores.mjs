import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '1937462850',
    database: 'plataforma'
  });

  await pool.query("UPDATE coordinadores SET nombre='María González', rut='11222333-4' WHERE correo_usuario='mgonzalez@uct.cl'");
  console.log('Updated');
  
  process.exit(0);
}
main();
