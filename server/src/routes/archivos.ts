import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import * as archivos from '../controllers/archivos.controller.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the folder from req.body.ruta (e.g. "uploads/cv/docente_...pdf" -> "cv")
    let folder = 'boletas';
    if (req.body.ruta) {
      const parts = req.body.ruta.split('/');
      if (parts.length >= 2 && parts[0] === 'uploads') {
        folder = parts[1];
      }
    }
    const destDir = path.join(process.cwd(), 'public', 'uploads', folder);
    import('fs').then(fs => {
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      cb(null, destDir);
    }).catch(err => cb(err, destDir));
  },
  filename: (req, file, cb) => {
    cb(null, req.body.ruta ? req.body.ruta.split('/').pop()! : 'boleta-' + Date.now() + '.pdf');
  }
});
const upload = multer({ storage });

/**
 * Rutas del recurso `archivos`.
 * Plantilla replicable: copiar este archivo + schema + service + controller para
 * cada tabla del esquema (capacitaciones, coordinadores, etc.).
 *
 * Endpoints:
 *   GET    /api/v1/archivos       → lista
 *   GET    /api/v1/archivos/:id   → detalle
 *   POST   /api/v1/archivos       → crea
 *   PUT    /api/v1/archivos/:id   → actualiza
 *   DELETE /api/v1/archivos/:id   → borra
 */
const router = Router();

router.get('/', asyncHandler(archivos.list));
router.get('/:id', asyncHandler(archivos.getOne));
router.post('/', requireAuth, asyncHandler(archivos.create));
router.post('/upload', requireAuth, upload.single('archivo'), asyncHandler(archivos.uploadFisico));
router.put('/:id', requireAuth, asyncHandler(archivos.update));
router.delete('/:id', requireAuth, asyncHandler(archivos.remove));

export default router;
