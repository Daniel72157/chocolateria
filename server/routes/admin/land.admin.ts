import { Router } from 'express';
import { supabase } from '../../lib/supabase.js';
import { validate } from '../../middleware/validate.js';
import { awardOrderInput, landInput, type LandInput } from '../../../shared/schemas.js';

const router = Router();
const SELECT = 'id, name, tag, title, story, image_url, image_path, width, height, is_published, sort_order';

const row = (t: LandInput) => ({
  name: t.name, tag: t.tag || null, title: t.title || null, story: t.story || null,
  image_url: t.imageUrl, image_path: t.imagePath, width: t.width ?? null, height: t.height ?? null, is_published: t.isPublished,
});

/** Borra de Storage la foto que ya no se usa (las de ejemplo, en /public, no se tocan). */
async function removeFile(path?: string | null) {
  if (path && !path.startsWith('seed/')) await supabase.storage.from('land').remove([path]);
}

router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('land_tiles').select(SELECT).order('sort_order').order('created_at');
    if (error) throw error;
    res.json({ data });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('land_tiles').select(SELECT).eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: { code: 'not_found', message: 'Foto no encontrada' } });
    res.json({ data });
  } catch (e) { next(e); }
});

router.post('/', validate(landInput), async (req, res, next) => {
  try {
    // La nueva va al final de la lista.
    const { data: last } = await supabase.from('land_tiles').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await supabase.from('land_tiles').insert({ ...row(req.body), sort_order: (last?.sort_order ?? -1) + 1 }).select('id').single();
    if (error) throw error;
    res.status(201).json({ data: { id: data.id } });
  } catch (e) { next(e); }
});

router.put('/order', validate(awardOrderInput), async (req, res, next) => {
  try {
    const ids: string[] = req.body.ids;
    const results = await Promise.all(ids.map((id, i) => supabase.from('land_tiles').update({ sort_order: i }).eq('id', id)));
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

router.put('/:id', validate(landInput), async (req, res, next) => {
  try {
    const { data: old } = await supabase.from('land_tiles').select('image_path').eq('id', req.params.id).maybeSingle();
    if (!old) return res.status(404).json({ error: { code: 'not_found', message: 'Foto no encontrada' } });
    const r = row(req.body);
    const { error } = await supabase.from('land_tiles').update(r).eq('id', req.params.id);
    if (error) throw error;
    if (old.image_path !== r.image_path) await removeFile(old.image_path);
    res.json({ data: { id: req.params.id } });
  } catch (e) { next(e); }
});

router.patch('/:id', validate(landInput.pick({ isPublished: true })), async (req, res, next) => {
  try {
    const { error } = await supabase.from('land_tiles').update({ is_published: req.body.isPublished }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { data: old } = await supabase.from('land_tiles').select('image_path').eq('id', req.params.id).maybeSingle();
    const { error } = await supabase.from('land_tiles').delete().eq('id', req.params.id);
    if (error) throw error;
    await removeFile(old?.image_path);
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

export default router;
