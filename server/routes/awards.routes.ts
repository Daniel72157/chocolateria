import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

/** Reconocimientos publicados, en el orden definido en el panel. */
router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('awards')
      .select('id, title, issuer, year, description, image_url, width, height, file_url')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (e) { next(e); }
});

export default router;
