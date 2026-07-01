import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireLevel } from '../middleware/auth.js';
import * as pagos from '../controllers/pagos.controller.js';

/**
 * Rutas del recurso `pagos`.
 * Plantilla replicable: copiar este archivo + schema + service + controller para
 * cada tabla del esquema (archivos, capacitaciones, etc.).
 *
 * Endpoints:
 *   GET    /api/v1/pagos       → lista
 *   GET    /api/v1/pagos/:id   → detalle
 *   POST   /api/v1/pagos       → crea
 *   PUT    /api/v1/pagos/:id   → actualiza
 *   DELETE /api/v1/pagos/:id   → borra
 */
const router = Router();

router.get('/', requireAuth, asyncHandler(pagos.list));
router.get('/:id', requireAuth, asyncHandler(pagos.getOne));
router.post('/', requireAuth, requireLevel('admin', 'supervisor', 'coordinador'), asyncHandler(pagos.create));
router.put('/:id', requireAuth, requireLevel('admin', 'supervisor', 'coordinador', 'docente'), asyncHandler(pagos.update));
router.delete('/:id', requireAuth, requireLevel('admin'), asyncHandler(pagos.remove));

export default router;
