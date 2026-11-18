// Genera el SQL de "Nuestra tierra" (tabla + datos iniciales) a partir de shared/land.ts. Uso: npx tsx scripts/make-land-sql.ts
import { LAND_SEED } from '../shared/land.js';

const q = (s: string | number) => (typeof s === 'number' ? String(s) : `'${s.replace(/'/g, "''")}'`);
const rows = LAND_SEED.map((t, i) =>
  `  (${q(t.name)}, ${q(t.tag ?? '')}, ${q(t.title ?? '')}, ${q(t.story ?? '')}, ${q(`/photos/${t.img}.webp`)}, ${q(`seed/${t.img}`)}, ${t.width}, ${t.height}, ${i})`).join(',\n');

console.log(`-- =========================================
-- Nuestra tierra (inicio): fotos con su historia, editables desde el panel.
-- Se puede ejecutar varias veces: los datos iniciales solo se insertan si la tabla está vacía.
-- =========================================
create table if not exists land_tiles (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  tag text,
  title text,
  story text,
  image_url text not null,
  image_path text not null,   -- ruta en Storage ('seed/...' = foto de ejemplo del sitio)
  width int,
  height int,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists land_tiles_order_idx on land_tiles (is_published, sort_order);
alter table land_tiles enable row level security;
do $$ begin
  create policy "public read land" on land_tiles for select using (is_published);
exception when duplicate_object then null; end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('land', 'land', true, 5242880, array['image/webp','image/jpeg','image/png'])
on conflict (id) do nothing;

insert into land_tiles (name, tag, title, story, image_url, image_path, width, height, sort_order)
select * from (values
${rows}
) as v(name, tag, title, story, image_url, image_path, width, height, sort_order)
where not exists (select 1 from land_tiles);`);
