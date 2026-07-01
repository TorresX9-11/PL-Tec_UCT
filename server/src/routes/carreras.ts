import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireLevel } from '../middleware/auth.js';
import * as carreras from '../controllers/carreras.controller.js';

/**
 * Rutas del recurso `carreras`.
 * Plantilla replicable: copiar este archivo + schema + service + controller para
 * cada tabla del esquema (cursos, docentes, propuestas, etc.).
 *
 * Endpoints:
 *   GET    /api/v1/carreras       → lista (público)
 *   GET    /api/v1/carreras/:id   → detalle (público)
 *   POST   /api/v1/carreras       → crea (admin, coordinador)
 *   PUT    /api/v1/carreras/:id   → actualiza (admin, coordinador)
 *   DELETE /api/v1/carreras/:id   → borra (admin)
 */
const router = Router();

router.get('/', requireAuth, asyncHandler(carreras.list));
router.get('/:id', requireAuth, asyncHandler(carreras.getOne));
router.post('/', requireAuth, requireLevel('admin', 'coordinador'), asyncHandler(carreras.create));
router.put('/:id', requireAuth, requireLevel('admin', 'coordinador'), asyncHandler(carreras.update));
router.delete('/:id', requireAuth, requireLevel('admin'), asyncHandler(carreras.remove));

export default router;
