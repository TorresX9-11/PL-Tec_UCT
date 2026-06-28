import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { 
  mockCarrerasDisponibles, 
  mockAsignaturas, 
  mockSeccionesAsignaturas,
  mockDocentesMaestros 
} from '../../../src/app/data/mockData.js';

async function run() {
  const pool = mysql.createPool({ host: '127.0.0.1', user: 'root', password: '1937462850', database: 'plataforma' });

  try {
    // 1. Insertar Carreras
    for (const c of mockCarrerasDisponibles) {
      const jornada = c.nombre.includes('V.') ? 'vespertino' : 'diurno';
      // Ajustar longitud máxima si id_carrera es VARCHAR(4) o VARCHAR(10)
      const idStr = c.id_carrera.substring(0, 10);
      await pool.query(
        'INSERT IGNORE INTO carreras (id_carrera, nombre, jornada) VALUES (?, ?, ?)',
        [idStr, c.nombre, jornada]
      );
    }
    
    console.log('Carreras insertadas.');

    // 2. Insertar Docentes Adicionales (usaremos los mockDocentesMaestros + 4 extras)
    // Para no chocar con los existentes, inyectamos a Juan, Maria, Pedro, Ana
    const password = await bcrypt.hash('docente123', 10);
    const extraDocs = [
      { rut: 11111111, dv: '1', nombre: 'Carlos Muñoz', correo: 'carlos.munoz@uct.cl' },
      { rut: 22222222, dv: '2', nombre: 'Laura Bustos', correo: 'laura.bustos@uct.cl' },
      { rut: 33333333, dv: '3', nombre: 'Miguel Lagos', correo: 'miguel.lagos@uct.cl' },
      { rut: 44444444, dv: '4', nombre: 'Camila Ríos', correo: 'camila.rios@uct.cl' }
    ];

    for (const doc of [...mockDocentesMaestros, ...extraDocs]) {
      const rutNum = 'rut' in doc && typeof doc.rut === 'string' ? parseInt(doc.rut, 10) : (doc as any).rut;
      const dv = doc.dv;
      const nombre = 'nombreCompleto' in doc ? doc.nombreCompleto : (doc as any).nombre;
      const correo = doc.correo;

      await pool.query(
        'INSERT IGNORE INTO usuarios (correo_usuario, nombre, contrasena, nivel) VALUES (?, ?, ?, ?)',
        [correo, nombre, password, 'docente']
      );

      await pool.query(
        `INSERT IGNORE INTO docentes 
        (rut_docente, dv, correo_usuario, nombre, nivel_docente, estado_cv, estado_titulo, estado_antecedentes, estado_inhabilidad) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [rutNum, dv, correo, nombre, 'A', 'Validado', 'Validado', 'Validado', 'Validado']
      );
    }
    console.log('Docentes insertados.');

    // 3. Insertar Cursos (Asignaturas)
    for (const asig of mockAsignaturas) {
      // Necesitamos un id_carrera real. Mapearemos la carreraId del mock al id_carrera string
      // El mockCarreras original tenía id = 1 -> TUI-D, 2 -> TUGAE-D.
      // Usaremos el mockCarrerasDisponibles: 1=INFO, 2=GADE, 3=EENE, 4=EDPA, 7=INFV, etc
      let idCarreraStr = 'GADE';
      if ([1, 7].includes(asig.carreraId)) idCarreraStr = 'INFO';
      else if ([3, 9].includes(asig.carreraId)) idCarreraStr = 'EENE';
      else if ([4, 10].includes(asig.carreraId)) idCarreraStr = 'EDPA';
      else if ([5].includes(asig.carreraId)) idCarreraStr = 'PROA';
      else if ([6].includes(asig.carreraId)) idCarreraStr = 'EDDI';

      const jornada = asig.carreraId > 6 ? 'vespertino' : 'diurno';
      
      await pool.query(
        'INSERT IGNORE INTO cursos (id_carrera, id_curso, jornada, nombre, semestre, notas_ingresadas, notas_curso) VALUES (?, ?, ?, ?, ?, 0, 0)',
        [idCarreraStr, asig.codigo, jornada, asig.nombre, asig.semestre]
      );
    }
    console.log('Cursos insertados.');

    // 4. Insertar Grupos (Secciones)
    for (const sec of mockSeccionesAsignaturas) {
      const asig = mockAsignaturas.find(a => a.id === sec.asignaturaId);
      if (!asig) continue;

      let idCarreraStr = 'GADE';
      if ([1, 7].includes(asig.carreraId)) idCarreraStr = 'INFO';
      else if ([3, 9].includes(asig.carreraId)) idCarreraStr = 'EENE';
      else if ([4, 10].includes(asig.carreraId)) idCarreraStr = 'EDPA';

      const jornada = asig.carreraId > 6 ? 'vespertino' : 'diurno';
      
      // Mapear docenteId de mock (1=Juan Perez=12345678, 2=Maria, etc)
      let rutDocente = null;
      if (sec.docenteId) {
        const d = mockDocentesMaestros.find(md => md.id === sec.docenteId);
        if (d) rutDocente = parseInt(d.rut, 10);
      }

      await pool.query(
        `INSERT IGNORE INTO grupos 
        (id_carrera, id_curso, jornada, seccion, subgrupo, rut_docente, horas_presencial, horas_mixto, horas_administrativo, contenido_blackboard, guia_aprendizaje) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [idCarreraStr, asig.codigo, jornada, sec.seccion, sec.subGrupo || null, rutDocente, sec.horasP, sec.horasM, sec.horasA, sec.contenidoBlackboard || 'Inexistente', sec.guiaAprendizaje || 'Inexistente']
      );

      if (rutDocente && sec.notasTotales && sec.notasTotales > 0) {
        // Update curso notas
        await pool.query(
          'UPDATE cursos SET notas_curso = ?, notas_ingresadas = ? WHERE id_curso = ?',
          [sec.notasTotales, sec.notasIngresadas || 0, asig.codigo]
        );
      }
    }
    console.log('Grupos insertados.');

  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    process.exit(0);
  }
}

run();
