import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as carreras from '../controllers/carreras.controller.js';

/**
 * Rutas del recurso `carreras`.
 * Plantilla replicable: copiar este archivo + schema + service + controller para
 * cada tabla del esquema (cursos, docentes, propuestas, etc.).
 *
 * Endpoints:
 *   GET    /api/v1/carreras       → lista
 *   GET    /api/v1/carreras/:id   → detalle
 *   POST   /api/v1/carreras       → crea
 *   PUT    /api/v1/carreras/:id   → actualiza
 *   DELETE /api/v1/carreras/:id   → borra
 */
const router = Router();

router.get('/', asyncHandler(carreras.list));
router.get('/:id', asyncHandler(carreras.getOne));
router.post('/', asyncHandler(carreras.create));
router.put('/:id', asyncHandler(carreras.update));
router.delete('/:id', asyncHandler(carreras.remove));

export default router;
