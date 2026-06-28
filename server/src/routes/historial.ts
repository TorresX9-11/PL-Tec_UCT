import { Router } from 'express';
import { getHistorialActivo, getArchivosHistoricos, postCerrarSemestre } from '../controllers/historial.js';

const router = Router();

router.get('/activo', getHistorialActivo);
router.get('/archivos', getArchivosHistoricos);
router.post('/cerrar-semestre', postCerrarSemestre);

export { router as historialRouter };
