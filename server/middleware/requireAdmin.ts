import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase.js';

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: { code: 'unauthorized', message: 'Inicia sesión' } });

    const { data: userData, error } = await supabase.auth.getUser(token);
    if (error || !userData.user) {
      return res.status(401).json({ error: { code: 'unauthorized', message: 'Sesión inválida' } });
    }

    const { data: admin } = await supabase.from('admins').select('user_id, name').eq('user_id', userData.user.id).maybeSingle();
    if (!admin) return res.status(403).json({ error: { code: 'forbidden', message: 'No eres administrador' } });

    res.locals.admin = admin;
    next();
  } catch (e) {
    next(e);
  }
}
