import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as coordinadores from '../controllers/coordinadores.controller.js';
import { requireAuth, requireLevel } from '../middleware/auth.js';

const router = Router();

// GET route allows docentes (para ver el nombre de su coordinador en Mis Ramos)
router.get('/', requireAuth, requireLevel('supervisor', 'admin', 'docente'), asyncHandler(coordinadores.list));

// Modifying routes require supervisor or admin
router.post('/', requireAuth, requireLevel('supervisor', 'admin'), asyncHandler(coordinadores.create));
router.put('/:id', requireAuth, requireLevel('supervisor', 'admin'), asyncHandler(coordinadores.update));
router.delete('/:id', requireAuth, requireLevel('supervisor', 'admin'), asyncHandler(coordinadores.remove));

export default router;
