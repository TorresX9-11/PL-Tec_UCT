import type { Request, Response } from 'express';
import {
  PropuestaIdParamSchema,
  CreatePropuestaSchema,
  UpdatePropuestaSchema,
} from '../schemas/propuestas.schema.js';
import * as propuestasService from '../services/propuestas.service.js';
import { HttpError } from '../middleware/error.js';

/**
 * Controllers del recurso `propuestas`.
 * Hacen tres cosas: (1) validan input con zod, (2) llaman al service, (3) responden JSON.
 * No contienen SQL — eso vive en services.
 */

export async function list(_req: Request, res: Response): Promise<void> {
  const data = await propuestasService.listPropuestas();
  res.json({ data });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const { id } = PropuestaIdParamSchema.parse(req.params);
  const propuesta = await propuestasService.findPropuestaById(id);
  if (!propuesta) {
    throw new HttpError(404, 'NOT_FOUND', `Propuesta '${id}' no encontrada.`);
  }
  res.json({ data: propuesta });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreatePropuestaSchema.parse(req.body);

  const existing = await propuestasService.findPropuestaById(input.id_propuesta);
  if (existing) {
    throw new HttpError(409, 'ALREADY_EXISTS', `Ya existe una propuesta con id '${input.id_propuesta}'.`);
  }

  const created = await propuestasService.createPropuesta(input);
  res.status(201).json({ data: created });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = PropuestaIdParamSchema.parse(req.params);
  const input = UpdatePropuestaSchema.parse(req.body);

  const updated = await propuestasService.updatePropuesta(id, input);
  if (!updated) {
    throw new HttpError(404, 'NOT_FOUND', `Propuesta '${id}' no encontrada.`);
  }
  res.json({ data: updated });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = PropuestaIdParamSchema.parse(req.params);
  const ok = await propuestasService.deletePropuesta(id);
  if (!ok) {
    throw new HttpError(404, 'NOT_FOUND', `Propuesta '${id}' no encontrada.`);
  }
  res.status(204).send();
}
