import { Router } from 'express';
import { createHash } from 'node:crypto';
import { supabase } from '../lib/supabase.js';
import { validate } from '../middleware/validate.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { commentInput, reactionDelete, reactionInput } from '../../shared/schemas.js';

const router = Router();
const PAGE = 10;
const countBy = <T extends Record<string, any>>(rows: T[], key: keyof T) =>
  rows.reduce<Record<string, number>>((acc, r) => { acc[r[key]] = (acc[r[key]] ?? 0) + 1; return acc; }, {});

router.get('/', async (req, res, next) => {
  try {
    const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : null; // created_at ISO
    const visitorId = typeof req.query.visitorId === 'string' ? req.query.visitorId : null;
    let q = supabase
      .from('posts')
      .select('id, body, is_pinned, allow_comments, created_at, post_media(url, width, height, sort_order)')
      .eq('is_published', true)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(PAGE + 1);
    if (cursor) q = q.eq('is_pinned', false).lt('created_at', cursor);
    const { data, error } = await q;
    if (error) throw error;

    const page = data.slice(0, PAGE);
    const ids = page.map((p) => p.id);
    const [{ data: reactions }, { data: comments }] = await Promise.all([
      supabase.from('post_reactions').select('post_id, type, visitor_id').in('post_id', ids),
      supabase.from('post_comments').select('post_id').in('post_id', ids).eq('status', 'aprobado'),
    ]);

    const items = page.map((p) => ({
      ...p,
      post_media: [...p.post_media].sort((a, b) => a.sort_order - b.sort_order),
      reactionCounts: countBy(reactions?.filter((r) => r.post_id === p.id) ?? [], 'type'),
      commentCount: comments?.filter((c) => c.post_id === p.id).length ?? 0,
      myReaction: visitorId ? (reactions?.find((r) => r.post_id === p.id && r.visitor_id === visitorId)?.type ?? null) : null,
    }));
    res.json({ data: { items, nextCursor: data.length > PAGE ? page.at(-1)!.created_at : null } });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const visitorId = typeof req.query.visitorId === 'string' ? req.query.visitorId : null;
    const { data: p, error } = await supabase
      .from('posts')
      .select('id, body, is_pinned, allow_comments, created_at, post_media(url, width, height, sort_order)')
      .eq('id', req.params.id).eq('is_published', true).maybeSingle();
    if (error) throw error;
    if (!p) return res.status(404).json({ error: { code: 'not_found', message: 'Publicación no encontrada' } });
    const [{ data: reactions }, { data: comments }] = await Promise.all([
      supabase.from('post_reactions').select('type, visitor_id').eq('post_id', p.id),
      supabase.from('post_comments').select('id, author_name, body, created_at').eq('post_id', p.id).eq('status', 'aprobado').order('created_at'),
    ]);
    res.json({
      data: {
        ...p,
        post_media: [...p.post_media].sort((a, b) => a.sort_order - b.sort_order),
        reactionCounts: countBy(reactions ?? [], 'type'),
        commentCount: comments?.length ?? 0,
        myReaction: visitorId ? (reactions?.find((r) => r.visitor_id === visitorId)?.type ?? null) : null,
        comments: comments ?? [],
      },
    });
  } catch (e) { next(e); }
});

router.post('/:id/reactions', validate(reactionInput), async (req, res, next) => {
  try {
    const { visitorId, type } = req.body;
    const { error } = await supabase.from('post_reactions').upsert({ post_id: req.params.id, visitor_id: visitorId, type }, { onConflict: 'post_id,visitor_id' });
    if (error) throw error;
    res.status(201).json({ data: { ok: true } });
  } catch (e) { next(e); }
});

router.delete('/:id/reactions', validate(reactionDelete), async (req, res, next) => {
  try {
    const { error } = await supabase.from('post_reactions').delete().eq('post_id', req.params.id).eq('visitor_id', req.body.visitorId);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

router.post('/:id/comments', writeLimiter, validate(commentInput), async (req, res, next) => {
  try {
    if (req.body.website) return res.status(400).json({ error: { code: 'spam', message: 'Solicitud inválida' } });
    const { data: post } = await supabase.from('posts').select('id, allow_comments').eq('id', req.params.id).eq('is_published', true).maybeSingle();
    if (!post) return res.status(404).json({ error: { code: 'not_found', message: 'Publicación no encontrada' } });
    if (!post.allow_comments) return res.status(403).json({ error: { code: 'comments_closed', message: 'Esta publicación no admite comentarios' } });
    const ip_hash = createHash('sha256').update(`${req.ip}${process.env.IP_HASH_SALT ?? ''}`).digest('hex');
    const { error } = await supabase.from('post_comments').insert({
      post_id: post.id, author_name: req.body.authorName, body: req.body.body, status: 'pendiente', ip_hash,
    });
    if (error) throw error;
    res.status(201).json({ data: { ok: true, message: 'Gracias, tu comentario se publicará cuando lo revisemos' } });
  } catch (e) { next(e); }
});

export default router;
