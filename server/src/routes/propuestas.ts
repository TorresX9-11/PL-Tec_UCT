import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireLevel } from '../middleware/auth.js';
import * as propuestas from '../controllers/propuestas.controller.js';

/**
 * Rutas del recurso `propuestas`.
 * Plantilla replicable: copiar este archivo + schema + service + controller para
 * cada tabla del esquema (pagos, archivos, etc.).
 *
 * Endpoints:
 *   GET    /api/v1/propuestas       → lista
 *   GET    /api/v1/propuestas/:id   → detalle
 *   POST   /api/v1/propuestas       → crea
 *   PUT    /api/v1/propuestas/:id   → actualiza
 *   DELETE /api/v1/propuestas/:id   → borra
 */
const router = Router();

router.get('/', requireAuth, asyncHandler(propuestas.list));
router.get('/:id', requireAuth, asyncHandler(propuestas.getOne));
router.post('/', requireAuth, requireLevel('admin', 'coordinador'), asyncHandler(propuestas.create));
router.put('/:id', requireAuth, requireLevel('admin', 'coordinador'), asyncHandler(propuestas.update));
router.delete('/:id', requireAuth, requireLevel('admin'), asyncHandler(propuestas.remove));

export default router;
