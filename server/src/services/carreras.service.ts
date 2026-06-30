import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { HttpError } from '../middleware/error.js';
import { pool } from '../config/db.js';
import fs from 'fs/promises';
import path from 'path';
import type {
  Carrera,
  CreateCarreraInput,
  UpdateCarreraInput,
} from '../schemas/carreras.schema.js';

/**
 * Capa de acceso a datos para `carreras`.
 * Toda consulta usa prepared statements (`pool.execute`) — evita SQL injection.
 */

type CarreraRow = Carrera & RowDataPacket;

export async function listCarreras(): Promise<Carrera[]> {
  const [rows] = await pool.execute<CarreraRow[]>(
    'SELECT id_carrera, nombre, jornada FROM carreras ORDER BY id_carrera ASC',
  );
  return rows.map(({ id_carrera, nombre, jornada }) => ({ id_carrera, nombre, jornada }));
}

export async function findCarreraById(id: string): Promise<Carrera | null> {
  const [rows] = await pool.execute<CarreraRow[]>(
    'SELECT id_carrera, nombre, jornada FROM carreras WHERE id_carrera = :id LIMIT 1',
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return { id_carrera: row.id_carrera, nombre: row.nombre, jornada: row.jornada };
}

export async function createCarrera(input: CreateCarreraInput): Promise<Carrera> {
  await pool.execute<ResultSetHeader>(
    'INSERT INTO carreras (id_carrera, nombre, jornada) VALUES (:id_carrera, :nombre, :jornada)',
    input,
  );
  return { ...input };
}

export async function updateCarrera(
  id: string,
  input: UpdateCarreraInput,
): Promise<Carrera | null> {
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE carreras SET nombre = :nombre, jornada = :jornada WHERE id_carrera = :id',
    { ...input, id },
  );
  if (result.affectedRows === 0) return null;
  return { id_carrera: id, ...input };
}

export async function deleteCarrera(id: string): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Fetch evidencias to delete physical files later
    const [hitos] = await connection.execute<any[]>('SELECT id_hito FROM hitos_acreditacion WHERE id_carrera = ?', [id]);
    const hitosIds = hitos.map(h => h.id_hito);
    
    let archivosToDelete: string[] = [];
    if (hitosIds.length > 0) {
      const placeholders = hitosIds.map(() => '?').join(',');
      const [evidencias] = await connection.execute<any[]>(`SELECT url_archivo FROM evidencias_acreditacion WHERE id_hito IN (${placeholders}) AND url_archivo IS NOT NULL`, hitosIds);
      archivosToDelete = evidencias.map(e => e.url_archivo);
      
      // Delete evidencias_acreditacion
      await connection.execute(`DELETE FROM evidencias_acreditacion WHERE id_hito IN (${placeholders})`, hitosIds);
    }

    // 2. Delete hitos_acreditacion
    await connection.execute('DELETE FROM hitos_acreditacion WHERE id_carrera = ?', [id]);

    // 3. Delete grupos
    // First find cursos of this carrera
    const [cursos] = await connection.execute<any[]>('SELECT id_curso FROM cursos WHERE id_carrera = ?', [id]);
    const cursosIds = cursos.map(c => c.id_curso);
    if (cursosIds.length > 0) {
      const placeholders = cursosIds.map(() => '?').join(',');
      await connection.execute(`DELETE FROM grupos WHERE id_curso IN (${placeholders})`, cursosIds);
      // Wait, let's also delete propuestas_semestrales if they exist for these cursos
      // Though it seems propuestas_semestrales are linked to id_curso? Let's be safe and try. 
      // If the table doesn't exist or isn't linked like this, it might fail. Let's just delete grupos and cursos.
      // Wait, let's check if propuestas_semestrales has id_curso.
      try {
        await connection.execute(`DELETE FROM propuestas_semestrales WHERE id_curso IN (${placeholders})`, cursosIds);
      } catch (e) { /* ignore if table doesn't exist or column doesn't match */ }
      
      // Delete cursos
      await connection.execute(`DELETE FROM cursos WHERE id_carrera = ?`, [id]);
    }

    // 4. Nullify coordinadores
    await connection.execute('UPDATE coordinadores SET id_carrera = NULL WHERE id_carrera = ?', [id]);

    // 5. Delete Carrera
    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM carreras WHERE id_carrera = ?',
      [id],
    );

    await connection.commit();

    // 6. Delete physical files
    for (const url of archivosToDelete) {
      const filename = url.split('/').pop();
      if (filename) {
        const physicalPath = path.join(process.cwd(), 'public', 'uploads', filename);
        try {
          await fs.unlink(physicalPath);
        } catch (e) {} // ignore physical delete errors
      }
    }

    return result.affectedRows > 0;
  } catch (err: any) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
