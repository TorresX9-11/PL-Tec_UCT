import type { Request, Response } from 'express';
import {
  CoordinadorIdParamSchema,
  CreateCoordinadorSchema,
  UpdateCoordinadorSchema,
  GestionarCredencialesSchema,
  ResetPasswordSchema,
  AsignarCarreraSchema,
} from '../schemas/coordinadores.schema.js';
import * as coordinadoresService from '../services/coordinadores.service.js';
import { HttpError } from '../middleware/error.js';

/**
 * Controllers del recurso `coordinadores`.
 * Hacen tres cosas: (1) validan input con zod, (2) llaman al service, (3) responden JSON.
 * No contienen SQL — eso vive en services.
 */

export async function list(_req: Request, res: Response): Promise<void> {
  const data = await coordinadoresService.listCoordinadores();
  res.json({ data });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const { id } = CoordinadorIdParamSchema.parse(req.params);
  const coordinador = await coordinadoresService.findCoordinadorById(id);
  if (!coordinador) {
    throw new HttpError(404, 'NOT_FOUND', `Coordinador con id '${id}' no encontrado.`);
  }
  res.json({ data: coordinador });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreateCoordinadorSchema.parse(req.body);

  const created = await coordinadoresService.createCoordinador(input);
  res.status(201).json({ data: created });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = CoordinadorIdParamSchema.parse(req.params);
  const input = UpdateCoordinadorSchema.parse(req.body);

  const updated = await coordinadoresService.updateCoordinador(id, input);
  if (!updated) {
    throw new HttpError(404, 'NOT_FOUND', `Coordinador con id '${id}' no encontrado.`);
  }
  res.json({ data: updated });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = CoordinadorIdParamSchema.parse(req.params);
  const ok = await coordinadoresService.deleteCoordinador(id);
  if (!ok) {
    throw new HttpError(404, 'NOT_FOUND', `Coordinador con id '${id}' no encontrado.`);
  }
  res.status(204).send();
}

/**
 * Crea o actualiza el usuario asociado (nivel 'coordinador') del coordinador
 * en una sola transacción. Solo admin.
 */
export async function gestionarCredenciales(req: Request, res: Response): Promise<void> {
  const { id } = CoordinadorIdParamSchema.parse(req.params);
  const input = GestionarCredencialesSchema.parse(req.body);

  const coordinador = await coordinadoresService.findCoordinadorById(id);
  if (!coordinador) {
    throw new HttpError(404, 'NOT_FOUND', `Coordinador con id '${id}' no encontrado.`);
  }

  const result = await coordinadoresService.gestionarCredenciales(coordinador, input);
  res.json({ data: result });
}

/**
 * Resetea únicamente la contraseña del usuario asociado. Solo admin.
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { id } = CoordinadorIdParamSchema.parse(req.params);
  const { contrasena } = ResetPasswordSchema.parse(req.body);

  const coordinador = await coordinadoresService.findCoordinadorById(id);
  if (!coordinador || !coordinador.correo_usuario) {
    throw new HttpError(404, 'NOT_FOUND', 'Coordinador no encontrado o sin usuario asociado.');
  }

  await coordinadoresService.resetPasswordCoordinador(coordinador.correo_usuario, contrasena);
  res.json({ message: 'Contraseña actualizada correctamente.' });
}

/**
 * Asigna o desasigna (null) una carrera al coordinador. Solo admin.
 * Valida que la carrera exista y que no esté tomada por otro coordinador.
 */
export async function asignarCarrera(req: Request, res: Response): Promise<void> {
  const { id } = CoordinadorIdParamSchema.parse(req.params);
  const { id_carrera } = AsignarCarreraSchema.parse(req.body);

  const coordinador = await coordinadoresService.findCoordinadorById(id);
  if (!coordinador) {
    throw new HttpError(404, 'NOT_FOUND', `Coordinador con id '${id}' no encontrado.`);
  }

  const updated = await coordinadoresService.asignarCarrera(id, id_carrera);
  res.json({ data: updated });
}
