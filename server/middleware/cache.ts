import type { Request, Response, NextFunction } from 'express';

/** Cache-Control para GET públicos: aprovecha la caché de Vercel.
 *  Las rutas del panel (/admin) nunca se cachean: deben devolver siempre el dato recién guardado. */
export const publicCache = (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/admin')) res.set('Cache-Control', 'private, no-store');
  else if (req.method === 'GET') res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  next();
};
