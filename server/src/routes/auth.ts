import { Router } from 'express';
import rateLimit from 'express-rate-limit';
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

// Límite de 5 intentos por cada 15 minutos por IP para prevenir fuerza bruta
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Demasiados intentos de inicio de sesión. Por favor, inténtelo de nuevo en 15 minutos.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, asyncHandler(auth.login));
router.post('/change-password', requireAuth, asyncHandler(auth.changePassword));

export default router;
