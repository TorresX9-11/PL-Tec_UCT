import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db.js';
import type {
  Docente,
  CreateDocenteInput,
  UpdateDocenteInput,
} from '../schemas/docentes.schema.js';

/**
 * Capa de acceso a datos para `docentes`.
 * Toda consulta usa prepared statements (`pool.execute`) — evita SQL injection.
 */

type DocenteRow = Docente & RowDataPacket;

export async function listDocentes(): Promise<Docente[]> {
  const [rows] = await pool.execute<DocenteRow[]>(
    'SELECT rut_docente, dv, correo_usuario, contacto, nombre, nivel_docente, fecha_ingreso FROM docentes ORDER BY rut_docente ASC',
  );
  return rows.map(({ rut_docente, dv, correo_usuario, contacto, nombre, nivel_docente, fecha_ingreso }) => ({
    rut_docente,
    dv,
    correo_usuario,
    contacto,
    nombre,
    nivel_docente,
    fecha_ingreso,
  }));
}

export async function findDocenteById(id: number): Promise<Docente | null> {
  const [rows] = await pool.execute<DocenteRow[]>(
    'SELECT rut_docente, dv, correo_usuario, contacto, nombre, nivel_docente, fecha_ingreso FROM docentes WHERE rut_docente = :id LIMIT 1',
    { id },
  );
  const row = rows[0];
  if (!row) return null;
  return {
    rut_docente: row.rut_docente,
    dv: row.dv,
    correo_usuario: row.correo_usuario,
    contacto: row.contacto,
    nombre: row.nombre,
    nivel_docente: row.nivel_docente,
    fecha_ingreso: row.fecha_ingreso,
  };
}

export async function createDocente(input: CreateDocenteInput): Promise<Docente> {
  const dbInput = {
    ...input,
    correo_usuario: input.correo_usuario ?? null,
    contacto: input.contacto ?? null,
    nivel_docente: input.nivel_docente ?? null,
    fecha_ingreso: input.fecha_ingreso ?? null,
  };

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    if (dbInput.correo_usuario) {
      // 1. Crear usuario (contraseña inicial = RUT sin DV)
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.default.hash(dbInput.rut_docente.toString(), 10);
      
      await connection.execute(
        'INSERT IGNORE INTO usuarios (correo_usuario, nombre, contrasena, nivel, debe_cambiar_pass) VALUES (:correo, :nombre, :pass, :nivel, :debe)',
        {
          correo: dbInput.correo_usuario,
          nombre: dbInput.nombre,
          pass: hashedPassword,
          nivel: 'docente',
          debe: 1
        }
      );
    }

    // 2. Crear docente
    await connection.execute(
      'INSERT INTO docentes (rut_docente, dv, correo_usuario, contacto, nombre, nivel_docente, fecha_ingreso) VALUES (:rut_docente, :dv, :correo_usuario, :contacto, :nombre, :nivel_docente, :fecha_ingreso)',
      dbInput,
    );
    
    await connection.commit();
    return dbInput as Docente;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function updateDocente(
  id: number,
  input: UpdateDocenteInput,
): Promise<Docente | null> {
  // Construir query dinámica solo con campos proporcionados
  const updates: string[] = [];
  const params: Record<string, string | number | null> = { id };

  if (input.dv !== undefined) {
    updates.push('dv = :dv');
    params.dv = input.dv;
  }
  if (input.correo_usuario !== undefined) {
    updates.push('correo_usuario = :correo_usuario');
    params.correo_usuario = input.correo_usuario;
  }
  if (input.contacto !== undefined) {
    updates.push('contacto = :contacto');
    params.contacto = input.contacto;
  }
  if (input.nombre !== undefined) {
    updates.push('nombre = :nombre');
    params.nombre = input.nombre;
  }
  if (input.nivel_docente !== undefined) {
    updates.push('nivel_docente = :nivel_docente');
    params.nivel_docente = input.nivel_docente;
  }
  if (input.fecha_ingreso !== undefined) {
    updates.push('fecha_ingreso = :fecha_ingreso');
    params.fecha_ingreso = input.fecha_ingreso;
  }

  if (updates.length === 0) {
    // Si no hay campos para actualizar, retornar el docente existente
    return await findDocenteById(id);
  }

  const query = `UPDATE docentes SET ${updates.join(', ')} WHERE rut_docente = :id`;
  const [result] = await pool.execute<ResultSetHeader>(query, params);

  if (result.affectedRows === 0) return null;

  // Retornar docente actualizado
  return await findDocenteById(id);
}

export async function deleteDocente(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM docentes WHERE rut_docente = :id',
    { id },
  );
  return result.affectedRows > 0;
}
