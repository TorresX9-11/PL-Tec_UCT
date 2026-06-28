import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function run() {
  const pool = mysql.createPool({ host: '127.0.0.1', user: 'root', password: '1937462850', database: 'plataforma' });
  try {
    await pool.query("ALTER TABLE usuarios MODIFY COLUMN nivel ENUM('docente','coordinador','academico','admin','supervisor')");
    
    const hashSup = await bcrypt.hash('11111111', 10);
    await pool.query('INSERT IGNORE INTO usuarios (correo_usuario, nombre, contrasena, nivel) VALUES (?, ?, ?, ?)', ['director.tec@uct.cl', 'Director TEC (Supervisor)', hashSup, 'supervisor']);
    await pool.query('UPDATE usuarios SET nivel="supervisor" WHERE correo_usuario="supervisor@uct.cl"');
    
    const hashCoord = await bcrypt.hash('12222222', 10);
    await pool.query('INSERT IGNORE INTO usuarios (correo_usuario, nombre, contrasena, nivel) VALUES (?, ?, ?, ?)', ['mgonzalez@uct.cl', 'Coordinador Gonzalez', hashCoord, 'coordinador']);
    await pool.query('INSERT IGNORE INTO coordinadores (correo_usuario, id_carrera) VALUES (?, ?)', ['mgonzalez@uct.cl', 'T-GAE']);
    
    const hashDoc = await bcrypt.hash('docente123', 10);
    await pool.query('INSERT IGNORE INTO usuarios (correo_usuario, nombre, contrasena, nivel) VALUES (?, ?, ?, ?)', ['juan.perez@uct.cl', 'Juan Perez', hashDoc, 'docente']);
    
    console.log('Database fixed');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
