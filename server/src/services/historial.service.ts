import fs from 'fs';
import path from 'path';
// @ts-ignore
import PDFDocument from 'pdfkit';
// @ts-ignore
import * as archiverLib from 'archiver';
import { pool } from '../config/db.js';
import { RowDataPacket } from 'mysql2';

export interface RegistroActivo {
  id_historial?: number;
  fecha?: string;
  tipo: 'Validación' | 'Designación' | 'Pago' | 'Boleta' | 'Sistema';
  modulo: string;
  actor: string;
  rut_docente?: number | null;
  descripcion: string;
  estado: string;
}

export async function registrarEvento(registro: RegistroActivo): Promise<void> {
  const { tipo, modulo, actor, rut_docente, descripcion, estado } = registro;
  await pool.query(
    'INSERT INTO historial_activo (tipo, modulo, actor, rut_docente, descripcion, estado) VALUES (?, ?, ?, ?, ?, ?)',
    [tipo, modulo, actor, rut_docente || null, descripcion, estado]
  );
}

export async function obtenerHistorialActivo(): Promise<any[]> {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT h.*, d.nombre as nombre_docente 
    FROM historial_activo h
    LEFT JOIN docentes d ON h.rut_docente = d.rut_docente
    ORDER BY h.fecha DESC
  `);
  return rows.map((r: any) => ({
    id: r.id_historial.toString(),
    fecha: new Date(r.fecha).toISOString().split('T')[0],
    fechaLabel: new Date(r.fecha).toLocaleDateString('es-CL'),
    tipo: r.tipo,
    modulo: r.modulo,
    actor: r.actor,
    docente: r.nombre_docente || '-',
    descripcion: r.descripcion,
    estado: r.estado
  }));
}

export async function obtenerArchivosHistoricos(): Promise<any[]> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM archivos_historicos ORDER BY fecha_cierre DESC');
  return rows.map((r: any) => ({
    id: r.id_archivo,
    periodo_nombre: r.periodo_nombre,
    fecha_cierre: new Date(r.fecha_cierre).toLocaleDateString('es-CL'),
    url_pdf_historial: r.url_pdf_historial,
    url_zip_boletas: r.url_zip_boletas
  }));
}

export async function cerrarSemestre(periodoNombre: string): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Obtener Historial Activo
    const [historialRows] = await connection.query<RowDataPacket[]>(`
      SELECT h.*, d.nombre as nombre_docente 
      FROM historial_activo h
      LEFT JOIN docentes d ON h.rut_docente = d.rut_docente
      ORDER BY h.fecha ASC
    `);

    // 2. Consultar Snapshots de las tablas importantes
    const [carrerasRows] = await connection.query<RowDataPacket[]>('SELECT id_carrera, jornada, nombre FROM carreras');
    const [cursosRows] = await connection.query<RowDataPacket[]>('SELECT id_carrera, id_curso, jornada, nombre, semestre FROM cursos');
    const [docentesRows] = await connection.query<RowDataPacket[]>('SELECT rut_docente, dv, nombre, nivel_docente, correo_usuario, contacto FROM docentes');
    const [gruposRows] = await connection.query<RowDataPacket[]>(`
      SELECT g.id_curso, g.seccion, g.horas_presencial, g.horas_mixto, g.horas_administrativo, d.nombre as docente
      FROM grupos g
      LEFT JOIN docentes d ON g.rut_docente = d.rut_docente
    `);
    const [propuestasRows] = await connection.query<RowDataPacket[]>(`
      SELECT p.id_propuesta, d.nombre as docente, p.valor_propuesta, p.cuotas 
      FROM propuestas p
      JOIN docentes d ON p.rut_docente = d.rut_docente
    `);
    const [pagosRows] = await connection.query<RowDataPacket[]>(`
      SELECT pa.mes, pa.estado_pago, pa.estado_boleta, pa.fecha_pago, d.nombre as docente
      FROM pagos pa
      JOIN propuestas pr ON pa.id_propuesta = pr.id_propuesta
      JOIN docentes d ON pr.rut_docente = d.rut_docente
      ORDER BY d.nombre ASC, pa.mes ASC
    `);

    // 3. Generar PDF Maestro
    const publicDir = path.join(process.cwd(), 'public');
    const archivosDir = path.join(publicDir, 'archivos');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
    if (!fs.existsSync(archivosDir)) fs.mkdirSync(archivosDir);

    const pdfFilename = `historial_${periodoNombre.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const pdfPath = path.join(archivosDir, pdfFilename);
    const pdfUrl = `/archivos/${pdfFilename}`;

    await new Promise<void>(async (resolve, reject) => {
      // @ts-ignore
      const PDFDocumentWithTables = (await import('pdfkit-table')).default || (await import('pdfkit-table'));
      // @ts-ignore
      const doc = new PDFDocumentWithTables({ margin: 30 });
      const stream = fs.createWriteStream(pdfPath);
      doc.pipe(stream);

      // --- PÁGINA 1: PORTADA E HISTORIAL ACTIVO ---
      doc.fontSize(20).text(`Cierre de Semestre: ${periodoNombre}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Fecha de Cierre: ${new Date().toLocaleDateString('es-CL')}`);
      doc.text(`Eventos registrados: ${historialRows.length}`);
      doc.moveDown();
      
      doc.fontSize(16).text('1. Bitácora de Eventos (Historial)', { underline: true });
      doc.moveDown(0.5);

      if (historialRows.length === 0) {
        doc.fontSize(10).text('No hay registros en el historial activo.');
      } else {
        for (const r of historialRows) {
          const d = new Date(r.fecha).toLocaleString('es-CL');
          doc.fontSize(10).text(`[${d}] ${r.actor} -> ${r.modulo} | ${r.tipo}`);
          doc.fontSize(9).text(`Docente: ${r.nombre_docente || '-'} | Estado: ${r.estado}`);
          doc.text(`${r.descripcion}`);
          doc.moveDown(0.5);
        }
      }

      // Función auxiliar para dibujar tablas con control de errores
      const dibujarTabla = async (titulo: string, headers: string[], rows: any[][]) => {
        doc.addPage();
        doc.fontSize(16).text(titulo, { underline: true });
        doc.moveDown();
        if (rows.length === 0) {
           doc.fontSize(10).text('No hay registros.');
           return;
        }
        const table = {
          title: "",
          headers: headers,
          rows: rows
        };
        // @ts-ignore
        await doc.table(table, {
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
          // @ts-ignore
          prepareRow: (row, indexColumn, indexRow, rectRow) => doc.font("Helvetica").fontSize(8)
        });
      };

      // --- SNAPSHOTS DE TABLAS ---
      
      await dibujarTabla('2. Catálogo de Carreras', ['ID', 'Jornada', 'Nombre'], 
        carrerasRows.map(r => [r.id_carrera, r.jornada, r.nombre])
      );

      await dibujarTabla('3. Catálogo de Asignaturas', ['ID Carrera', 'ID Curso', 'Jornada', 'Nombre', 'Semestre'], 
        cursosRows.map(r => [r.id_carrera, r.id_curso, r.jornada, r.nombre, r.semestre])
      );

      await dibujarTabla('4. Capa 1: Maestro de Docentes', ['RUT', 'Nombre', 'Nivel', 'Correo', 'Contacto'], 
        docentesRows.map(r => [`${r.rut_docente}-${r.dv}`, r.nombre, r.nivel_docente, r.correo_usuario || '', r.contacto || ''])
      );

      await dibujarTabla('5. Capa 2: Designación PMA', ['Curso', 'Sección', 'Docente', 'Hrs Pres.', 'Hrs Mix.', 'Hrs Admin.'], 
        gruposRows.map(r => [r.id_curso, r.seccion, r.docente || 'Sin Asignar', String(r.horas_presencial), String(r.horas_mixto), String(r.horas_administrativo)])
      );

      await dibujarTabla('6. Capa 3: Propuestas Económicas', ['Docente', 'Valor Propuesta', 'N° Cuotas'], 
        propuestasRows.map(r => [r.docente, `$${r.valor_propuesta}`, String(r.cuotas)])
      );

      await dibujarTabla('7. Bandeja de Pagos y Boletas', ['Docente', 'Mes', 'Estado Pago', 'Estado Boleta', 'Fecha Pago'], 
        pagosRows.map(r => [r.docente, r.mes, r.estado_pago, r.estado_boleta, r.fecha_pago ? new Date(r.fecha_pago).toLocaleDateString('es-CL') : '-'])
      );

      doc.end();
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // 4. Simular recolección de PDFs de boletas y crear ZIP
    const zipFilename = `boletas_${periodoNombre.replace(/\s+/g, '_')}_${Date.now()}.zip`;
    const zipPath = path.join(archivosDir, zipFilename);
    const zipUrl = `/archivos/${zipFilename}`;

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = new archiverLib.ZipArchive({ zlib: { level: 9 } });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);
      archive.append('Este archivo contendría los PDFs originales de las boletas. Es una simulación.', { name: 'leeme.txt' });
      archive.finalize();
    });

    // 5. Guardar registro en archivos_historicos
    await connection.query(
      'INSERT INTO archivos_historicos (periodo_nombre, url_pdf_historial, url_zip_boletas) VALUES (?, ?, ?)',
      [periodoNombre, pdfUrl, zipUrl]
    );

    // 6. Eliminar registros del semestre (Reglas de negocio del cliente)
    // Se borran Pagos y Propuestas primero por las llaves foráneas.
    await connection.query('DELETE FROM pagos');
    await connection.query('DELETE FROM propuestas');
    // Se borran las secciones/designaciones (Grupos)
    await connection.query('DELETE FROM grupos');
    // Se vacía la bitácora
    await connection.query('TRUNCATE TABLE historial_activo');

    // Nota: carreras, cursos, docentes y usuarios SE MANTIENEN.

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
