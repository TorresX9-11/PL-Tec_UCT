import { pool } from '../config/db.js';
import fs from 'fs/promises';
import path from 'path';

export async function getDashboardStats(id_carrera: string) {
  // Total docentes de la carrera
  const [docentesRows] = await pool.execute<any[]>(
    `SELECT DISTINCT d.rut_docente, d.estado_cv, d.estado_titulo, d.estado_antecedentes, d.estado_inhabilidad
     FROM docentes d
     JOIN grupos g ON d.rut_docente = g.rut_docente
     WHERE g.id_carrera = ?`,
    [id_carrera]
  );

  const totalDocentes = docentesRows.length;
  let cvCompleto = 0;
  let documentacionCompleta = 0;

  for (const doc of docentesRows) {
    if (doc.estado_cv === 'Validado') {
      cvCompleto++;
    }
    if (
      doc.estado_titulo === 'Validado' &&
      doc.estado_antecedentes === 'Validado' &&
      doc.estado_inhabilidad === 'Validado'
    ) {
      documentacionCompleta++;
    }
  }

  // Grupos/Cursos para estadísticas de notas y contenido
  const [gruposRows] = await pool.execute<any[]>(
    `SELECT g.id_grupo, g.contenido_blackboard, g.notas_estado, c.notas_curso, c.notas_ingresadas
     FROM grupos g
     JOIN cursos c ON g.id_curso = c.id_curso AND g.id_carrera = c.id_carrera AND g.jornada = c.jornada
     WHERE g.id_carrera = ?`,
    [id_carrera]
  );

  let contenidoAlDia = 0;
  let notasAlDia = 0;

  for (const g of gruposRows) {
    if (g.contenido_blackboard === 'Validado') {
      contenidoAlDia++;
    }
    if (g.notas_estado === 'Validado') {
      notasAlDia++;
    }
  }

  // Para evitar contar un docente múltiples veces en "contenidoAlDia" o "notasAlDia" si no es la lógica,
  // aquí estamos contando por "grupo/sección", lo cual en realidad tiene más sentido.
  // Pero para devolverlo igual, se enviarán estos números absolutos.

  return {
    totalDocentes,
    cvCompleto,
    documentacionCompleta,
    contenidoAlDia,
    notasAlDia,
  };
}

export async function getDocentesPorCarrera(id_carrera: string) {
  const [rows] = await pool.execute<any[]>(
    `SELECT DISTINCT d.rut_docente, d.dv, d.correo_usuario, d.contacto, d.nombre, d.nivel_docente,
            d.estado_cv, d.estado_titulo, d.estado_antecedentes, d.estado_inhabilidad,
            (SELECT COUNT(*) FROM capacitaciones c WHERE c.rut_docente = d.rut_docente) as capacitaciones
     FROM docentes d
     JOIN grupos g ON d.rut_docente = g.rut_docente
     WHERE g.id_carrera = ?`,
    [id_carrera]
  );
  return rows;
}

export async function updateValidacionDocente(
  rut_docente: number,
  estados: {
    estado_cv?: string;
    estado_titulo?: string;
    estado_antecedentes?: string;
    estado_inhabilidad?: string;
  }
) {
  const fields = [];
  const values: any[] = [];

  if (estados.estado_cv) {
    fields.push('estado_cv = ?');
    values.push(estados.estado_cv);
  }
  if (estados.estado_titulo) {
    fields.push('estado_titulo = ?');
    values.push(estados.estado_titulo);
  }
  if (estados.estado_antecedentes) {
    fields.push('estado_antecedentes = ?');
    values.push(estados.estado_antecedentes);
  }
  if (estados.estado_inhabilidad) {
    fields.push('estado_inhabilidad = ?');
    values.push(estados.estado_inhabilidad);
  }

  if (fields.length === 0) return;

  values.push(rut_docente);

  await pool.execute(
    `UPDATE docentes SET ${fields.join(', ')} WHERE rut_docente = ?`,
    values
  );
}

