// Genera supabase/seed.sql con los datos de ejemplo de shared/seed.ts. Ejecutar: npm run seed:sql
import { writeFileSync } from 'node:fs';
import * as s from '../shared/seed.js';

const q = (v: string | null | undefined) => (v == null ? 'null' : `'${v.replace(/'/g, "''")}'`);
const n = (v: number | null | undefined) => (v == null ? 'null' : String(v));
const b = (v: boolean) => (v ? 'true' : 'false');
const out: string[] = ['-- Datos de ejemplo (contenido de muestra). Ejecutar DESPUÉS de schema.sql.', 'begin;', ''];

out.push('-- Ajustes de la tienda (reemplaza el número de WhatsApp por el real)');
out.push(`update store_settings set store_name=${q(s.settings.store_name)}, whatsapp_number=${q(s.settings.whatsapp_number)}, email=${q(s.settings.email)}, delivery_fee=${n(s.settings.delivery_fee)}, free_delivery_from=${n(s.settings.free_delivery_from)}, address=${q(s.settings.address)}, opening_hours=${q(JSON.stringify(s.settings.opening_hours))}::jsonb, order_message_footer=${q(s.settings.order_message_footer)} where id=1;`, '');

out.push('-- Catálogos');
for (const c of s.catalogs) out.push(`update catalogs set name=${q(c.name)}, tagline=${q(c.tagline)}, description=${q(c.description)}, cover_url=${q(c.cover_url)}, accent=${q(c.accent)}, sort_order=${c.sort_order} where slug=${q(c.slug)};`);
out.push('', '-- Categorías');
for (const c of s.categories) out.push(`insert into categories (id, catalog_slug, name, slug, sort_order) values (${q(c.id)}, ${q(c.catalog_slug)}, ${q(c.name)}, ${q(c.slug)}, ${c.sort_order}) on conflict do nothing;`);

out.push('', '-- Productos, imágenes y presentaciones');
for (const p of s.products) {
  out.push(`insert into products (id, catalog_slug, category_id, name, slug, short_description, description, ingredients, allergens, unit_label, price_cop, compare_at_price_cop, price_on_request, min_qty, is_active, is_available, is_featured, tags, sort_order) values (${q(p.id)}, ${q(p.catalog_slug)}, ${q(p.category_id)}, ${q(p.name)}, ${q(p.slug)}, ${q(p.short_description)}, ${q(p.description)}, ${q(p.ingredients)}, ${q(p.allergens)}, ${q(p.unit_label)}, ${n(p.price_cop)}, ${n(p.compare_at_price_cop)}, ${b(p.price_on_request)}, ${p.min_qty}, ${b(p.is_active)}, ${b(p.is_available)}, ${b(p.is_featured)}, array[${p.tags.map(q).join(',')}]::text[], ${p.sort_order}) on conflict do nothing;`);
  for (const i of p.product_images) out.push(`insert into product_images (product_id, url, path, alt, sort_order) values (${q(p.id)}, ${q(i.url)}, ${q(i.path)}, ${q(i.alt)}, ${i.sort_order});`);
  for (const v of p.product_variants) out.push(`insert into product_variants (id, product_id, name, price_cop, sort_order) values (${q(v.id)}, ${q(p.id)}, ${q(v.name)}, ${v.price_cop}, ${v.sort_order}) on conflict do nothing;`);
}

out.push('', '-- Comunidad');
for (const p of s.posts) {
  out.push(`insert into posts (id, body, is_pinned, created_at) values (${q(p.id)}, ${q(p.body)}, ${b(p.is_pinned)}, ${q(p.created_at)}) on conflict do nothing;`);
  for (const m of p.post_media) out.push(`insert into post_media (post_id, url, path, width, height, sort_order) values (${q(p.id)}, ${q(m.url)}, ${q('seed' + m.url)}, ${n(m.width)}, ${n(m.height)}, ${m.sort_order});`);
}
for (const c of s.comments) out.push(`insert into post_comments (id, post_id, author_name, body, status, created_at) values (${q(c.id)}, ${q(s.commentPostMap[c.id])}, ${q(c.author_name)}, ${q(c.body)}, 'aprobado', ${q(c.created_at)}) on conflict do nothing;`);

out.push('', '-- Página Nosotros');
for (const a of s.about) out.push(`insert into about_sections (id, title, body, image_url, sort_order) values (${q(a.id)}, ${q(a.title)}, ${q(a.body)}, ${q(a.image_url)}, ${a.sort_order}) on conflict do nothing;`);

out.push('', 'commit;');
writeFileSync('supabase/seed.sql', out.join('\n') + '\n');
console.log('supabase/seed.sql escrito:', out.length, 'líneas');
