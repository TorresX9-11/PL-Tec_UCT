import type { Request, Response } from 'express';
import {
  UsuarioIdParamSchema,
  CreateUsuarioSchema,
  UpdateUsuarioSchema,
} from '../schemas/usuarios.schema.js';
import * as usuariosService from '../services/usuarios.service.js';
import { HttpError } from '../middleware/error.js';
import bcrypt from 'bcryptjs';

/**
 * Controllers del recurso `usuarios`.
 * Hacen tres cosas: (1) validan input con zod, (2) llaman al service, (3) responden JSON.
 * No contienen SQL — eso vive en services.
 */

export async function list(req: Request, res: Response): Promise<void> {
  let data = await usuariosService.listUsuarios();
  if (req.user?.nivel === 'admin') {
    data = data.filter((u) => u.nivel === 'docente' || u.nivel === 'admin');
  }
  res.json({ data });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const { id } = UsuarioIdParamSchema.parse(req.params);
  const usuario = await usuariosService.findUsuarioById(id);
  if (!usuario) {
    throw new HttpError(404, 'NOT_FOUND', `Usuario '${id}' no encontrado.`);
  }

  if (req.user?.nivel === 'admin' && usuario.nivel !== 'docente' && usuario.nivel !== 'admin') {
    throw new HttpError(403, 'FORBIDDEN', 'No tienes permiso para ver este usuario.');
  }

  res.json({ data: usuario });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreateUsuarioSchema.parse(req.body);

  const existing = await usuariosService.findUsuarioById(input.correo_usuario);
  if (existing) {
    throw new HttpError(409, 'ALREADY_EXISTS', `Ya existe un usuario con correo '${input.correo_usuario}'.`);
  }

  if (req.user?.nivel === 'admin' && input.nivel !== 'docente' && input.nivel !== 'admin') {
    throw new HttpError(403, 'FORBIDDEN', 'Un administrador solo puede crear docentes o administradores.');
  }

  // Hashear contraseña con bcrypt antes de guardar
  const hashedPassword = await bcrypt.hash(input.contrasena, 10);
  const inputWithHash = { ...input, contrasena: hashedPassword };

  const created = await usuariosService.createUsuario(inputWithHash);
  res.status(201).json({ data: created });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = UsuarioIdParamSchema.parse(req.params);
  const input = UpdateUsuarioSchema.parse(req.body);

  // Si se envía una nueva contraseña, hashearla
  let inputWithHash = input;
  if (input.contrasena) {
    const hashedPassword = await bcrypt.hash(input.contrasena, 10);
    inputWithHash = { ...input, contrasena: hashedPassword };
  }

  const existingUser = await usuariosService.findUsuarioById(id);
  if (!existingUser) {
    throw new HttpError(404, 'NOT_FOUND', `Usuario '${id}' no encontrado.`);
  }

  if (req.user?.nivel === 'admin') {
    if (existingUser.nivel !== 'docente' && existingUser.nivel !== 'admin') {
      throw new HttpError(403, 'FORBIDDEN', 'No tienes permiso para editar a este usuario.');
    }
    if (input.nivel && input.nivel !== 'docente' && input.nivel !== 'admin') {
      throw new HttpError(403, 'FORBIDDEN', 'No puedes cambiar el rol a un nivel superior.');
    }
  }

  const updated = await usuariosService.updateUsuario(id, inputWithHash);
  if (!updated) {
    throw new HttpError(404, 'NOT_FOUND', `Usuario '${id}' no encontrado.`);
  }
  res.json({ data: updated });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = UsuarioIdParamSchema.parse(req.params);

  const existingUser = await usuariosService.findUsuarioById(id);
  if (!existingUser) {
    throw new HttpError(404, 'NOT_FOUND', `Usuario '${id}' no encontrado.`);
  }

  if (req.user?.nivel === 'admin' && existingUser.nivel !== 'docente' && existingUser.nivel !== 'admin') {
    throw new HttpError(403, 'FORBIDDEN', 'No tienes permiso para eliminar a este usuario.');
  }

  const ok = await usuariosService.deleteUsuario(id);
  if (!ok) {
    throw new HttpError(404, 'NOT_FOUND', `Usuario '${id}' no encontrado.`);
  }
  res.status(204).send();
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { id } = UsuarioIdParamSchema.parse(req.params);

  const existingUser = await usuariosService.findUsuarioById(id);
  if (!existingUser) {
    throw new HttpError(404, 'NOT_FOUND', `Usuario '${id}' no encontrado.`);
  }

  if (req.user?.nivel === 'admin' && existingUser.nivel !== 'docente' && existingUser.nivel !== 'admin') {
    throw new HttpError(403, 'FORBIDDEN', 'No tienes permiso para restablecer la contraseña a este usuario.');
  }

  // Establecer contraseña genérica y forzar cambio
  const defaultPassword = 'Uct2026!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  
  await usuariosService.updateUsuario(id, {
    contrasena: hashedPassword,
    debe_cambiar_pass: true
  });

  res.json({ message: 'Contraseña restablecida exitosamente.' });
}
