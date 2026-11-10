import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { CATALOG_SLUGS } from '../../shared/schemas.js';

const router = Router();
const PAGE_SIZE = 24;

router.get('/', async (_req, res, next) => {
  try {
    const [{ data: catalogs, error }, { data: categories }] = await Promise.all([
      supabase.from('catalogs').select('*').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
    ]);
    if (error) throw error;
    res.json({ data: catalogs!.map((c) => ({ ...c, categories: (categories ?? []).filter((k) => k.catalog_slug === c.slug) })) });
  } catch (e) { next(e); }
});

router.get('/:slug/products', async (req, res, next) => {
  try {
    const slug = req.params.slug;
    if (!(CATALOG_SLUGS as readonly string[]).includes(slug)) return res.status(404).json({ error: { code: 'not_found', message: 'Catálogo no encontrado' } });
    const page = Math.max(1, Number(req.query.page) || 1);
    const sort = String(req.query.sort ?? 'destacados');
    const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 60).replace(/[%,()]/g, ' ') : '';

    let query = supabase
      .from('products')
      .select('*, product_images(*), product_variants(*)', { count: 'exact' })
      .eq('catalog_slug', slug)
      .eq('is_active', true);

    if (typeof req.query.category === 'string' && req.query.category) {
      const { data: cat } = await supabase.from('categories').select('id').eq('catalog_slug', slug).eq('slug', req.query.category).maybeSingle();
      if (!cat) return res.json({ data: { items: [], page, total: 0, pageSize: PAGE_SIZE } });
      query = query.eq('category_id', cat.id);
    }
    if (q) query = query.ilike('name', `%${q}%`);

    if (sort === 'precio-asc') query = query.order('price_cop', { ascending: true, nullsFirst: false });
    else if (sort === 'precio-desc') query = query.order('price_cop', { ascending: false, nullsFirst: false });
    else if (sort === 'nombre') query = query.order('name', { ascending: true });
    else query = query.order('is_featured', { ascending: false }).order('sort_order', { ascending: true });

    const from = (page - 1) * PAGE_SIZE;
    const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    res.json({ data: { items: (data ?? []).map(tidy), page, total: count ?? 0, pageSize: PAGE_SIZE } });
  } catch (e) { next(e); }
});

export const tidy = (p: any) => ({
  ...p,
  product_images: [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  product_variants: [...(p.product_variants ?? [])].filter((v) => v.is_active).sort((a, b) => a.sort_order - b.sort_order),
});

export default router;
