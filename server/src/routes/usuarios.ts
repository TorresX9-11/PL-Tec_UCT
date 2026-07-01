import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireLevel } from '../middleware/auth.js';
import * as usuarios from '../controllers/usuarios.controller.js';

/**
 * Rutas del recurso `usuarios`.
 * Plantilla replicable: copiar este archivo + schema + service + controller para
 * cada tabla del esquema (cursos, docentes, propuestas, etc.).
 *
 * Endpoints:
 *   GET    /api/v1/usuarios       → lista (público)
 *   GET    /api/v1/usuarios/:id   → detalle (público)
 *   POST   /api/v1/usuarios       → crea (admin)
 *   PUT    /api/v1/usuarios/:id   → actualiza (admin)
 *   DELETE /api/v1/usuarios/:id   → borra (admin)
 */
const router = Router();

router.get('/', requireAuth, asyncHandler(usuarios.list));
router.get('/:id', requireAuth, asyncHandler(usuarios.getOne));
router.post('/', requireAuth, requireLevel('admin', 'supervisor'), asyncHandler(usuarios.create));
router.put('/:id', requireAuth, requireLevel('admin', 'supervisor'), asyncHandler(usuarios.update));
router.put('/:id/reset-password', requireAuth, requireLevel('admin', 'supervisor'), asyncHandler(usuarios.resetPassword));
router.delete('/:id', requireAuth, requireLevel('admin', 'supervisor'), asyncHandler(usuarios.remove));

export default router;
