import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireLevel } from '../middleware/auth.js';
import * as coordinadores from '../controllers/coordinadores.controller.js';

/**
 * Rutas del recurso `coordinadores`.
 * Endpoints:
 *   GET    /api/v1/coordinadores                  → lista (público)
 *   GET    /api/v1/coordinadores/:id              → detalle (público)
 *   POST   /api/v1/coordinadores                  → crea (admin)
 *   PUT    /api/v1/coordinadores/:id              → actualiza (admin)
 *   DELETE /api/v1/coordinadores/:id              → borra (admin)
 *   POST   /api/v1/coordinadores/:id/credenciales → crea/actualiza usuario asociado (admin)
 *   POST   /api/v1/coordinadores/:id/reset-password → resetea contraseña (admin)
 */
const router = Router();

router.get('/', asyncHandler(coordinadores.list));
router.get('/:id', asyncHandler(coordinadores.getOne));
router.post('/', requireAuth, requireLevel('admin'), asyncHandler(coordinadores.create));
router.put('/:id', requireAuth, requireLevel('admin'), asyncHandler(coordinadores.update));
router.delete('/:id', requireAuth, requireLevel('admin'), asyncHandler(coordinadores.remove));

router.post(
  '/:id/credenciales',
  requireAuth,
  requireLevel('admin'),
  asyncHandler(coordinadores.gestionarCredenciales),
);
router.post(
  '/:id/reset-password',
  requireAuth,
  requireLevel('admin'),
  asyncHandler(coordinadores.resetPassword),
);
router.put(
  '/:id/carrera',
  requireAuth,
  requireLevel('admin'),
  asyncHandler(coordinadores.asignarCarrera),
);

export default router;
