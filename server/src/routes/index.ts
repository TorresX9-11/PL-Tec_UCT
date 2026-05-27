import { Router } from 'express';
import carrerasRouter from './carreras.js';

/**
 * Router raíz para `/api/v1`.
 *
 * Para agregar un recurso nuevo:
 *   1. Crear schema en src/schemas/<recurso>.schema.ts
 *   2. Crear service en src/services/<recurso>.service.ts
 *   3. Crear controller en src/controllers/<recurso>.controller.ts
 *   4. Crear router en src/routes/<recurso>.ts
 *   5. Montarlo aquí abajo con apiRouter.use(...)
 */
const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ data: { status: 'ok', timestamp: new Date().toISOString() } });
});

apiRouter.use('/carreras', carrerasRouter);

// TODO: montar al implementarse
// apiRouter.use('/cursos', cursosRouter);
// apiRouter.use('/grupos', gruposRouter);
// apiRouter.use('/docentes', docentesRouter);
// apiRouter.use('/propuestas', propuestasRouter);
// apiRouter.use('/pagos', pagosRouter);
// apiRouter.use('/archivos', archivosRouter);
// apiRouter.use('/capacitaciones', capacitacionesRouter);
// apiRouter.use('/coordinadores', coordinadoresRouter);
// apiRouter.use('/usuarios', usuariosRouter);
// apiRouter.use('/auth', authRouter);

export default apiRouter;
