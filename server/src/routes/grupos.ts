import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireLevel } from '../middleware/auth.js';
import * as grupos from '../controllers/grupos.controller.js';

/**
 * Rutas del recurso `grupos`.
 * Plantilla replicable: copiar este archivo + schema + service + controller para
 * cada tabla del esquema (propuestas, pagos, etc.).
 *
 * Endpoints:
 *   GET    /api/v1/grupos       → lista
 *   GET    /api/v1/grupos/:id   → detalle
 *   POST   /api/v1/grupos       → crea
 *   PUT    /api/v1/grupos/:id   → actualiza
 *   DELETE /api/v1/grupos/:id   → borra
 */
const router = Router();

router.get('/', requireAuth, asyncHandler(grupos.list));
router.get('/:id', requireAuth, asyncHandler(grupos.getOne));
router.post('/', requireAuth, requireLevel('admin', 'coordinador'), asyncHandler(grupos.create));
router.put('/:id', requireAuth, requireLevel('admin', 'coordinador'), asyncHandler(grupos.update));
router.delete('/:id', requireAuth, requireLevel('admin'), asyncHandler(grupos.remove));

export default router;
