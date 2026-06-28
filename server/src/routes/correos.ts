import { Router } from 'express';
import { enviarCorreosMasivos } from '../controllers/correos.js';

const router = Router();

// Endpoint para enviar correos masivos. Solo Administradores pueden hacerlo.
// TODO: Descomentar verifyToken y verifyRole cuando la auth esté plenamente integrada
// router.post('/masivos', verifyToken, verifyRole(['Administrador']), enviarCorreosMasivos);
router.post('/masivos', enviarCorreosMasivos);

export default router;
