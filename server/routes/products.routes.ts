import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { tidy } from './catalogs.routes.js';

const router = Router();
const SELECT = '*, product_images(*), product_variants(*)';

router.get('/featured', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('products').select(SELECT).eq('is_active', true).eq('is_featured', true).order('sort_order').limit(8);
    if (error) throw error;
    res.json({ data: (data ?? []).map(tidy) });
  } catch (e) { next(e); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('products').select(SELECT).eq('slug', req.params.slug).eq('is_active', true).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: { code: 'not_found', message: 'Producto no encontrado' } });
    const { data: related } = await supabase.from('products').select(SELECT).eq('catalog_slug', data.catalog_slug).eq('is_active', true).neq('id', data.id).limit(4);
    res.json({ data: { ...tidy(data), related: (related ?? []).map(tidy) } });
  } catch (e) { next(e); }
});

export default router;
