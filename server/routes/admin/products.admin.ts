import { Router } from 'express';
import { supabase } from '../../lib/supabase.js';
import { validate } from '../../middleware/validate.js';
import { productInput, productQuickPatch, type ProductInput } from '../../../shared/schemas.js';
import { z } from 'zod';

const router = Router();
const SELECT = '*, product_images(*), product_variants(*)';
const PAGE = 20;

const toRow = (p: ProductInput) => ({
  catalog_slug: p.catalogSlug, category_id: p.categoryId, name: p.name, slug: p.slug,
  short_description: p.shortDescription ?? null, description: p.description ?? null,
  ingredients: p.ingredients ?? null, allergens: p.allergens ?? null, unit_label: p.unitLabel,
  price_cop: p.priceOnRequest ? null : p.priceCop, compare_at_price_cop: p.compareAtPriceCop ?? null,
  price_on_request: p.priceOnRequest, min_qty: p.minQty, is_active: p.isActive, is_available: p.isAvailable,
  is_featured: p.isFeatured, tags: p.tags,
});

async function saveChildren(productId: string, p: ProductInput) {
  // Imágenes: se reemplaza la lista completa (el orden de la lista es el orden de la galería)
  const { data: old } = await supabase.from('product_images').select('path').eq('product_id', productId);
  const keep = new Set(p.images.map((i) => i.path));
  const stale = (old ?? []).map((o) => o.path).filter((x) => !keep.has(x) && !x.startsWith('seed/'));
  await supabase.from('product_images').delete().eq('product_id', productId);
  if (p.images.length) {
    const { error } = await supabase.from('product_images').insert(p.images.map((i, n) => ({ product_id: productId, url: i.url, path: i.path, alt: i.alt ?? null, sort_order: n })));
    if (error) throw error;
  }
  if (stale.length) await supabase.storage.from('products').remove(stale);

  // Variantes: actualizar las que existen, crear nuevas, borrar las que ya no están
  const { data: vOld } = await supabase.from('product_variants').select('id').eq('product_id', productId);
  const keepIds = new Set(p.variants.map((v) => v.id).filter(Boolean));
  const drop = (vOld ?? []).map((v) => v.id).filter((id) => !keepIds.has(id));
  if (drop.length) await supabase.from('product_variants').delete().in('id', drop);
  for (const [n, v] of p.variants.entries()) {
    const row = { product_id: productId, name: v.name, price_cop: v.priceCop, sort_order: n, is_active: true };
    const { error } = v.id ? await supabase.from('product_variants').update(row).eq('id', v.id) : await supabase.from('product_variants').insert(row);
    if (error) throw error;
  }
}

const listQuery = z.object({
  catalog: z.string().optional(), category: z.string().optional(),
  status: z.enum(['activo', 'inactivo', 'agotado']).optional(), q: z.string().max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

router.get('/', validate(listQuery, 'query'), async (req, res, next) => {
  try {
    const { catalog, category, status, q, page } = req.query as any as z.infer<typeof listQuery>;
    let query = supabase.from('products').select(SELECT, { count: 'exact' }).order('created_at', { ascending: false }).order('id', { ascending: true });
    if (catalog) query = query.eq('catalog_slug', catalog);
    if (category) query = query.eq('category_id', category);
    if (status === 'activo') query = query.eq('is_active', true);
    if (status === 'inactivo') query = query.eq('is_active', false);
    if (status === 'agotado') query = query.eq('is_available', false);
    if (q) query = query.ilike('name', `%${q.replace(/[%,()]/g, ' ')}%`);
    const from = (page - 1) * PAGE;
    const { data, count, error } = await query.range(from, from + PAGE - 1);
    if (error) throw error;
    res.json({ data: { items: data, page, total: count ?? 0, pageSize: PAGE } });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('products').select(SELECT).eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: { code: 'not_found', message: 'Producto no encontrado' } });
    res.json({ data });
  } catch (e) { next(e); }
});

router.post('/', validate(productInput), async (req, res, next) => {
  try {
    const p = req.body as ProductInput;
    const { data, error } = await supabase.from('products').insert(toRow(p)).select('id').single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: { code: 'slug_taken', message: 'Ya existe un producto con ese enlace (slug)' } });
      throw error;
    }
    await saveChildren(data.id, p);
    res.status(201).json({ data: { id: data.id } });
  } catch (e) { next(e); }
});

router.put('/:id', validate(productInput), async (req, res, next) => {
  try {
    const p = req.body as ProductInput;
    const { error } = await supabase.from('products').update(toRow(p)).eq('id', req.params.id);
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: { code: 'slug_taken', message: 'Ya existe un producto con ese enlace (slug)' } });
      throw error;
    }
    await saveChildren(req.params.id, p);
    res.json({ data: { id: req.params.id } });
  } catch (e) { next(e); }
});

router.patch('/:id', validate(productQuickPatch), async (req, res, next) => {
  try {
    const b = req.body as z.infer<typeof productQuickPatch>;
    const patch: Record<string, boolean> = {};
    if (b.isActive !== undefined) patch.is_active = b.isActive;
    if (b.isAvailable !== undefined) patch.is_available = b.isAvailable;
    if (b.isFeatured !== undefined) patch.is_featured = b.isFeatured;
    const { error } = await supabase.from('products').update(patch).eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

router.put('/:id/images', validate(z.object({ images: productInput._def.schema.shape.images })), async (req, res, next) => {
  try {
    const { data: cur } = await supabase.from('products').select(SELECT).eq('id', req.params.id).single();
    if (!cur) return res.status(404).json({ error: { code: 'not_found', message: 'Producto no encontrado' } });
    await saveChildren(req.params.id, {
      ...({} as ProductInput), images: req.body.images,
      variants: (cur.product_variants ?? []).map((v: any) => ({ id: v.id, name: v.name, priceCop: v.price_cop })),
    } as ProductInput);
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const { data: p } = await supabase.from('products').select(SELECT).eq('id', req.params.id).single();
    if (!p) return res.status(404).json({ error: { code: 'not_found', message: 'Producto no encontrado' } });
    const { id: _id, product_images, product_variants, created_at: _c, updated_at: _u, ...row } = p as any;
    const { data: copy, error } = await supabase.from('products').insert({ ...row, name: `${p.name} (copia)`, slug: `${p.slug}-copia-${Date.now().toString(36)}`, is_active: false }).select('id').single();
    if (error) throw error;
    // Las imágenes se comparten por URL con el original; al editar la copia se pueden reemplazar.
    if (product_images?.length) await supabase.from('product_images').insert(product_images.map((i: any) => ({ product_id: copy.id, url: i.url, path: `seed/copia-${i.path}`, alt: i.alt, sort_order: i.sort_order })));
    if (product_variants?.length) await supabase.from('product_variants').insert(product_variants.map((v: any) => ({ product_id: copy.id, name: v.name, price_cop: v.price_cop, sort_order: v.sort_order, is_active: v.is_active })));
    res.status(201).json({ data: { id: copy.id } });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { data: imgs } = await supabase.from('product_images').select('path').eq('product_id', req.params.id);
    const paths = (imgs ?? []).map((i) => i.path).filter((p) => !p.startsWith('seed/'));
    if (paths.length) await supabase.storage.from('products').remove(paths);
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

export default router;
