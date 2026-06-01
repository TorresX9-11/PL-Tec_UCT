import type { Request, Response } from 'express';
import {
  CapacitacionIdParamSchema,
  CreateCapacitacionSchema,
  UpdateCapacitacionSchema,
} from '../schemas/capacitaciones.schema.js';
import * as capacitacionesService from '../services/capacitaciones.service.js';
import { HttpError } from '../middleware/error.js';

/**
 * Controllers del recurso `capacitaciones`.
 * Hacen tres cosas: (1) validan input con zod, (2) llaman al service, (3) responden JSON.
 * No contienen SQL — eso vive en services.
 */

export async function list(_req: Request, res: Response): Promise<void> {
  const data = await capacitacionesService.listCapacitaciones();
  res.json({ data });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const { id } = CapacitacionIdParamSchema.parse(req.params);
  const capacitacion = await capacitacionesService.findCapacitacionById(id);
  if (!capacitacion) {
    throw new HttpError(404, 'NOT_FOUND', `Capacitación '${id}' no encontrada.`);
  }
  res.json({ data: capacitacion });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreateCapacitacionSchema.parse(req.body);

  const existing = await capacitacionesService.findCapacitacionById(input.id_capacitacion);
  if (existing) {
    throw new HttpError(409, 'ALREADY_EXISTS', `Ya existe una capacitación con id '${input.id_capacitacion}'.`);
  }

  const created = await capacitacionesService.createCapacitacion(input);
  res.status(201).json({ data: created });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = CapacitacionIdParamSchema.parse(req.params);
  const input = UpdateCapacitacionSchema.parse(req.body);

  const updated = await capacitacionesService.updateCapacitacion(id, input);
  if (!updated) {
    throw new HttpError(404, 'NOT_FOUND', `Capacitación '${id}' no encontrada.`);
  }
  res.json({ data: updated });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = CapacitacionIdParamSchema.parse(req.params);
  const ok = await capacitacionesService.deleteCapacitacion(id);
  if (!ok) {
    throw new HttpError(404, 'NOT_FOUND', `Capacitación '${id}' no encontrada.`);
  }
  res.status(204).send();
}
