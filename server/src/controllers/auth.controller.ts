import type { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { LoginSchema, ChangePasswordSchema } from '../schemas/auth.schema.js';
import { signToken } from '../middleware/auth.js';
import { HttpError } from '../middleware/error.js';
import bcrypt from 'bcryptjs';

/**
 * Controllers para autenticación.
 */

export async function login(req: Request, res: Response): Promise<void> {
  const { correo_usuario, contrasena } = LoginSchema.parse(req.body);

  // Buscar usuario en la base de datos
  const [rows] = await pool.execute<any[]>(
    'SELECT correo_usuario, nombre, contrasena, nivel, debe_cambiar_pass FROM usuarios WHERE correo_usuario = :correo_usuario LIMIT 1',
    { correo_usuario },
  );

  const user = rows[0];
  if (!user) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas.');
  }

  // Verificar contraseña con bcrypt
  // Si la contraseña no tiene el formato de bcrypt (texto plano antiguo), hacer comparación directa
  let passwordMatch = false;
  if (user.contrasena.length >= 60 && user.contrasena.startsWith('$2')) {
    // Es un hash bcrypt
    passwordMatch = await bcrypt.compare(contrasena, user.contrasena);
  } else {
    // Es texto plano antiguo (migración en progreso)
    passwordMatch = contrasena === user.contrasena;
  }

  if (!passwordMatch) {
    throw new HttpError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas.');
  }

  // Obtener datos específicos según el rol
  let id_carrera: string | undefined;
  let rut_docente: number | undefined;

  if (user.nivel === 'coordinador') {
    const [coordRows] = await pool.execute<any[]>(
      'SELECT id_carrera FROM coordinadores WHERE correo_usuario = :correo_usuario LIMIT 1',
      { correo_usuario: user.correo_usuario }
    );
    if (coordRows.length > 0) {
      id_carrera = coordRows[0].id_carrera;
    }
  } else if (user.nivel === 'docente') {
    const [docRows] = await pool.execute<any[]>(
      'SELECT rut_docente FROM docentes WHERE correo_usuario = :correo_usuario LIMIT 1',
      { correo_usuario: user.correo_usuario }
    );
    if (docRows.length > 0) {
      rut_docente = docRows[0].rut_docente;
    }
  }

  const requiresPasswordChange = Boolean(user.debe_cambiar_pass);

  // Generar token JWT
  const token = signToken({
    correo: user.correo_usuario,
    nivel: user.nivel,
    id_carrera,
    rut_docente,
    requiresPasswordChange
  });

  res.json({
    token,
    user: {
      correo: user.correo_usuario,
      nivel: user.nivel,
      nombre: user.nombre,
      id_carrera,
      rut_docente,
      requiresPasswordChange
    },
  });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const { newPassword } = ChangePasswordSchema.parse(req.body);
  const authUser = req.user;
  
  if (!authUser) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Sesión requerida.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const [result] = await pool.execute<any>(
    'UPDATE usuarios SET contrasena = :contrasena, debe_cambiar_pass = 0 WHERE correo_usuario = :correo',
    { contrasena: hashedPassword, correo: authUser.correo }
  );

  if (result.affectedRows === 0) {
    throw new HttpError(404, 'NOT_FOUND', 'Usuario no encontrado.');
  }

  // Firmar nuevo token sin la restricción y sin los tiempos de expiración anteriores
  const { iat, exp, ...cleanUser } = authUser as any;
  const token = signToken({
    ...cleanUser,
    requiresPasswordChange: false
  });

  res.json({
    token,
    message: 'Contraseña actualizada correctamente.',
    requiresPasswordChange: false
  });
}
