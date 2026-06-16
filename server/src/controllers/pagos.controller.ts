import type { Request, Response } from 'express';
import {
  PagoIdParamSchema,
  CreatePagoSchema,
  UpdatePagoSchema,
} from '../schemas/pagos.schema.js';
import * as pagosService from '../services/pagos.service.js';
import { HttpError } from '../middleware/error.js';

/**
 * Controllers del recurso `pagos`.
 * Hacen tres cosas: (1) validan input con zod, (2) llaman al service, (3) responden JSON.
 * No contienen SQL — eso vive en services.
 */

export async function list(_req: Request, res: Response): Promise<void> {
  const data = await pagosService.listPagos();
  res.json({ data });
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const { id } = PagoIdParamSchema.parse(req.params);
  const pago = await pagosService.findPagoById(id);
  if (!pago) {
    throw new HttpError(404, 'NOT_FOUND', `Pago '${id}' no encontrado.`);
  }
  res.json({ data: pago });
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreatePagoSchema.parse(req.body);

  const created = await pagosService.createPago(input);
  res.status(201).json({ data: created });
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = PagoIdParamSchema.parse(req.params);
  const input = UpdatePagoSchema.parse(req.body);

  const updated = await pagosService.updatePago(id, input);
  if (!updated) {
    throw new HttpError(404, 'NOT_FOUND', `Pago '${id}' no encontrado.`);
  }
  res.json({ data: updated });
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = PagoIdParamSchema.parse(req.params);
  const ok = await pagosService.deletePago(id);
  if (!ok) {
    throw new HttpError(404, 'NOT_FOUND', `Pago '${id}' no encontrado.`);
  }
  res.status(204).send();
}
