import type { Request, Response, NextFunction } from 'express';
import { OrderError } from '../lib/orders.js';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof OrderError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
  }
  console.error(err);
  res.status(500).json({ error: { code: 'server_error', message: 'Algo salió mal, intenta de nuevo' } });
}
