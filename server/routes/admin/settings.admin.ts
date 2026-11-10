import { Router } from 'express';
import { supabase } from '../../lib/supabase.js';
import { validate } from '../../middleware/validate.js';
import { aboutInput, catalogInput, settingsInput } from '../../../shared/schemas.js';

const router = Router();

router.get('/stats', async (_req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }) + 'T00:00:00-05:00');
    const weekAgo = new Date(startOfDay.getTime() - 6 * 86400_000);
    const [{ data: week }, { count: pending }, { data: prods }, { data: latest }] = await Promise.all([
      supabase.from('orders').select('total_cop, created_at, status').gte('created_at', weekAgo.toISOString()),
      supabase.from('post_comments').select('id', { count: 'exact', head: true }).eq('status', 'pendiente'),
      supabase.from('products').select('catalog_slug').eq('is_active', true),
      supabase.from('orders').select('id, code, customer_name, total_cop, status, created_at').order('created_at', { ascending: false }).limit(5),
    ]);
    const valid = (week ?? []).filter((o) => o.status !== 'cancelado');
    const activeProducts: Record<string, number> = {};
    for (const p of prods ?? []) activeProducts[p.catalog_slug] = (activeProducts[p.catalog_slug] ?? 0) + 1;
    res.json({
      data: {
        ordersToday: valid.filter((o) => new Date(o.created_at) >= startOfDay).length,
        ordersWeek: valid.length,
        weekValue: valid.reduce((s, o) => s + o.total_cop, 0),
        pendingComments: pending ?? 0, activeProducts, latestOrders: latest ?? [],
      },
    });
  } catch (e) { next(e); }
});

router.put('/settings', validate(settingsInput), async (req, res, next) => {
  try {
    const s = req.body;
    const { error } = await supabase.from('store_settings').update({
      store_name: s.storeName, whatsapp_number: s.whatsappNumber, email: s.email || null, delivery_fee: s.deliveryFee, free_delivery_from: s.freeDeliveryFrom,
      address: s.address || null, opening_hours: s.openingHours, instagram_url: s.instagramUrl || null, facebook_url: s.facebookUrl || null,
      maps_embed_url: s.mapsEmbedUrl || null, order_message_footer: s.orderMessageFooter || null,
    }).eq('id', 1);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

router.put('/about', validate(aboutInput), async (req, res, next) => {
  try {
    const sections = req.body.sections as { id?: string; title: string; body: string; imageUrl?: string | null }[];
    const { data: old } = await supabase.from('about_sections').select('id');
    const keep = new Set(sections.map((s) => s.id).filter(Boolean));
    const drop = (old ?? []).map((o) => o.id).filter((id) => !keep.has(id));
    if (drop.length) await supabase.from('about_sections').delete().in('id', drop);
    for (const [n, s] of sections.entries()) {
      const row = { title: s.title, body: s.body, image_url: s.imageUrl ?? null, sort_order: n };
      const { error } = s.id ? await supabase.from('about_sections').update(row).eq('id', s.id) : await supabase.from('about_sections').insert(row);
      if (error) throw error;
    }
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

router.put('/catalogs/:slug', validate(catalogInput), async (req, res, next) => {
  try {
    const c = req.body;
    const { error } = await supabase.from('catalogs').update({ name: c.name, tagline: c.tagline ?? null, description: c.description ?? null, cover_url: c.coverUrl ?? null }).eq('slug', req.params.slug);
    if (error) throw error;
    res.json({ data: { ok: true } });
  } catch (e) { next(e); }
});

export default router;
