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

export async function listarHitosAcreditacion(req: Request, res: Response) {
  const carreraId = getCarreraId(req);
  const hitos = await academicoService.getHitosAcreditacion(carreraId);
  res.json({ data: hitos });
}

export async function updateHito(req: Request, res: Response) {
  const id_hito = parseInt(req.params.id, 10);
  if (isNaN(id_hito)) throw new HttpError(400, 'BAD_REQUEST', 'ID de hito inválido');

  const { estado } = req.body;
  if (!estado) throw new HttpError(400, 'BAD_REQUEST', 'Estado es requerido');

  await academicoService.updateHitoAcreditacion(id_hito, estado);
  res.json({ success: true });
}

export async function addEvidenciaHito(req: Request, res: Response) {
  const id_hito = parseInt(req.params.id, 10);
  if (isNaN(id_hito)) throw new HttpError(400, 'BAD_REQUEST', 'ID de hito inválido');

  const { titulo, tipo, descripcion } = req.body;
  if (!titulo || !tipo) throw new HttpError(400, 'BAD_REQUEST', 'Faltan datos de la evidencia');

  const url_archivo = req.file ? `/uploads/${req.file.filename}` : null;

  await academicoService.addEvidenciaHito(id_hito, { titulo, tipo, descripcion, url_archivo });
  res.json({ success: true });
}

export async function listarEvidenciasHito(req: Request, res: Response) {
  const id_hito = parseInt(req.params.id, 10);
  if (isNaN(id_hito)) throw new HttpError(400, 'BAD_REQUEST', 'ID de hito inválido');

  const evidencias = await academicoService.getEvidenciasPorHito(id_hito);
  res.json({ data: evidencias });
}

export async function deleteEvidenciaHito(req: Request, res: Response) {
  const id_evidencia = parseInt(req.params.id_evidencia, 10);
  if (isNaN(id_evidencia)) throw new HttpError(400, 'BAD_REQUEST', 'ID de evidencia inválido');

  await academicoService.deleteEvidenciaHito(id_evidencia);
  res.json({ success: true });
}

export async function listarEvidenciasRecientes(req: Request, res: Response) {
  const carreraId = getCarreraId(req);
  const evidencias = await academicoService.getEvidenciasRecientes(carreraId);
  res.json({ data: evidencias });
}
