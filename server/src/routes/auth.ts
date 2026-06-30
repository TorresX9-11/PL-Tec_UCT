import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as auth from '../controllers/auth.controller.js';

import { requireAuth } from '../middleware/auth.js';

/**
 * Rutas de autenticación.
 *
 * Endpoints:
 *   POST /api/v1/auth/login → login con correo/contraseña, retorna JWT
 *   POST /api/v1/auth/change-password → cambia la contraseña del usuario logueado
 */
const router = Router();

router.post('/login', asyncHandler(auth.login));
router.post('/change-password', requireAuth, asyncHandler(auth.changePassword));

export default router;
