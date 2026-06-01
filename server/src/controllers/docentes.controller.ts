import type { Request, Response } from 'express';
import {
  DocenteIdParamSchema,
  CreateDocenteSchema,
  UpdateDocenteSchema,
} from '../schemas/docentes.schema.js';
import * as docentesService from '../services/docentes.service.js';
import { HttpError } from '../middleware/error.js';

/**
 * Controllers del recurso `docentes`.
 * Hacen tres cosas: (1) validan input con zod, (2) llaman al service, (3) responden JSON.
 * No contienen SQL — eso vive en services.
 */

export async function list(_req: Request, res: Response): Promise<void> {
  const data = await docentesService.listDocentes();
  res.json({ data });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const { id } = DocenteIdParamSchema.parse(req.params);
  const docente = await docentesService.findDocenteById(id);
  if (!docente) {
    throw new HttpError(404, 'NOT_FOUND', `Docente con RUT '${id}' no encontrado.`);
  }
  res.json({ data: docente });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreateDocenteSchema.parse(req.body);

  const existing = await docentesService.findDocenteById(input.rut_docente);
  if (existing) {
    throw new HttpError(409, 'ALREADY_EXISTS', `Ya existe un docente con RUT '${input.rut_docente}'.`);
  }

  const created = await docentesService.createDocente(input);
  res.status(201).json({ data: created });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = DocenteIdParamSchema.parse(req.params);
  const input = UpdateDocenteSchema.parse(req.body);

  const updated = await docentesService.updateDocente(id, input);
  if (!updated) {
    throw new HttpError(404, 'NOT_FOUND', `Docente con RUT '${id}' no encontrado.`);
  }
  res.json({ data: updated });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = DocenteIdParamSchema.parse(req.params);
  const ok = await docentesService.deleteDocente(id);
  if (!ok) {
    throw new HttpError(404, 'NOT_FOUND', `Docente con RUT '${id}' no encontrado.`);
  }
  res.status(204).send();
}
