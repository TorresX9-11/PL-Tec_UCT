import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

/**
 * Error de aplicación con código HTTP. Lanzar desde controllers/services.
 */
export class HttpError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    },
  });
};

/**
 * Wrapper para atrapar errores en rutas asíncronas de Express 4.
 */
export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Handler centralizado. Mapea errores conocidos a respuestas JSON consistentes.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Validación zod
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos.',
        details: err.flatten(),
      },
    });
    return;
  }

  // Error de aplicación tipado
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  // Errores conocidos de mysql2
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyErr = err as any;
  if (anyErr && typeof anyErr.code === 'string' && anyErr.code.startsWith('ER_')) {
    res.status(500).json({
      error: {
        code: 'DB_ERROR',
        message: 'Error en la base de datos.',
        ...(process.env.NODE_ENV !== 'production' ? { details: anyErr.sqlMessage ?? anyErr.message } : {}),
      },
    });
    return;
  }

  // Fallback
  // eslint-disable-next-line no-console
  console.error('[unhandled-error]', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ocurrió un error inesperado.',
    },
  });
};
