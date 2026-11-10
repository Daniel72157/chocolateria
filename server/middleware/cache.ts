import type { Request, Response, NextFunction } from 'express';

/** Cache-Control para GET públicos: aprovecha la caché de Vercel. */
export const publicCache = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET') res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  next();
};
