import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

/** Fotos de "Nuestra tierra" publicadas, en el orden definido en el panel. */
router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('land_tiles')
      .select('id, name, tag, title, story, image_url, width, height, sort_order')
      .eq('is_published', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json({ data });
  } catch (e) { next(e); }
});

export default router;
