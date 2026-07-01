import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, requireLevel } from '../middleware/auth.js';
import * as cursos from '../controllers/cursos.controller.js';

/**
 * Rutas del recurso `cursos`.
 * Plantilla replicable: copiar este archivo + schema + service + controller para
 * cada tabla del esquema (grupos, propuestas, etc.).
 *
 * Endpoints:
 *   GET    /api/v1/cursos                          → lista
 *   GET    /api/v1/cursos/:id_carrera/:id_curso   → detalle
 *   POST   /api/v1/cursos                          → crea
 *   PUT    /api/v1/cursos/:id_carrera/:id_curso   → actualiza
 *   DELETE /api/v1/cursos/:id_carrera/:id_curso   → borra
 *
 * NOTA: La PK es compuesta (id_carrera, id_curso).
 */
const router = Router();

router.get('/', requireAuth, asyncHandler(cursos.list));
router.get('/:id_carrera/:id_curso', requireAuth, asyncHandler(cursos.getOne));
router.post('/', requireAuth, requireLevel('admin', 'coordinador'), asyncHandler(cursos.create));
router.put('/:id_carrera/:id_curso', requireAuth, requireLevel('admin', 'coordinador'), asyncHandler(cursos.update));
router.delete('/:id_carrera/:id_curso', requireAuth, requireLevel('admin'), asyncHandler(cursos.remove));

export default router;
