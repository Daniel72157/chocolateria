import { Router } from 'express';
import { supabase } from '../../lib/supabase.js';
import { validate } from '../../middleware/validate.js';
import { commentPatch } from '../../../shared/schemas.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const status = ['pendiente', 'aprobado', 'rechazado'].includes(String(req.query.status)) ? String(req.query.status) : 'pendiente';
    const { data, error } = await supabase.from('post_comments').select('id, post_id, author_name, body, status, created_at, posts(body)').eq('status', status).order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    res.json({ data });
  } catch (e) { next(e); }
});

router.patch('/:id', validate(commentPatch), async (req, res, next) => {
  try {
    const { error } = await supabase.from('post_comments').update({ status: req.body.status }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('post_comments').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

export default router;
