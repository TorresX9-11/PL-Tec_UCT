import { Router } from 'express';
import { requireAuth, requireLevel } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import * as academicoController from '../controllers/academico.controller.js';

const router = Router();

// Todas las rutas académicas requieren ser coordinador o supervisor
router.use(requireAuth);
router.use(requireLevel('coordinador', 'supervisor'));

router.get('/dashboard', asyncHandler(academicoController.dashboard));

router.get('/docentes', asyncHandler(academicoController.listarDocentes));
router.put('/docentes/:rut/validar', asyncHandler(academicoController.validarDocente));

router.get('/grupos', asyncHandler(academicoController.listarGrupos));
router.put('/grupos/:id_grupo/validar', asyncHandler(academicoController.validarGrupo));

export { router as academicoRouter };
