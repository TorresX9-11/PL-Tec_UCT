import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as capacitaciones from '../controllers/capacitaciones.controller.js';

/**
 * Rutas del recurso `capacitaciones`.
 * Endpoints:
 *   GET    /api/v1/capacitaciones       → lista (público)
 *   GET    /api/v1/capacitaciones/:id   → detalle (público)
 *   POST   /api/v1/capacitaciones       → crea (cualquier usuario autenticado)
 *   PUT    /api/v1/capacitaciones/:id   → actualiza (cualquier usuario autenticado)
 *   DELETE /api/v1/capacitaciones/:id   → borra (cualquier usuario autenticado)
 */
const router = Router();

router.get('/', requireAuth, asyncHandler(capacitaciones.list));
router.get('/:id', requireAuth, asyncHandler(capacitaciones.getOne));
router.post('/', requireAuth, asyncHandler(capacitaciones.create));
router.put('/:id', requireAuth, asyncHandler(capacitaciones.update));
router.delete('/:id', requireAuth, asyncHandler(capacitaciones.remove));

export default router;
