import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Envuelve handlers async para que sus rejects lleguen al errorHandler de Express.
 * Sin esto, una promesa rechazada en un handler async deja la request colgada.
 */
export const asyncHandler =
  <T extends RequestHandler>(fn: T): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
