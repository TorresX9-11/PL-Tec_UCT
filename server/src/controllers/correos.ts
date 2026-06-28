import { Request, Response } from 'express';
import { sendMassEmails, CorreoData } from '../services/emailService.js';
import { z } from 'zod';

const correosSchema = z.object({
  destinatarios: z.array(
    z.object({
      to: z.string().email(),
      subject: z.string(),
      text: z.string()
    })
  )
});

export const enviarCorreosMasivos = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = correosSchema.safeParse(req.body);
    
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Formato de datos inválido',
        detalles: parseResult.error.errors
      });
      return;
    }

    const { destinatarios } = parseResult.data;

    if (destinatarios.length === 0) {
      res.status(400).json({ error: 'No se enviaron destinatarios' });
      return;
    }

    const result = await sendMassEmails(destinatarios);

    res.json({
      message: 'Proceso de envío finalizado',
      data: result
    });
  } catch (error) {
    console.error('Error en enviarCorreosMasivos:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar los correos' });
  }
};
