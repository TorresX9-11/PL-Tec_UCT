import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db.js';
import type {
  Curso,
  CreateCursoInput,
  UpdateCursoInput,
} from '../schemas/cursos.schema.js';

/**
 * Capa de acceso a datos para `cursos`.
 * Toda consulta usa prepared statements (`pool.execute`) — evita SQL injection.
 * NOTA: La PK es compuesta (id_carrera, id_curso).
 */

type CursoRow = Curso & RowDataPacket;

export async function listCursos(): Promise<Curso[]> {
  const [rows] = await pool.execute<CursoRow[]>(
    'SELECT id_carrera, id_curso, jornada, nombre, rut_docente, semestre, notas_ingresadas, notas_curso FROM cursos ORDER BY id_carrera ASC, id_curso ASC',
  );
  return rows.map(({ id_carrera, id_curso, jornada, nombre, rut_docente, semestre, notas_ingresadas, notas_curso }) => ({
    id_carrera,
    id_curso,
    jornada,
    nombre,
    rut_docente,
    semestre,
    notas_ingresadas,
    notas_curso,
  }));
}

export async function findCursoById(id_carrera: string, id_curso: string): Promise<Curso | null> {
  const [rows] = await pool.execute<CursoRow[]>(
    'SELECT id_carrera, id_curso, jornada, nombre, rut_docente, semestre, notas_ingresadas, notas_curso FROM cursos WHERE id_carrera = :id_carrera AND id_curso = :id_curso LIMIT 1',
    { id_carrera, id_curso },
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id_carrera: row.id_carrera,
    id_curso: row.id_curso,
    jornada: row.jornada,
    nombre: row.nombre,
    rut_docente: row.rut_docente,
    semestre: row.semestre,
    notas_ingresadas: row.notas_ingresadas,
    notas_curso: row.notas_curso,
  };
}

export async function createCurso(input: CreateCursoInput): Promise<Curso> {
  // Convertir undefined a null para campos opcionales
  const dbInput = {
    ...input,
    rut_docente: input.rut_docente ?? null,
    notas_ingresadas: input.notas_ingresadas ?? null,
  };

  await pool.execute<ResultSetHeader>(
    'INSERT INTO cursos (id_carrera, id_curso, jornada, nombre, rut_docente, semestre, notas_ingresadas, notas_curso) VALUES (:id_carrera, :id_curso, :jornada, :nombre, :rut_docente, :semestre, :notas_ingresadas, :notas_curso)',
    dbInput,
  );
  return dbInput as Curso;
}

export async function updateCurso(
  id_carrera: string,
  id_curso: string,
  input: UpdateCursoInput,
): Promise<Curso | null> {
  // Construir query dinámica solo con campos proporcionados
  const updates: string[] = [];
  const params: Record<string, string | number | null> = { id_carrera, id_curso };

  if (input.jornada !== undefined) {
    updates.push('jornada = :jornada');
    params.jornada = input.jornada;
  }
  if (input.nombre !== undefined) {
    updates.push('nombre = :nombre');
    params.nombre = input.nombre;
  }
  if (input.rut_docente !== undefined) {
    updates.push('rut_docente = :rut_docente');
    params.rut_docente = input.rut_docente;
  }
  if (input.semestre !== undefined) {
    updates.push('semestre = :semestre');
    params.semestre = input.semestre;
  }
  if (input.notas_ingresadas !== undefined) {
    updates.push('notas_ingresadas = :notas_ingresadas');
    params.notas_ingresadas = input.notas_ingresadas;
  }
  if (input.notas_curso !== undefined) {
    updates.push('notas_curso = :notas_curso');
    params.notas_curso = input.notas_curso;
  }

  if (updates.length === 0) {
    // Si no hay campos para actualizar, retornar el curso existente
    return await findCursoById(id_carrera, id_curso);
  }

  const query = `UPDATE cursos SET ${updates.join(', ')} WHERE id_carrera = :id_carrera AND id_curso = :id_curso`;
  const [result] = await pool.execute<ResultSetHeader>(query, params);

  if (result.affectedRows === 0) return null;

  // Retornar curso actualizado
  return await findCursoById(id_carrera, id_curso);
}

export async function deleteCurso(id_carrera: string, id_curso: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM cursos WHERE id_carrera = :id_carrera AND id_curso = :id_curso',
    { id_carrera, id_curso },
  );
  return result.affectedRows > 0;
}
