import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../../lib/supabase.js';
import { validate } from '../../middleware/validate.js';
import { categoryInput } from '../../../shared/schemas.js';

const router = Router();
const row = (c: z.infer<typeof categoryInput>) => ({ catalog_slug: c.catalogSlug, name: c.name, slug: c.slug, sort_order: c.sortOrder });

router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('categories').select('*').order('sort_order');
    if (error) throw error;
    res.json({ data });
  } catch (e) { next(e); }
});

router.post('/', validate(categoryInput), async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('categories').insert(row(req.body)).select('*').single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: { code: 'slug_taken', message: 'Ya existe una categoría con ese nombre en este catálogo' } });
      throw error;
    }
    res.status(201).json({ data });
  } catch (e) { next(e); }
});

router.put('/:id', validate(categoryInput), async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('categories').update(row(req.body)).eq('id', req.params.id).select('*').single();
    if (error) throw error;
    res.json({ data });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { error } = await supabase.from('categories').delete().eq('id', req.params.id); // products.category_id queda en null
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

export default router;
