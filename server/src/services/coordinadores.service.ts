import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { HttpError } from '../middleware/error.js';
import type {
  Coordinador,
  CreateCoordinadorInput,
  UpdateCoordinadorInput,
  GestionarCredencialesInput,
} from '../schemas/coordinadores.schema.js';

/**
 * Capa de acceso a datos para `coordinadores`.
 * Toda consulta usa prepared statements (`pool.execute`) — evita SQL injection.
 */

type CoordinadorRow = Coordinador & RowDataPacket;

export async function listCoordinadores(): Promise<Coordinador[]> {
  const [rows] = await pool.execute<CoordinadorRow[]>(
    'SELECT id_coordinador, correo_usuario, id_carrera FROM coordinadores ORDER BY id_coordinador ASC',
  );
  return rows.map(({ id_coordinador, correo_usuario, id_carrera }) => ({
    id_coordinador,
    correo_usuario,
    id_carrera,
  }));
}

export async function findCoordinadorById(id: number): Promise<Coordinador | null> {
  const [rows] = await pool.execute<CoordinadorRow[]>(
    'SELECT id_coordinador, correo_usuario, id_carrera FROM coordinadores WHERE id_coordinador = :id LIMIT 1',
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id_coordinador: row.id_coordinador,
    correo_usuario: row.correo_usuario,
    id_carrera: row.id_carrera,
  };
}

export async function createCoordinador(input: CreateCoordinadorInput): Promise<Coordinador> {
  // Convertir undefined a null para campos opcionales
  const dbInput = {
    correo_usuario: input.correo_usuario ?? null,
    id_carrera: input.id_carrera ?? null,
  };

  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO coordinadores (correo_usuario, id_carrera) VALUES (:correo_usuario, :id_carrera)',
    dbInput,
  );
  return {
    id_coordinador: result.insertId as number,
    ...dbInput,
  };
}

export async function updateCoordinador(
  id: number,
  input: UpdateCoordinadorInput,
): Promise<Coordinador | null> {
  // Construir query dinámica solo con campos proporcionados
  const updates: string[] = [];
  const params: Record<string, string | number | null> = { id };

  if (input.correo_usuario !== undefined) {
    updates.push('correo_usuario = :correo_usuario');
    params.correo_usuario = input.correo_usuario;
  }
  if (input.id_carrera !== undefined) {
    updates.push('id_carrera = :id_carrera');
    params.id_carrera = input.id_carrera;
  }

  if (updates.length === 0) {
    // Si no hay campos para actualizar, retornar el coordinador existente
    return await findCoordinadorById(id);
  }

  const query = `UPDATE coordinadores SET ${updates.join(', ')} WHERE id_coordinador = :id`;
  const [result] = await pool.execute<ResultSetHeader>(query, params);

  if (result.affectedRows === 0) return null;

  // Retornar coordinador actualizado
  return await findCoordinadorById(id);
}

export async function deleteCoordinador(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM coordinadores WHERE id_coordinador = :id',
    { id },
  );
  return result.affectedRows > 0;
}

/**
 * Crea o actualiza el usuario asociado (nivel 'coordinador') del coordinador y
 * vincula el `correo_usuario` en la tabla `coordinadores`. Todo en una sola
 * transacción: si cualquier paso falla, se revierte.
 * Retorna el coordinador actualizado (sin contraseña).
 */
export async function gestionarCredenciales(
  coordinador: Coordinador,
  input: GestionarCredencialesInput,
): Promise<Coordinador> {
  const { correo_usuario, nombre, contrasena } = input;
  const hash = await bcrypt.hash(contrasena, 10);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. ¿Ya existe el usuario con ese correo?
    const [existingRows] = await conn.execute<RowDataPacket[]>(
      'SELECT correo_usuario FROM usuarios WHERE correo_usuario = :correo_usuario LIMIT 1',
      { correo_usuario },
    );

    if (existingRows.length === 0) {
      // Crear usuario nivel coordinador
      await conn.execute<ResultSetHeader>(
        `INSERT INTO usuarios (correo_usuario, nombre, contrasena, nivel)
         VALUES (:correo_usuario, :nombre, :contrasena, 'coordinador')`,
        { correo_usuario, nombre, contrasena: hash },
      );
    } else {
      // Resetear contraseña (y nombre) del usuario existente
      await conn.execute<ResultSetHeader>(
        'UPDATE usuarios SET nombre = :nombre, contrasena = :contrasena WHERE correo_usuario = :correo_usuario',
        { correo_usuario, nombre, contrasena: hash },
      );
    }

    // 2. Vincular el correo al coordinador
    await conn.execute<ResultSetHeader>(
      'UPDATE coordinadores SET correo_usuario = :correo_usuario WHERE id_coordinador = :id',
      { correo_usuario, id: coordinador.id_coordinador },
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  return {
    id_coordinador: coordinador.id_coordinador,
    correo_usuario,
    id_carrera: coordinador.id_carrera,
  };
}

/**
 * Resetea únicamente la contraseña del usuario asociado a un coordinador.
 * Lanza 404 si el usuario no existe.
 */
export async function resetPasswordCoordinador(
  correo: string,
  contrasena: string,
): Promise<void> {
  const hash = await bcrypt.hash(contrasena, 10);
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE usuarios SET contrasena = :hash WHERE correo_usuario = :correo',
    { hash, correo },
  );
  if (result.affectedRows === 0) {
    throw new HttpError(404, 'NOT_FOUND', 'Usuario asociado no encontrado.');
  }
}

/**
 * Asigna (o desasigna con null) una carrera a un coordinador.
 * Reglas:
 *  - Si `id_carrera` no es null, la carrera debe existir en `carreras`.
 *  - Una carrera solo puede estar asignada a un coordinador: si otro ya la tiene,
 *    se lanza 409.
 */
export async function asignarCarrera(
  id: number,
  id_carrera: string | null,
): Promise<Coordinador | null> {
  if (id_carrera) {
    // 1. La carrera debe existir
    const [carreraRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id_carrera FROM carreras WHERE id_carrera = :id_carrera LIMIT 1',
      { id_carrera },
    );
    if (carreraRows.length === 0) {
      throw new HttpError(404, 'NOT_FOUND', 'Carrera no encontrada.');
    }

    // 2. Ningún otro coordinador debe tenerla asignada
    const [ocupada] = await pool.execute<RowDataPacket[]>(
      'SELECT id_coordinador FROM coordinadores WHERE id_carrera = :id_carrera AND id_coordinador <> :id LIMIT 1',
      { id_carrera, id },
    );
    if (ocupada.length > 0) {
      throw new HttpError(409, 'ALREADY_ASSIGNED', 'Esta carrera ya tiene un coordinador asignado.');
    }
  }

  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE coordinadores SET id_carrera = :id_carrera WHERE id_coordinador = :id',
    { id_carrera, id },
  );
  if (result.affectedRows === 0) return null;

  return await findCoordinadorById(id);
}
