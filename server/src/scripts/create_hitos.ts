import mysql from 'mysql2/promise';

async function run() {
  const pool = mysql.createPool({ host: '127.0.0.1', user: 'root', password: '1937462850', database: 'plataforma' });
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hitos_acreditacion (
      id_hito INT AUTO_INCREMENT PRIMARY KEY,
      id_carrera VARCHAR(10) NOT NULL,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      fecha_limite DATE,
      estado ENUM('Completo', 'En Progreso', 'Pendiente') DEFAULT 'Pendiente',
      evidencias INT DEFAULT 0,
      FOREIGN KEY (id_carrera) REFERENCES carreras(id_carrera)
    )
  `);

  console.log('Tabla hitos_acreditacion creada');

  // Obtener carreras existentes para inyectarles los hitos iniciales
  const [carreras] = await pool.query<any[]>('SELECT id_carrera FROM carreras');

  const hitosBase = [
    { nombre: 'Diagnóstico Institucional', desc: 'Autoevaluación y diagnóstico inicial', fecha: '2026-05-30' },
    { nombre: 'Plan de Mejora', desc: 'Elaboración del plan de mejora institucional', fecha: '2026-07-15' },
    { nombre: 'Documentación Académica', desc: 'Compilación de evidencias académicas', fecha: '2026-08-30' },
    { nombre: 'Informe de Autoevaluación', desc: 'Redacción del informe final', fecha: '2026-10-31' },
    { nombre: 'Visita de Pares', desc: 'Preparación para visita de evaluadores', fecha: '2026-12-15' },
  ];

  for (const c of carreras) {
    // Verificar si ya tiene hitos para no duplicar
    const [existing] = await pool.query<any[]>('SELECT id_hito FROM hitos_acreditacion WHERE id_carrera = ?', [c.id_carrera]);
    if (existing.length === 0) {
      for (const hito of hitosBase) {
        await pool.query(
          'INSERT INTO hitos_acreditacion (id_carrera, nombre, descripcion, fecha_limite, estado, evidencias) VALUES (?, ?, ?, ?, ?, ?)',
          [c.id_carrera, hito.nombre, hito.desc, hito.fecha, 'Pendiente', 0]
        );
      }
    }
  }

  console.log('Hitos insertados para las carreras');
  process.exit(0);
}
run();
