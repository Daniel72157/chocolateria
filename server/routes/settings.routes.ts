import { Router } from 'express';
import { supabase } from '../lib/supabase.js';

const router = Router();

router.get('/settings', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('store_settings').select('*').eq('id', 1).single();
    if (error) throw error;
    const { id: _id, updated_at: _u, ...pub } = data;
    res.json({ data: pub });
  } catch (e) { next(e); }
});

router.get('/about', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('about_sections').select('*').order('sort_order');
    if (error) throw error;
    res.json({ data });
  } catch (e) { next(e); }
});

export default router;
