import mysql from 'mysql2/promise';

async function fixPagos() {
  const pool = mysql.createPool({host:'127.0.0.1', user:'root', password:'1937462850', database:'plataforma'});
  try {
    const [propuestas] = await pool.query('SELECT id_propuesta, rut_docente FROM propuestas');
    
    // Para cada propuesta
    let isVespertino = false;
    for (const p of propuestas) {
      await pool.query('DELETE FROM pagos WHERE id_propuesta = ?', [p.id_propuesta]);
      
      // Intercalar diurno/vespertino para el mock (Juan Perez será diurno = 4 cuotas)
      // rut 12345678 es Juan Carlos Perez Gonzalez
      const cuotas = p.rut_docente === 12345678 ? 4 : (isVespertino ? 5 : 4);
      isVespertino = !isVespertino; 
      
      const meses = ['marzo', 'abril', 'mayo', 'junio', 'julio'];
      // Insertar solo las cuotas correspondientes
      for (let i = 0; i < cuotas; i++) {
        await pool.query(
          `INSERT INTO pagos (id_propuesta, mes, estado_boleta) VALUES (?, ?, 'Faltante')`,
          [p.id_propuesta, meses[i]]
        );
      }
      
      // Update cuotas count in propuestas
      await pool.query('UPDATE propuestas SET cuotas = ? WHERE id_propuesta = ?', [cuotas, p.id_propuesta]);
    }
    console.log('Pagos actualizados: Diurnos (4) y Vespertinos (5).');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
fixPagos();
