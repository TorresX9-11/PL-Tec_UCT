import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getHistorialActivo, getArchivosHistoricos, postCerrarSemestre } from '../controllers/historial.js';

const router = Router();

router.get('/activo', requireAuth, getHistorialActivo);
router.get('/archivos', requireAuth, getArchivosHistoricos);
router.post('/cerrar-semestre', postCerrarSemestre);

export { router as historialRouter };
