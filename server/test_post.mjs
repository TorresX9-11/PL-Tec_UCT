const { createCoordinador } = require('./src/services/coordinadores.service.js');

async function run() {
  try {
    const res = await createCoordinador({
      correo_usuario: 'nuevo2@uct.cl',
      nombre: 'Nuevo Coord 2',
      rut: '7654321-0',
      id_carrera: 'T-GAE'
    });
    console.log('Success:', res);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
}
run();
