import { Router } from 'express';
import { supabase } from '../../lib/supabase.js';
import { validate } from '../../middleware/validate.js';
import { awardInput, awardOrderInput, type AwardInput } from '../../../shared/schemas.js';

const router = Router();
const SELECT = 'id, title, issuer, year, description, image_url, image_path, width, height, file_url, file_path, is_published, sort_order, created_at';

const row = (a: AwardInput) => ({
  title: a.title, issuer: a.issuer || null, year: a.year || null, description: a.description || null,
  image_url: a.imageUrl, image_path: a.imagePath, width: a.width ?? null, height: a.height ?? null,
  file_url: a.fileUrl || null, file_path: a.filePath || null, is_published: a.isPublished,
});

/** Borra del Storage los archivos que ya no usa el reconocimiento. */
async function removeFiles(paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => !!p);
  if (list.length) await supabase.storage.from('awards').remove(list);
}

router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('awards').select(SELECT).order('sort_order').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('awards').select(SELECT).eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: { code: 'not_found', message: 'Reconocimiento no encontrado' } });
    res.json({ data });
  } catch (e) { next(e); }
});

router.post('/', validate(awardInput), async (req, res, next) => {
  try {
    // Los nuevos van al principio de la lista.
    const { data: first } = await supabase.from('awards').select('sort_order').order('sort_order').limit(1).maybeSingle();
    const { data, error } = await supabase.from('awards').insert({ ...row(req.body), sort_order: (first?.sort_order ?? 1) - 1 }).select('id').single();
    if (error) throw error;
    res.status(201).json({ data: { id: data.id } });
  } catch (e) { next(e); }
});

router.put('/order', validate(awardOrderInput), async (req, res, next) => {
  try {
    const ids: string[] = req.body.ids;
    const results = await Promise.all(ids.map((id, i) => supabase.from('awards').update({ sort_order: i }).eq('id', id)));
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

router.put('/:id', validate(awardInput), async (req, res, next) => {
  try {
    const { data: old } = await supabase.from('awards').select('image_path, file_path').eq('id', req.params.id).maybeSingle();
    if (!old) return res.status(404).json({ error: { code: 'not_found', message: 'Reconocimiento no encontrado' } });
    const r = row(req.body);
    const { error } = await supabase.from('awards').update(r).eq('id', req.params.id);
    if (error) throw error;
    await removeFiles([old.image_path !== r.image_path ? old.image_path : null, old.file_path !== r.file_path ? old.file_path : null]);
    res.json({ data: { id: req.params.id } });
  } catch (e) { next(e); }
});

router.patch('/:id', validate(awardInput.pick({ isPublished: true })), async (req, res, next) => {
  try {
    const { error } = await supabase.from('awards').update({ is_published: req.body.isPublished }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { data: old } = await supabase.from('awards').select('image_path, file_path').eq('id', req.params.id).maybeSingle();
    const { error } = await supabase.from('awards').delete().eq('id', req.params.id);
    if (error) throw error;
    await removeFiles([old?.image_path, old?.file_path]);
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

export default router;
