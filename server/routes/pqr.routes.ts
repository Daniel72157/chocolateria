import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { validate } from '../middleware/validate.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { pqrInput } from '../../shared/schemas.js';

const router = Router();

router.post('/', writeLimiter, validate(pqrInput), async (req, res, next) => {
  try {
    if (req.body.website) return res.status(400).json({ error: { code: 'spam', message: 'Solicitud inválida' } });
    const { type, name, phone, email, body } = req.body;
    const { data, error } = await supabase.from('pqr').insert({ type, name, phone: phone || null, email: email || null, body }).select('code').single();
    if (error) throw error;
    res.status(201).json({ data: { ok: true, code: data.code } });
  } catch (e) { next(e); }
});

export default router;
