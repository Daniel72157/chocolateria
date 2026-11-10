// MODO DEMO: sirve datos de ejemplo en memoria cuando no hay Supabase configurado.
// Permite ver y probar todo el sitio público (catálogos, carrito, pedido por WhatsApp, blog).
// Los cambios se pierden al reiniciar. El panel de administración requiere Supabase.
import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { writeLimiter } from '../middleware/rateLimit.js';
import { commentInput, orderInput, reactionDelete, reactionInput, type OrderInput } from '../../shared/schemas.js';
import * as seed from '../../shared/seed.js';
import type { Post, PostComment, ReactionType } from '../../shared/types.js';
import { PAYMENT_LABEL, priceOrder } from '../lib/orders.js';
import { buildOrderMessage, waLink } from '../lib/whatsapp.js';

const router = Router();
const PAGE_SIZE = 24;
let orderSeq = 0;

const comments: (PostComment & { post_id: string })[] = seed.comments.map((c) => ({ ...c, post_id: seed.commentPostMap[c.id] }));
const reactions = new Map<string, ReactionType>(); // `${postId}:${visitorId}`

const withMine = (p: Post, visitorId: string | null) => {
  const counts = { ...p.reactionCounts };
  const mine = visitorId ? (reactions.get(`${p.id}:${visitorId}`) ?? null) : null;
  for (const [k, t] of reactions) if (k.startsWith(`${p.id}:`)) counts[t] = (counts[t] ?? 0) + 1;
  return {
    ...p, reactionCounts: counts, myReaction: mine,
    commentCount: comments.filter((c) => c.post_id === p.id && c.status === 'aprobado').length + (p.commentCount - seed.comments.filter((c) => seed.commentPostMap[c.id] === p.id).length),
  };
};

router.get('/settings', (_req, res) => res.json({ data: seed.settings }));
router.get('/about', (_req, res) => res.json({ data: seed.about }));
router.get('/catalogs', (_req, res) => res.json({ data: seed.catalogs }));

router.get('/catalogs/:slug/products', (req, res) => {
  const slug = req.params.slug;
  if (!seed.catalogs.some((c) => c.slug === slug)) return res.status(404).json({ error: { code: 'not_found', message: 'Catálogo no encontrado' } });
  const page = Math.max(1, Number(req.query.page) || 1);
  const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
  const cat = typeof req.query.category === 'string' ? seed.categories.find((c) => c.catalog_slug === slug && c.slug === req.query.category) : null;
  let items = seed.products.filter((p) => p.catalog_slug === slug && p.is_active);
  if (req.query.category) items = cat ? items.filter((p) => p.category_id === cat.id) : [];
  if (q) items = items.filter((p) => p.name.toLowerCase().includes(q));
  const sort = String(req.query.sort ?? 'destacados');
  const price = (p: (typeof items)[number]) => p.price_cop ?? Number.MAX_SAFE_INTEGER;
  if (sort === 'precio-asc') items = [...items].sort((a, b) => price(a) - price(b));
  else if (sort === 'precio-desc') items = [...items].sort((a, b) => (b.price_cop ?? -1) - (a.price_cop ?? -1));
  else if (sort === 'nombre') items = [...items].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  else items = [...items].sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order);
  res.json({ data: { items: items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), page, total: items.length, pageSize: PAGE_SIZE } });
});

router.get('/products/featured', (_req, res) => res.json({ data: seed.products.filter((p) => p.is_featured && p.is_active).slice(0, 8) }));
router.get('/products/:slug', (req, res) => {
  const p = seed.products.find((x) => x.slug === req.params.slug && x.is_active);
  if (!p) return res.status(404).json({ error: { code: 'not_found', message: 'Producto no encontrado' } });
  res.json({ data: { ...p, related: seed.products.filter((x) => x.catalog_slug === p.catalog_slug && x.id !== p.id).slice(0, 4) } });
});

router.get('/posts', (req, res) => {
  const visitorId = typeof req.query.visitorId === 'string' ? req.query.visitorId : null;
  const cursor = typeof req.query.cursor === 'string' ? req.query.cursor : null;
  let list = [...seed.posts].sort((a, b) => Number(b.is_pinned) - Number(a.is_pinned) || b.created_at.localeCompare(a.created_at));
  if (cursor) list = list.filter((p) => !p.is_pinned && p.created_at < cursor);
  const page = list.slice(0, 10);
  res.json({ data: { items: page.map((p) => withMine(p, visitorId)), nextCursor: list.length > 10 ? page.at(-1)!.created_at : null } });
});
router.get('/posts/:id', (req, res) => {
  const p = seed.posts.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: { code: 'not_found', message: 'Publicación no encontrada' } });
  const visitorId = typeof req.query.visitorId === 'string' ? req.query.visitorId : null;
  res.json({ data: { ...withMine(p, visitorId), comments: comments.filter((c) => c.post_id === p.id && c.status === 'aprobado') } });
});
router.post('/posts/:id/reactions', validate(reactionInput), (req, res) => {
  reactions.set(`${req.params.id}:${req.body.visitorId}`, req.body.type);
  res.status(201).json({ data: { ok: true } });
});
router.delete('/posts/:id/reactions', validate(reactionDelete), (req, res) => {
  reactions.delete(`${req.params.id}:${req.body.visitorId}`);
  res.json({ data: { ok: true } });
});
router.post('/posts/:id/comments', writeLimiter, validate(commentInput), (req, res) => {
  if (req.body.website) return res.status(400).json({ error: { code: 'spam', message: 'Solicitud inválida' } });
  const post = seed.posts.find((x) => x.id === req.params.id);
  if (!post) return res.status(404).json({ error: { code: 'not_found', message: 'Publicación no encontrada' } });
  comments.push({ id: crypto.randomUUID(), post_id: post.id, author_name: req.body.authorName, body: req.body.body, created_at: new Date().toISOString(), status: 'pendiente' });
  res.status(201).json({ data: { ok: true, message: 'Gracias, tu comentario se publicará cuando lo revisemos' } });
});

router.post('/orders', writeLimiter, validate(orderInput), (req, res, next) => {
  try {
    const input = req.body as OrderInput;
    if (input.website) return res.status(400).json({ error: { code: 'spam', message: 'Solicitud inválida' } });
    const priced = priceOrder(input, seed.products as any, seed.settings);
    const code = `PED-${String(++orderSeq).padStart(5, '0')}`;
    const message = buildOrderMessage({
      code, createdAt: new Date(), customer: input.customer, deliveryText: priced.deliveryText, preferredDate: input.preferredDate,
      lines: priced.lines, subtotal: priced.subtotal, deliveryFee: priced.deliveryFee, total: priced.total,
      hasPriceOnRequest: priced.hasPriceOnRequest, paymentMethod: PAYMENT_LABEL[input.paymentMethod], notes: input.notes, footer: seed.settings.order_message_footer,
    });
    res.status(201).json({ data: { code, total: priced.total, whatsappUrl: waLink(seed.settings.whatsapp_number, message) } });
  } catch (e) { next(e); }
});

router.use('/admin', (_req, res) =>
  res.status(503).json({ error: { code: 'demo_mode', message: 'El panel de administración necesita Supabase. Configura las variables de entorno (.env).' } }),
);

export default router;
