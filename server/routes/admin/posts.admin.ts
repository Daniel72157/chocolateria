import { Router } from 'express';
import { supabase } from '../../lib/supabase.js';
import { validate } from '../../middleware/validate.js';
import { postInput, type PostInput } from '../../../shared/schemas.js';

const router = Router();
const SELECT = 'id, body, is_published, is_pinned, allow_comments, created_at, post_media(url, path, width, height, sort_order)';

async function saveMedia(postId: string, p: PostInput) {
  const { data: old } = await supabase.from('post_media').select('path').eq('post_id', postId);
  const keep = new Set(p.media.map((m) => m.path));
  const stale = (old ?? []).map((o) => o.path).filter((x) => !keep.has(x) && !x.startsWith('seed/'));
  await supabase.from('post_media').delete().eq('post_id', postId);
  if (p.media.length) {
    const { error } = await supabase.from('post_media').insert(p.media.map((m, n) => ({ post_id: postId, url: m.url, path: m.path, width: m.width ?? null, height: m.height ?? null, sort_order: n })));
    if (error) throw error;
  }
  if (stale.length) await supabase.storage.from('posts').remove(stale);
}

router.get('/', async (_req, res, next) => {
  try {
    const { data, error } = await supabase.from('posts').select(SELECT).order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    if (error) throw error;
    const ids = data.map((p) => p.id);
    const [{ data: reacts }, { data: coms }] = await Promise.all([
      supabase.from('post_reactions').select('post_id').in('post_id', ids),
      supabase.from('post_comments').select('post_id, status').in('post_id', ids),
    ]);
    res.json({
      data: data.map((p) => ({
        ...p, post_media: [...p.post_media].sort((a, b) => a.sort_order - b.sort_order),
        reactionCount: reacts?.filter((r) => r.post_id === p.id).length ?? 0,
        commentCount: coms?.filter((c) => c.post_id === p.id && c.status === 'aprobado').length ?? 0,
        pendingCount: coms?.filter((c) => c.post_id === p.id && c.status === 'pendiente').length ?? 0,
      })),
    });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('posts').select(SELECT).eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: { code: 'not_found', message: 'Publicación no encontrada' } });
    res.json({ data: { ...data, post_media: [...data.post_media].sort((a, b) => a.sort_order - b.sort_order) } });
  } catch (e) { next(e); }
});

router.post('/', validate(postInput), async (req, res, next) => {
  try {
    const p = req.body as PostInput;
    const { data, error } = await supabase.from('posts').insert({
      author_id: res.locals.admin.user_id, body: p.body ?? null, is_published: p.isPublished, is_pinned: p.isPinned, allow_comments: p.allowComments,
    }).select('id').single();
    if (error) throw error;
    await saveMedia(data.id, p);
    res.status(201).json({ data: { id: data.id } });
  } catch (e) { next(e); }
});

router.put('/:id', validate(postInput), async (req, res, next) => {
  try {
    const p = req.body as PostInput;
    const { error } = await supabase.from('posts').update({ body: p.body ?? null, is_published: p.isPublished, is_pinned: p.isPinned, allow_comments: p.allowComments }).eq('id', req.params.id);
    if (error) throw error;
    await saveMedia(req.params.id, p);
    res.json({ data: { id: req.params.id } });
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { data: media } = await supabase.from('post_media').select('path').eq('post_id', req.params.id);
    const paths = (media ?? []).map((m) => m.path).filter((p) => !p.startsWith('seed/'));
    if (paths.length) await supabase.storage.from('posts').remove(paths);
    const { error } = await supabase.from('posts').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

export default router;
