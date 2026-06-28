import type { Request, Response } from 'express';
import * as academicoService from '../services/academico.service.js';
import { HttpError } from '../middleware/error.js';

function getCarreraId(req: Request): string {
  const queryCarreraId = req.query.carreraId as string;
  const user = req.user;

  if (!user) {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Sesión requerida');
  }

  // El supervisor puede consultar cualquier carrera enviando ?carreraId=...
  if (user.nivel === 'supervisor') {
    if (!queryCarreraId) throw new HttpError(400, 'BAD_REQUEST', 'Supervisor debe especificar carreraId');
    return queryCarreraId;
  }

  // El coordinador solo puede consultar SU carrera. Ignoramos la query.
  if (user.nivel === 'coordinador' || user.nivel === 'academico') {
    if (!user.id_carrera) {
      throw new HttpError(403, 'FORBIDDEN', 'El coordinador no tiene una carrera asignada en el sistema.');
    }
    return user.id_carrera;
  }

  throw new HttpError(403, 'FORBIDDEN', 'Rol no autorizado para acceder al módulo académico.');
}

export async function dashboard(req: Request, res: Response) {
  const carreraId = getCarreraId(req);
  const stats = await academicoService.getDashboardStats(carreraId);
  res.json({ data: stats });
}

export async function listarDocentes(req: Request, res: Response) {
  const carreraId = getCarreraId(req);
  const docentes = await academicoService.getDocentesPorCarrera(carreraId);
  res.json({ data: docentes });
}

export async function validarDocente(req: Request, res: Response) {
  const rut = parseInt(req.params.rut, 10);
  if (isNaN(rut)) throw new HttpError(400, 'BAD_REQUEST', 'RUT inválido');

  const { estado_cv, estado_titulo, estado_antecedentes, estado_inhabilidad } = req.body;
  await academicoService.updateValidacionDocente(rut, {
    estado_cv,
    estado_titulo,
    estado_antecedentes,
    estado_inhabilidad,
  });

  res.json({ success: true });
}

export async function listarGrupos(req: Request, res: Response) {
  const carreraId = getCarreraId(req);
  const grupos = await academicoService.getGruposPorCarrera(carreraId);
  res.json({ data: grupos });
}

export async function validarGrupo(req: Request, res: Response) {
  const id_grupo = parseInt(req.params.id_grupo, 10);
  if (isNaN(id_grupo)) throw new HttpError(400, 'BAD_REQUEST', 'ID de grupo inválido');

  const { contenido_blackboard, guia_aprendizaje } = req.body;
  await academicoService.updateValidacionGrupo(id_grupo, {
    contenido_blackboard,
    guia_aprendizaje,
  });

  res.json({ success: true });
}
