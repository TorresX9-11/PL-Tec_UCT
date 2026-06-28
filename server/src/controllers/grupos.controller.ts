import type { Request, Response } from 'express';
import {
  GrupoIdParamSchema,
  CreateGrupoSchema,
  UpdateGrupoSchema,
} from '../schemas/grupos.schema.js';
import * as gruposService from '../services/grupos.service.js';
import { registrarEvento } from '../services/historial.service.js';
import { HttpError } from '../middleware/error.js';

/**
 * Controllers del recurso `grupos`.
 * Hacen tres cosas: (1) validan input con zod, (2) llaman al service, (3) responden JSON.
 * No contienen SQL — eso vive en services.
 */

export async function list(_req: Request, res: Response): Promise<void> {
  const data = await gruposService.listGrupos();
  res.json({ data });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const { id } = GrupoIdParamSchema.parse(req.params);
  const grupo = await gruposService.findGrupoById(id);
  if (!grupo) {
    throw new HttpError(404, 'NOT_FOUND', `Grupo '${id}' no encontrado.`);
  }
  res.json({ data: grupo });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreateGrupoSchema.parse(req.body);

  const created = await gruposService.createGrupo(input);

  await registrarEvento({
    tipo: 'Designación',
    modulo: 'Admin',
    actor: 'Administrador',
    rut_docente: input.rut_docente || null,
    descripcion: `Se creó y asignó horas a la sección ${input.seccion} del curso ${input.id_curso}`,
    estado: 'Completado'
  });

  res.status(201).json({ data: created });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = GrupoIdParamSchema.parse(req.params);
  const input = UpdateGrupoSchema.parse(req.body);

  const updated = await gruposService.updateGrupo(id, input);
  if (!updated) {
    throw new HttpError(404, 'NOT_FOUND', `Grupo '${id}' no encontrado.`);
  }

  await registrarEvento({
    tipo: 'Designación',
    modulo: 'Admin',
    actor: 'Administrador',
    rut_docente: input.rut_docente || null,
    descripcion: `Se actualizaron las horas PMA o el docente de la sección ${updated.seccion} del curso ${updated.id_curso}`,
    estado: 'Actualizado'
  });

  res.json({ data: updated });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = GrupoIdParamSchema.parse(req.params);
  const ok = await gruposService.deleteGrupo(id);
  if (!ok) {
    throw new HttpError(404, 'NOT_FOUND', `Grupo '${id}' no encontrado.`);
  }

  await registrarEvento({
    tipo: 'Designación',
    modulo: 'Admin',
    actor: 'Administrador',
    descripcion: `Se eliminó la designación/sección (ID: ${id})`,
    estado: 'Eliminado'
  });

  res.status(204).send();
}
