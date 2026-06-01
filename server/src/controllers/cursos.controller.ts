import type { Request, Response } from 'express';
import {
  CursoIdParamSchema,
  CreateCursoSchema,
  UpdateCursoSchema,
} from '../schemas/cursos.schema.js';
import * as cursosService from '../services/cursos.service.js';
import { HttpError } from '../middleware/error.js';

/**
 * Controllers del recurso `cursos`.
 * Hacen tres cosas: (1) validan input con zod, (2) llaman al service, (3) responden JSON.
 * No contienen SQL — eso vive en services.
 * NOTA: La PK es compuesta (id_carrera, id_curso).
 */

export async function list(_req: Request, res: Response): Promise<void> {
  const data = await cursosService.listCursos();
  res.json({ data });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const { id_carrera, id_curso } = CursoIdParamSchema.parse(req.params);
  const curso = await cursosService.findCursoById(id_carrera, id_curso);
  if (!curso) {
    throw new HttpError(404, 'NOT_FOUND', `Curso '${id_carrera}/${id_curso}' no encontrado.`);
  }
  res.json({ data: curso });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreateCursoSchema.parse(req.body);

  const existing = await cursosService.findCursoById(input.id_carrera, input.id_curso);
  if (existing) {
    throw new HttpError(409, 'ALREADY_EXISTS', `Ya existe un curso con id '${input.id_carrera}/${input.id_curso}'.`);
  }

  const created = await cursosService.createCurso(input);
  res.status(201).json({ data: created });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id_carrera, id_curso } = CursoIdParamSchema.parse(req.params);
  const input = UpdateCursoSchema.parse(req.body);

  const updated = await cursosService.updateCurso(id_carrera, id_curso, input);
  if (!updated) {
    throw new HttpError(404, 'NOT_FOUND', `Curso '${id_carrera}/${id_curso}' no encontrado.`);
  }
  res.json({ data: updated });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id_carrera, id_curso } = CursoIdParamSchema.parse(req.params);
  const ok = await cursosService.deleteCurso(id_carrera, id_curso);
  if (!ok) {
    throw new HttpError(404, 'NOT_FOUND', `Curso '${id_carrera}/${id_curso}' no encontrado.`);
  }
  res.status(204).send();
}
