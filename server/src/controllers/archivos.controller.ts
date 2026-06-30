import type { Request, Response } from 'express';
import {
  ArchivoIdParamSchema,
  CreateArchivoSchema,
  UpdateArchivoSchema,
} from '../schemas/archivos.schema.js';
import * as archivosService from '../services/archivos.service.js';
import { HttpError } from '../middleware/error.js';
import fs from 'fs';
import path from 'path';

const uploadsBoletasDir = path.join(process.cwd(), 'public', 'uploads', 'boletas');
if (!fs.existsSync(uploadsBoletasDir)) {
  fs.mkdirSync(uploadsBoletasDir, { recursive: true });
}

/**
 * Controllers del recurso `archivos`.
 * Hacen tres cosas: (1) validan input con zod, (2) llaman al service, (3) responden JSON.
 * No contienen SQL — eso vive en services.
 */

export async function list(_req: Request, res: Response): Promise<void> {
  const data = await archivosService.listArchivos();
  res.json({ data });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const { id } = ArchivoIdParamSchema.parse(req.params);
  const archivo = await archivosService.findArchivoById(id);
  if (!archivo) {
    throw new HttpError(404, 'NOT_FOUND', `Archivo '${id}' no encontrado.`);
  }
  res.json({ data: archivo });
}

import { registrarEvento } from '../services/historial.service.js';

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreateArchivoSchema.parse(req.body);

  const created = await archivosService.createArchivo(input);
  
  try {
    await registrarEvento({
      tipo: 'Boleta',
      modulo: 'Archivos',
      actor: 'Sistema',
      descripcion: `Se ha subido un nuevo archivo: ${created.ruta.split('/').pop()}`,
      estado: 'Subida'
    });
  } catch (e) {
    console.error('Error logueando historial', e);
  }

  res.status(201).json({ data: created });
}

export async function uploadFisico(req: Request, res: Response): Promise<void> {
  const file = req.file;
  if (!file) {
    throw new HttpError(400, 'BAD_REQUEST', 'No se subió ningún archivo.');
  }
  
  const rutaBase = req.body.ruta ? req.body.ruta : `uploads/boletas/${file.filename}`;
  const input = {
    correo_usuario: req.body.correo_usuario || null,
    ruta: rutaBase, // Using the relative path requested or fallback
  };

  const created = await archivosService.createArchivo(input);
  
  try {
    await registrarEvento({
      tipo: 'Boleta',
      modulo: 'Archivos',
      actor: 'Sistema',
      descripcion: `Se ha subido un nuevo archivo físico: ${file.filename}`,
      estado: 'Subida'
    });
  } catch (e) {
    console.error('Error logueando historial', e);
  }

  res.status(201).json({ data: created });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = ArchivoIdParamSchema.parse(req.params);
  const input = UpdateArchivoSchema.parse(req.body);

  const updated = await archivosService.updateArchivo(id, input);
  if (!updated) {
    throw new HttpError(404, 'NOT_FOUND', `Archivo '${id}' no encontrado.`);
  }
  res.json({ data: updated });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = ArchivoIdParamSchema.parse(req.params);
  const ok = await archivosService.deleteArchivo(id);
  if (!ok) {
    throw new HttpError(404, 'NOT_FOUND', `Archivo '${id}' no encontrado.`);
  }
  res.status(204).send();
}
