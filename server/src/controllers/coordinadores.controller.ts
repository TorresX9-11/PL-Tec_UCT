import type { Request, Response } from 'express';
import * as service from '../services/coordinadores.service.js';
import { CreateCoordinadorSchema, UpdateCoordinadorSchema } from '../schemas/coordinadores.schema.js';
import { HttpError } from '../middleware/error.js';

export async function list(req: Request, res: Response): Promise<void> {
  const data = await service.listCoordinadores();
  res.json({ data });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreateCoordinadorSchema.parse(req.body);
  const newCoord = await service.createCoordinador(input);
  res.status(201).json({ data: newCoord });
}

export async function update(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new HttpError(400, 'BAD_REQUEST', 'ID inválido');
  
  const input = UpdateCoordinadorSchema.parse(req.body);
  const updated = await service.updateCoordinador(id, input);
  
  if (!updated) {
    throw new HttpError(404, 'NOT_FOUND', 'Coordinador no encontrado');
  }
  res.json({ data: updated });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new HttpError(400, 'BAD_REQUEST', 'ID inválido');

  const success = await service.deleteCoordinador(id);
  if (!success) {
    throw new HttpError(404, 'NOT_FOUND', 'Coordinador no encontrado');
  }
  res.status(204).send();
}
