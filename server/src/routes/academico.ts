import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { requireAuth, requireLevel } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/error.js';
import * as academicoController from '../controllers/academico.controller.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'evidencia-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const router = Router();

// Rutas protegidas genéricamente
router.use(requireAuth);

router.get('/dashboard', requireLevel('coordinador', 'supervisor', 'admin'), asyncHandler(academicoController.dashboard));

router.get('/docentes', requireLevel('coordinador', 'supervisor', 'admin'), asyncHandler(academicoController.listarDocentes));
router.put('/docentes/:rut/validar', requireLevel('coordinador', 'supervisor', 'admin', 'docente'), asyncHandler(academicoController.validarDocente));

router.get('/grupos', requireLevel('coordinador', 'supervisor', 'admin'), asyncHandler(academicoController.listarGrupos));
router.put('/grupos/:id_grupo/validar', requireLevel('coordinador', 'supervisor', 'admin', 'docente'), asyncHandler(academicoController.validarGrupo));

router.get('/acreditacion', requireLevel('coordinador', 'supervisor', 'admin'), asyncHandler(academicoController.listarHitosAcreditacion));
router.get('/acreditacion/evidencias/recientes', requireLevel('coordinador', 'supervisor', 'admin'), asyncHandler(academicoController.listarEvidenciasRecientes));
router.put('/acreditacion/:id', requireLevel('coordinador', 'supervisor', 'admin'), asyncHandler(academicoController.updateHito));
router.post('/acreditacion/:id/evidencia', requireLevel('coordinador', 'supervisor', 'admin'), upload.single('archivo'), asyncHandler(academicoController.addEvidenciaHito));
router.get('/acreditacion/:id/evidencias', requireLevel('coordinador', 'supervisor', 'admin'), asyncHandler(academicoController.listarEvidenciasHito));
router.delete('/acreditacion/evidencia/:id_evidencia', requireLevel('coordinador', 'supervisor', 'admin'), asyncHandler(academicoController.deleteEvidenciaHito));

export { router as academicoRouter };
