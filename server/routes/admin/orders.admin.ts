import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../../lib/supabase.js';
import { validate } from '../../middleware/validate.js';
import { orderPatch } from '../../../shared/schemas.js';

const router = Router();
const PAGE = 20;
const listQuery = z.object({
  status: z.enum(['nuevo', 'confirmado', 'en_preparacion', 'entregado', 'cancelado']).optional(),
  from: z.string().date().optional(), to: z.string().date().optional(),
  page: z.coerce.number().int().min(1).default(1),
});

router.get('/', validate(listQuery, 'query'), async (req, res, next) => {
  try {
    const { status, from, to, page } = req.query as any as z.infer<typeof listQuery>;
    let q = supabase.from('orders').select('id, code, customer_name, customer_phone, total_cop, has_price_on_request, status, created_at', { count: 'exact' }).order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    if (from) q = q.gte('created_at', `${from}T00:00:00-05:00`);
    if (to) q = q.lte('created_at', `${to}T23:59:59-05:00`);
    const start = (page - 1) * PAGE;
    const { data, count, error } = await q.range(start, start + PAGE - 1);
    if (error) throw error;
    res.json({ data: { items: data, page, total: count ?? 0, pageSize: PAGE } });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: { code: 'not_found', message: 'Pedido no encontrado' } });
    res.json({ data });
  } catch (e) { next(e); }
});

router.patch('/:id', validate(orderPatch), async (req, res, next) => {
  try {
    const { error } = await supabase.from('orders').update({ status: req.body.status }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

export default router;
