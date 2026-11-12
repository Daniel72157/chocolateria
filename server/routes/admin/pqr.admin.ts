import { Router } from 'express';
import { supabase } from '../../lib/supabase.js';
import { validate } from '../../middleware/validate.js';
import { pqrPatch } from '../../../shared/schemas.js';

const router = Router();

/** Lista (con filtros opcionales) + balance general para las estadísticas. */
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('pqr').select('id, code, type, name, phone, email, body, status, created_at').order('created_at', { ascending: false }).limit(1000);
    if (error) throw error;
    const rows = data ?? [];
    const count = (key: 'type' | 'status') => rows.reduce<Record<string, number>>((a, r) => { a[r[key]] = (a[r[key]] ?? 0) + 1; return a; }, {});
    const byMonth = rows.reduce<Record<string, number>>((a, r) => { const m = r.created_at.slice(0, 7); a[m] = (a[m] ?? 0) + 1; return a; }, {});
    const status = typeof req.query.status === 'string' ? req.query.status : '';
    const type = typeof req.query.type === 'string' ? req.query.type : '';
    res.json({
      data: {
        summary: { total: rows.length, byType: count('type'), byStatus: count('status'), byMonth },
        items: rows.filter((r) => (!status || r.status === status) && (!type || r.type === type)),
      },
    });
  } catch (e) { next(e); }
});

router.patch('/:id', validate(pqrPatch), async (req, res, next) => {
  try {
    const { error } = await supabase.from('pqr').update({ status: req.body.status }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('pqr').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

export default router;
