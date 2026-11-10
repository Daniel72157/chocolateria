import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema, part: 'body' | 'query' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'validation', message: 'Datos inválidos', details: result.error.flatten() } });
    }
    (req as any)[part] = result.data;
    next();
  };
