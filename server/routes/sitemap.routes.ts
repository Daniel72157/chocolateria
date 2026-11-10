import { Router } from 'express';
import { supabase, isDemo } from '../lib/supabase.js';
import * as seed from '../../shared/seed.js';

const router = Router();
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

router.get('/sitemap.xml', async (_req, res, next) => {
  try {
    const site = (process.env.VITE_SITE_URL ?? process.env.ALLOWED_ORIGIN?.split(',')[0] ?? '').replace(/\/$/, '');
    let slugs: string[]; let postIds: string[];
    if (isDemo) { slugs = seed.products.map((p) => p.slug); postIds = seed.posts.map((p) => p.id); }
    else {
      const [{ data: p }, { data: q }] = await Promise.all([
        supabase.from('products').select('slug').eq('is_active', true),
        supabase.from('posts').select('id').eq('is_published', true),
      ]);
      slugs = (p ?? []).map((x) => x.slug); postIds = (q ?? []).map((x) => x.id);
    }
    const paths = ['/', '/tienda', '/tienda/snacks', '/tienda/canasta-familiar', '/tienda/industrial', '/donde-encontrarnos', '/blog',
      ...slugs.map((s) => `/producto/${s}`), ...postIds.map((i) => `/blog/${i}`)];
    res.type('application/xml').set('Cache-Control', 'public, s-maxage=3600').send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${esc(site + p)}</loc></url>`).join('\n')}\n</urlset>`,
    );
  } catch (e) { next(e); }
});

export default router;