export async function getGruposPorCarrera(id_carrera: string) {
  const [rows] = await pool.execute<any[]>(
    `SELECT g.id_grupo, g.seccion, g.subgrupo, g.jornada, 
            g.contenido_blackboard, g.guia_aprendizaje, g.notas_estado,
            c.id_curso, c.nombre as nombre_curso, c.notas_curso, c.notas_ingresadas,
            d.rut_docente, d.nombre as nombre_docente
     FROM grupos g
     JOIN cursos c ON g.id_curso = c.id_curso AND g.id_carrera = c.id_carrera AND g.jornada = c.jornada
     LEFT JOIN docentes d ON g.rut_docente = d.rut_docente
     WHERE g.id_carrera = ?`,
    [id_carrera]
  );
  return rows;
}

export async function updateValidacionGrupo(
  id_grupo: number,
  estados: {
    contenido_blackboard?: string;
    guia_aprendizaje?: string;
    notas_estado?: string;
  }
) {
  const fields = [];
  const values: any[] = [];

  if (estados.contenido_blackboard) {
    fields.push('contenido_blackboard = ?');
    values.push(estados.contenido_blackboard);
  }
  if (estados.guia_aprendizaje) {
    fields.push('guia_aprendizaje = ?');
    values.push(estados.guia_aprendizaje);
  }
  if (estados.notas_estado) {
    fields.push('notas_estado = ?');
    values.push(estados.notas_estado);
  }

  if (fields.length === 0) return;

  values.push(id_grupo);

  await pool.execute(
    `UPDATE grupos SET ${fields.join(', ')} WHERE id_grupo = ?`,
    values
  );
}

export async function getHitosAcreditacion(id_carrera: string) {
  const [rows] = await pool.execute<any[]>('SELECT * FROM hitos_acreditacion WHERE id_carrera = ?', [id_carrera]);
  return rows;
}

export async function updateHitoAcreditacion(id_hito: number, estado: string) {
  await pool.execute('UPDATE hitos_acreditacion SET estado = ? WHERE id_hito = ?', [estado, id_hito]);
}

export async function addEvidenciaHito(id_hito: number, data: { titulo: string; tipo: string; descripcion: string; url_archivo: string | null }) {
  await pool.execute(
    'INSERT INTO evidencias_acreditacion (id_hito, titulo, tipo, descripcion, url_archivo) VALUES (?, ?, ?, ?, ?)',
    [id_hito, data.titulo, data.tipo, data.descripcion, data.url_archivo]
  );
  await pool.execute('UPDATE hitos_acreditacion SET evidencias = evidencias + 1 WHERE id_hito = ?', [id_hito]);
}

export async function getEvidenciasPorHito(id_hito: number) {
  const [rows] = await pool.execute<any[]>('SELECT * FROM evidencias_acreditacion WHERE id_hito = ? ORDER BY fecha_subida DESC', [id_hito]);
  return rows;
}

export async function getEvidenciasRecientes(id_carrera: string) {
  const [rows] = await pool.execute<any[]>(`
    SELECT e.*, h.nombre as nombre_hito
    FROM evidencias_acreditacion e
    JOIN hitos_acreditacion h ON e.id_hito = h.id_hito
    WHERE h.id_carrera = ?
    ORDER BY e.fecha_subida DESC
    LIMIT 5
  `, [id_carrera]);
  return rows;
}

export async function deleteEvidenciaHito(id_evidencia: number) {
  const [rows] = await pool.execute<any[]>('SELECT id_hito, url_archivo FROM evidencias_acreditacion WHERE id_evidencia = ?', [id_evidencia]);
  if (rows.length === 0) return;

  const evidencia = rows[0];
  const { id_hito, url_archivo } = evidencia;

  // 1. Delete physical file if exists
  if (url_archivo) {
    // url_archivo is typically something like `/uploads/file.pdf`
    // We want the physical path: C:\...\server\public\uploads\file.pdf
    const filename = url_archivo.split('/').pop();
    if (filename) {
      const physicalPath = path.join(process.cwd(), 'public', 'uploads', filename);
      try {
        await fs.unlink(physicalPath);
      } catch (err: any) {
        if (err.code !== 'ENOENT') {
          console.error('Error deleting file physically:', err);
        }
      }
    }
  }

  // 2. Delete from database
  await pool.execute('DELETE FROM evidencias_acreditacion WHERE id_evidencia = ?', [id_evidencia]);

  // 3. Update counter
  await pool.execute('UPDATE hitos_acreditacion SET evidencias = evidencias - 1 WHERE id_hito = ?', [id_hito]);
}