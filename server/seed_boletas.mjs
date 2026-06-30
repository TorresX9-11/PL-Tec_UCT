import mysql from 'mysql2/promise';

async function seedPropuestasYPagos() {
  const pool = mysql.createPool({host:'127.0.0.1', user:'root', password:'1937462850', database:'plataforma'});
  try {
    const [docentes] = await pool.query('SELECT rut_docente FROM docentes');
    for (const doc of docentes) {
      const rut = doc.rut_docente;
      const [resProp] = await pool.query(
        `INSERT INTO propuestas (rut_docente, valor_propuesta, cuotas) VALUES (?, 1500000, 3)`,
        [rut]
      );
      
      const propuestaId = resProp.insertId;
      if (propuestaId) {
        const meses = ['abril', 'mayo', 'junio'];
        for (const mes of meses) {
          await pool.query(
            `INSERT INTO pagos (id_propuesta, mes, estado_boleta) VALUES (?, ?, 'Faltante')`,
            [propuestaId, mes]
          );
        }
      }
    }
    console.log('Seed completed successfully.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
seedPropuestasYPagos();
