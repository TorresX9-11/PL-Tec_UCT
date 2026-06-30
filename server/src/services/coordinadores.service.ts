import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db.js';
import type {
  Coordinador,
  CreateCoordinadorInput,
  UpdateCoordinadorInput,
} from '../schemas/coordinadores.schema.js';
import bcrypt from 'bcryptjs';

type CoordinadorRow = Coordinador & RowDataPacket;

export async function listCoordinadores(): Promise<Coordinador[]> {
  const [rows] = await pool.execute<CoordinadorRow[]>(
    'SELECT id_coordinador, correo_usuario, id_carrera, nombre, rut FROM coordinadores ORDER BY nombre ASC',
  );
  return rows.map(({ id_coordinador, correo_usuario, id_carrera, nombre, rut }) => ({
    id_coordinador,
    correo_usuario,
    id_carrera,
    nombre,
    rut
  }));
}

export async function findCoordinadorById(id: number): Promise<Coordinador | null> {
  const [rows] = await pool.execute<CoordinadorRow[]>(
    'SELECT id_coordinador, correo_usuario, id_carrera, nombre, rut FROM coordinadores WHERE id_coordinador = :id LIMIT 1',
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return {
    id_coordinador: row.id_coordinador,
    correo_usuario: row.correo_usuario,
    id_carrera: row.id_carrera,
    nombre: row.nombre,
    rut: row.rut
  };
}

export async function createCoordinador(input: CreateCoordinadorInput): Promise<Coordinador> {
  // Transacción para crear usuario y coordinador atómicamente
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Crear el usuario (contraseña inicial = RUT sin DV)
    const rutSinDV = input.rut.split('-')[0].replace(/\./g, '');
    const hashedPassword = await bcrypt.hash(rutSinDV, 10);

    await connection.execute(
      'INSERT INTO usuarios (correo_usuario, nombre, contrasena, nivel, debe_cambiar_pass) VALUES (:correo_usuario, :nombre, :contrasena, :nivel, :debe_cambiar_pass)',
      {
        correo_usuario: input.correo_usuario,
        nombre: input.nombre,
        contrasena: hashedPassword,
        nivel: 'coordinador',
        debe_cambiar_pass: 1
      }
    );

    // 2. Crear el coordinador
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO coordinadores (correo_usuario, id_carrera, nombre, rut) VALUES (:correo_usuario, :id_carrera, :nombre, :rut)',
      {
        correo_usuario: input.correo_usuario,
        id_carrera: input.id_carrera ?? null,
        nombre: input.nombre,
        rut: input.rut
      }
    );

    await connection.commit();
    
    return {
      id_coordinador: result.insertId,
      correo_usuario: input.correo_usuario,
      id_carrera: input.id_carrera ?? null,
      nombre: input.nombre,
      rut: input.rut
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function updateCoordinador(
  id: number,
  input: UpdateCoordinadorInput,
): Promise<Coordinador | null> {
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
  if (input.nombre !== undefined) {
    updates.push('nombre = :nombre');
    params.nombre = input.nombre;
  }
  if (input.rut !== undefined) {
    updates.push('rut = :rut');
    params.rut = input.rut;
  }

  if (updates.length === 0) {
    return await findCoordinadorById(id);
  }

  const query = `UPDATE coordinadores SET ${updates.join(', ')} WHERE id_coordinador = :id`;
  const [result] = await pool.execute<ResultSetHeader>(query, params);

  if (result.affectedRows === 0) return null;

  return await findCoordinadorById(id);
}

export async function deleteCoordinador(id: number): Promise<boolean> {
  const coord = await findCoordinadorById(id);
  if (!coord) return false;

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Eliminar coordinador
    const [result] = await connection.execute<ResultSetHeader>(
      'DELETE FROM coordinadores WHERE id_coordinador = :id',
      { id },
    );
    
    // 2. Eliminar usuario asociado si existe
    if (coord.correo_usuario) {
      await connection.execute(
        'DELETE FROM usuarios WHERE correo_usuario = :correo',
        { correo: coord.correo_usuario }
      );
    }

    await connection.commit();
    return result.affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
