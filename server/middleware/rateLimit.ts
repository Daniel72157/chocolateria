import rateLimit from 'express-rate-limit';

const message = { error: { code: 'rate_limited', message: 'Demasiadas peticiones, intenta en unos minutos' } };
export const publicLimiter = rateLimit({ windowMs: 60_000, limit: 120, message });
export const writeLimiter = rateLimit({ windowMs: 10 * 60_000, limit: 10, message }); // pedidos y comentarios
