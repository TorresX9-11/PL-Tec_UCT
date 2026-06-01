import type { Request, Response } from 'express';
import {
  CoordinadorIdParamSchema,
  CreateCoordinadorSchema,
  UpdateCoordinadorSchema,
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

  const existing = await coordinadoresService.findCoordinadorById(input.id_coordinador);
  if (existing) {
    throw new HttpError(409, 'ALREADY_EXISTS', `Ya existe un coordinador con id '${input.id_coordinador}'.`);
  }

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
