import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db.js';
import type {
  Grupo,
  CreateGrupoInput,
  UpdateGrupoInput,
} from '../schemas/grupos.schema.js';

/**
 * Capa de acceso a datos para `grupos`.
 * Toda consulta usa prepared statements (`pool.execute`) — evita SQL injection.
 */

type GrupoRow = Grupo & RowDataPacket;

export async function listGrupos(): Promise<Grupo[]> {
  const [rows] = await pool.execute<GrupoRow[]>(
    'SELECT id_grupo, id_carrera, id_curso, seccion, horas_presencial, horas_mixto, horas_administrativo FROM grupos ORDER BY id_grupo ASC',
  );
  return rows.map(({ id_grupo, id_carrera, id_curso, seccion, horas_presencial, horas_mixto, horas_administrativo }) => ({
    id_grupo,
    id_carrera,
    id_curso,
    seccion,
    horas_presencial,
    horas_mixto,
    horas_administrativo,
  }));
}

export async function findGrupoById(id: string): Promise<Grupo | null> {
  const [rows] = await pool.execute<GrupoRow[]>(
    'SELECT id_grupo, id_carrera, id_curso, seccion, horas_presencial, horas_mixto, horas_administrativo FROM grupos WHERE id_grupo = :id LIMIT 1',
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id_grupo: row.id_grupo,
    id_carrera: row.id_carrera,
    id_curso: row.id_curso,
    seccion: row.seccion,
    horas_presencial: row.horas_presencial,
    horas_mixto: row.horas_mixto,
    horas_administrativo: row.horas_administrativo,
  };
}

export async function createGrupo(input: CreateGrupoInput): Promise<Grupo> {
  // Convertir undefined a null para campos opcionales
  const dbInput = {
    ...input,
    horas_presencial: input.horas_presencial ?? null,
    horas_mixto: input.horas_mixto ?? null,
    horas_administrativo: input.horas_administrativo ?? null,
  };

  await pool.execute<ResultSetHeader>(
    'INSERT INTO grupos (id_grupo, id_carrera, id_curso, seccion, horas_presencial, horas_mixto, horas_administrativo) VALUES (:id_grupo, :id_carrera, :id_curso, :seccion, :horas_presencial, :horas_mixto, :horas_administrativo)',
    dbInput,
  );
  return dbInput as Grupo;
}

export async function updateGrupo(
  id: string,
  input: UpdateGrupoInput,
): Promise<Grupo | null> {
  // Construir query dinámica solo con campos proporcionados
  const updates: string[] = [];
  const params: Record<string, string | number | null> = { id };

  if (input.id_carrera !== undefined) {
    updates.push('id_carrera = :id_carrera');
    params.id_carrera = input.id_carrera;
  }
  if (input.id_curso !== undefined) {
    updates.push('id_curso = :id_curso');
    params.id_curso = input.id_curso;
  }
  if (input.seccion !== undefined) {
    updates.push('seccion = :seccion');
    params.seccion = input.seccion;
  }
  if (input.horas_presencial !== undefined) {
    updates.push('horas_presencial = :horas_presencial');
    params.horas_presencial = input.horas_presencial;
  }
  if (input.horas_mixto !== undefined) {
    updates.push('horas_mixto = :horas_mixto');
    params.horas_mixto = input.horas_mixto;
  }
  if (input.horas_administrativo !== undefined) {
    updates.push('horas_administrativo = :horas_administrativo');
    params.horas_administrativo = input.horas_administrativo;
  }

  if (updates.length === 0) {
    // Si no hay campos para actualizar, retornar el grupo existente
    return await findGrupoById(id);
  }

  const query = `UPDATE grupos SET ${updates.join(', ')} WHERE id_grupo = :id`;
  const [result] = await pool.execute<ResultSetHeader>(query, params);

  if (result.affectedRows === 0) return null;

  // Retornar grupo actualizado
  return await findGrupoById(id);
}

export async function deleteGrupo(id: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM grupos WHERE id_grupo = :id',
    { id },
  );
  return result.affectedRows > 0;
}
