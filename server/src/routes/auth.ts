import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import * as auth from '../controllers/auth.controller.js';

/**
 * Rutas de autenticación.
 *
 * Endpoints:
 *   POST /api/v1/auth/login → login con correo/contraseña, retorna JWT
 */
const router = Router();

router.post('/login', asyncHandler(auth.login));

export default router;
