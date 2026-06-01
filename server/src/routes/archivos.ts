import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as archivos from '../controllers/archivos.controller.js';

/**
 * Rutas del recurso `archivos`.
 * Plantilla replicable: copiar este archivo + schema + service + controller para
 * cada tabla del esquema (capacitaciones, coordinadores, etc.).
 *
 * Endpoints:
 *   GET    /api/v1/archivos       → lista
 *   GET    /api/v1/archivos/:id   → detalle
 *   POST   /api/v1/archivos       → crea
 *   PUT    /api/v1/archivos/:id   → actualiza
 *   DELETE /api/v1/archivos/:id   → borra
 */
const router = Router();

router.get('/', asyncHandler(archivos.list));
router.get('/:id', asyncHandler(archivos.getOne));
router.post('/', requireAuth, asyncHandler(archivos.create));
router.put('/:id', requireAuth, asyncHandler(archivos.update));
router.delete('/:id', requireAuth, asyncHandler(archivos.remove));

export default router;
