import { Router } from 'express';
import carrerasRouter from './carreras.js';
import usuariosRouter from './usuarios.js';
import docentesRouter from './docentes.js';
import cursosRouter from './cursos.js';
import gruposRouter from './grupos.js';
import propuestasRouter from './propuestas.js';
import pagosRouter from './pagos.js';
import archivosRouter from './archivos.js';
import capacitacionesRouter from './capacitaciones.js';
import coordinadoresRouter from './coordinadores.js';
import authRouter from './auth.js';
import correosRouter from './correos.js';
import { historialRouter } from './historial.js';
import { academicoRouter } from './academico.js';

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
apiRouter.use('/usuarios', usuariosRouter);
apiRouter.use('/docentes', docentesRouter);
apiRouter.use('/cursos', cursosRouter);
apiRouter.use('/grupos', gruposRouter);
apiRouter.use('/propuestas', propuestasRouter);
apiRouter.use('/pagos', pagosRouter);
apiRouter.use('/archivos', archivosRouter);
apiRouter.use('/capacitaciones', capacitacionesRouter);
apiRouter.use('/coordinadores', coordinadoresRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/correos', correosRouter);
apiRouter.use('/historial', historialRouter);
apiRouter.use('/academico', academicoRouter);

export default apiRouter;
