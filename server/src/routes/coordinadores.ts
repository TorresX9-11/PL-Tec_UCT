import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as coordinadores from '../controllers/coordinadores.controller.js';

/**
 * Rutas del recurso `coordinadores`.
 * Endpoints:
 *   GET    /api/v1/coordinadores       → lista (público)
 *   GET    /api/v1/coordinadores/:id   → detalle (público)
 *   POST   /api/v1/coordinadores       → crea (cualquier usuario autenticado)
 *   PUT    /api/v1/coordinadores/:id   → actualiza (cualquier usuario autenticado)
 *   DELETE /api/v1/coordinadores/:id   → borra (cualquier usuario autenticado)
 */
const router = Router();

router.get('/', asyncHandler(coordinadores.list));
router.get('/:id', asyncHandler(coordinadores.getOne));
router.post('/', requireAuth, asyncHandler(coordinadores.create));
router.put('/:id', requireAuth, asyncHandler(coordinadores.update));
router.delete('/:id', requireAuth, asyncHandler(coordinadores.remove));

export default router;
