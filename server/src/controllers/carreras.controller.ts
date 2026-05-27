import type { Request, Response } from 'express';
import {
  CarreraIdParamSchema,
  CreateCarreraSchema,
  UpdateCarreraSchema,
} from '../schemas/carreras.schema.js';
import * as carrerasService from '../services/carreras.service.js';
import { HttpError } from '../middleware/error.js';

/**
 * Controllers del recurso `carreras`.
 * Hacen tres cosas: (1) validan input con zod, (2) llaman al service, (3) responden JSON.
 * No contienen SQL — eso vive en services.
 */

export async function list(_req: Request, res: Response): Promise<void> {
  const data = await carrerasService.listCarreras();
  res.json({ data });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const { id } = CarreraIdParamSchema.parse(req.params);
  const carrera = await carrerasService.findCarreraById(id);
  if (!carrera) {
    throw new HttpError(404, 'NOT_FOUND', `Carrera '${id}' no encontrada.`);
  }
  res.json({ data: carrera });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreateCarreraSchema.parse(req.body);

  const existing = await carrerasService.findCarreraById(input.id_carrera);
  if (existing) {
    throw new HttpError(409, 'ALREADY_EXISTS', `Ya existe una carrera con id '${input.id_carrera}'.`);
  }

  const created = await carrerasService.createCarrera(input);
  res.status(201).json({ data: created });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = CarreraIdParamSchema.parse(req.params);
  const input = UpdateCarreraSchema.parse(req.body);

  const updated = await carrerasService.updateCarrera(id, input);
  if (!updated) {
    throw new HttpError(404, 'NOT_FOUND', `Carrera '${id}' no encontrada.`);
  }
  res.json({ data: updated });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = CarreraIdParamSchema.parse(req.params);
  const ok = await carrerasService.deleteCarrera(id);
  if (!ok) {
    throw new HttpError(404, 'NOT_FOUND', `Carrera '${id}' no encontrada.`);
  }
  res.status(204).send();
}
