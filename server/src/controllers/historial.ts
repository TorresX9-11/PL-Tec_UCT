import { Request, Response } from 'express';
import { obtenerHistorialActivo, obtenerArchivosHistoricos, cerrarSemestre } from '../services/historial.service.js';

export async function getHistorialActivo(req: Request, res: Response) {
  try {
    const data = await obtenerHistorialActivo();
    res.json({ data });
  } catch (error: any) {
    console.error('Error in getHistorialActivo:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor', details: error.message } });
  }
}

export async function getArchivosHistoricos(req: Request, res: Response) {
  try {
    const data = await obtenerArchivosHistoricos();
    res.json({ data });
  } catch (error: any) {
    console.error('Error in getArchivosHistoricos:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor', details: error.message } });
  }
}

export async function postCerrarSemestre(req: Request, res: Response) {
  try {
    const { periodoNombre } = req.body;
    if (!periodoNombre) {
      return res.status(400).json({ error: { message: 'Falta el nombre del periodo' } });
    }
    
    await cerrarSemestre(periodoNombre);
    res.json({ message: 'Semestre cerrado y archivado correctamente' });
  } catch (error: any) {
    console.error('Error in postCerrarSemestre:', error);
    res.status(500).json({ error: { message: 'Error interno del servidor', details: error.message } });
  }
}
