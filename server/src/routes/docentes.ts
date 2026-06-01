import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireLevel } from '../middleware/auth.js';
import * as docentes from '../controllers/docentes.controller.js';

/**
 * Rutas del recurso `docentes`.
 * Plantilla replicable: copiar este archivo + schema + service + controller para
 * cada tabla del esquema (cursos, grupos, propuestas, etc.).
 *
 * Endpoints:
 *   GET    /api/v1/docentes       → lista
 *   GET    /api/v1/docentes/:id   → detalle
 *   POST   /api/v1/docentes       → crea
 *   PUT    /api/v1/docentes/:id   → actualiza
 *   DELETE /api/v1/docentes/:id   → borra
 */
const router = Router();

router.get('/', asyncHandler(docentes.list));
router.get('/:id', asyncHandler(docentes.getOne));
router.post('/', requireAuth, requireLevel('admin', 'coordinador'), asyncHandler(docentes.create));
router.put('/:id', requireAuth, requireLevel('admin', 'coordinador'), asyncHandler(docentes.update));
router.delete('/:id', requireAuth, requireLevel('admin'), asyncHandler(docentes.remove));

export default router;
