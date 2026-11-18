-- =========================================
-- Extensiones y tipos
-- =========================================
create extension if not exists "pgcrypto";

create type order_status as enum ('nuevo','confirmado','en_preparacion','entregado','cancelado');
create type delivery_method as enum ('domicilio','recoger_en_tienda');
create type comment_status as enum ('pendiente','aprobado','rechazado');
create type reaction_type as enum ('me_gusta','me_encanta','delicioso');

-- Función genérica para updated_at
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

-- =========================================
-- Administración
-- =========================================
create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

create table store_settings (
  id smallint primary key default 1 check (id = 1),
  store_name text not null default 'Mi Chocolatería',
  whatsapp_number text not null,            -- formato internacional sin +: 573001234567
  delivery_fee integer not null default 0,
  free_delivery_from integer,               -- null = nunca gratis
  address text,
  opening_hours jsonb not null default '[]', -- [{"day":"Lun-Vie","hours":"8:00-19:00"}]
  instagram_url text,
  facebook_url text,
  maps_embed_url text,
  order_message_footer text default '¡Gracias por tu pedido!',
  updated_at timestamptz not null default now()
);
create trigger trg_settings_updated before update on store_settings
  for each row execute function set_updated_at();

create table about_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  image_url text,
  sort_order int not null default 0
);

-- =========================================
-- Catálogo
-- =========================================
create table catalogs (
  slug text primary key,                     -- 'snacks' | 'canasta-familiar' | 'industrial'
  name text not null,
  tagline text,
  description text,
  cover_url text,
  accent text not null default 'caramelo',
  sort_order int not null default 0
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  catalog_slug text not null references catalogs(slug) on delete cascade,
  name text not null,
  slug text not null,
  sort_order int not null default 0,
  unique (catalog_slug, slug)
);

create table products (
  id uuid primary key default gen_random_uuid(),
  catalog_slug text not null references catalogs(slug),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  ingredients text,
  allergens text,
  unit_label text not null default 'unidad',  -- 'caja x12', '500 g', etc.
  price_cop integer check (price_cop >= 0),
  compare_at_price_cop integer,
  price_on_request boolean not null default false, -- industrial: "precio a convenir"
  min_qty integer not null default 1 check (min_qty >= 1),
  is_active boolean not null default true,
  is_available boolean not null default true,      -- false = "agotado"
  is_featured boolean not null default false,
  tags text[] not null default '{}',               -- {'sin-azucar','vegano'}
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint price_required check (price_on_request or price_cop is not null)
);
create index on products (catalog_slug, is_active);
create index on products (category_id);
create trigger trg_products_updated before update on products
  for each row execute function set_updated_at();

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  path text not null,       -- ruta en Storage, para poder borrarla
  alt text,
  sort_order int not null default 0
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  name text not null,
  price_cop integer not null check (price_cop >= 0),
  is_active boolean not null default true,
  sort_order int not null default 0
);

-- =========================================
-- Foro
-- =========================================
create table posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references auth.users(id),
  body text,
  is_published boolean not null default true,
  is_pinned boolean not null default false,
  allow_comments boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on posts (is_published, is_pinned desc, created_at desc);
create trigger trg_posts_updated before update on posts
  for each row execute function set_updated_at();

create table post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  url text not null,
  path text not null,
  width int,
  height int,
  sort_order int not null default 0
);

create table post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  visitor_id text not null,     -- UUID generado en el navegador
  type reaction_type not null default 'me_gusta',
  created_at timestamptz not null default now(),
  unique (post_id, visitor_id)
);

create table post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 60),
  body text not null check (char_length(body) between 1 and 1000),
  status comment_status not null default 'pendiente',
  ip_hash text,
  created_at timestamptz not null default now()
);
create index on post_comments (post_id, status, created_at);

-- =========================================
-- Pedidos
-- =========================================
create sequence order_code_seq start 1;

create table orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique
    default ('PED-' || lpad(nextval('order_code_seq')::text, 5, '0')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_document text,        -- cédula o NIT (obligatorio si hay productos industriales)
  company_name text,             -- para pedidos industriales
  delivery_method delivery_method not null,
  address text,
  neighborhood text,
  city text,
  preferred_date date,
  payment_method text not null,  -- 'efectivo' | 'transferencia' | 'otro'
  notes text,
  subtotal_cop integer not null,
  delivery_fee_cop integer not null default 0,
  total_cop integer not null,
  has_price_on_request boolean not null default false,
  status order_status not null default 'nuevo',
  whatsapp_message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on orders (status, created_at desc);
create trigger trg_orders_updated before update on orders
  for each row execute function set_updated_at();

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  catalog_slug text not null,
  product_name text not null,
  variant_name text,
  unit_label text,
  unit_price_cop integer,        -- null si es "precio a convenir"
  quantity integer not null check (quantity > 0),
  line_total_cop integer
);

-- =========================================
-- Seguridad (RLS)
-- El backend usa service_role y salta RLS.
-- Estas políticas protegen la base si alguien usa la anon key directamente.
-- =========================================
alter table admins           enable row level security;
alter table store_settings   enable row level security;
alter table about_sections   enable row level security;
alter table catalogs         enable row level security;
alter table categories       enable row level security;
alter table products         enable row level security;
alter table product_images   enable row level security;
alter table product_variants enable row level security;
alter table posts            enable row level security;
alter table post_media       enable row level security;
alter table post_reactions   enable row level security;
alter table post_comments    enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;

-- Lectura pública solo de lo visible
create policy "public read catalogs"   on catalogs       for select using (true);
create policy "public read categories" on categories     for select using (true);
create policy "public read products"   on products       for select using (is_active);
create policy "public read images"     on product_images for select using (true);
create policy "public read variants"   on product_variants for select using (is_active);
create policy "public read posts"      on posts          for select using (is_published);
create policy "public read media"      on post_media     for select using (true);
create policy "public read settings"   on store_settings for select using (true);
create policy "public read about"      on about_sections for select using (true);
create policy "public read comments"   on post_comments  for select using (status = 'aprobado');

-- Un admin puede leerse a sí mismo (el frontend lo usa para saber si mostrar el panel)
create policy "admin self read" on admins for select using (user_id = auth.uid());
-- orders, order_items y post_reactions: sin políticas = solo el backend accede.

-- =========================================
-- Datos iniciales
-- =========================================
insert into catalogs (slug, name, tagline, accent, sort_order) values
 ('snacks', 'Snacks', 'Antojos artesanales para cualquier momento', 'oro', 2),
 ('canasta-familiar', 'Canasta familiar', 'Chocolate de calidad para el hogar', 'bosque', 1),
 ('industrial', 'Industrial', 'Regalos y pedidos para empresas y eventos', 'ink', 3);

insert into store_settings (whatsapp_number) values ('570000000000'); -- reemplazar

-- =========================================
-- Buckets de Storage (públicos, 5 MB, solo imágenes)
-- Equivale a crearlos en Supabase → Storage. Sin políticas de escritura para anon:
-- las subidas se hacen con URL firmada que genera el backend.
-- =========================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('products', 'products', true, 5242880, array['image/webp','image/jpeg','image/png']),
  ('posts',    'posts',    true, 5242880, array['image/webp','image/jpeg','image/png']),
  ('catalogs', 'catalogs', true, 5242880, array['image/webp','image/jpeg','image/png'])
on conflict (id) do nothing;


-- Correo de contacto de la tienda
alter table store_settings add column if not exists email text;

-- =========================================
-- PQR (peticiones, quejas, reclamos, sugerencias y felicitaciones)
-- Sin políticas RLS: solo el backend accede.
-- =========================================
create table if not exists pqr (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('PQR-' || lpad(floor(random()*100000)::int::text, 5, '0')),
  type text not null check (type in ('peticion','queja','reclamo','sugerencia','felicitacion')),
  name text not null check (char_length(name) between 2 and 80),
  phone text,
  email text,
  body text not null check (char_length(body) between 10 and 2000),
  status text not null default 'nuevo' check (status in ('nuevo','en_proceso','resuelto')),
  created_at timestamptz not null default now()
);
create index if not exists pqr_status_created_idx on pqr (status, created_at desc);
alter table pqr enable row level security;

-- =========================================
-- Planta de producción: mismos datos que la tienda (punto físico).
-- Se puede ejecutar varias veces sin problema.
-- =========================================
alter table store_settings add column if not exists plant_whatsapp_number text;
alter table store_settings add column if not exists plant_email text;
alter table store_settings add column if not exists plant_address text;
alter table store_settings add column if not exists plant_opening_hours jsonb not null default '[]';
update store_settings set
  plant_whatsapp_number = coalesce(plant_whatsapp_number, '573132584586'),
  plant_address = coalesce(plant_address, 'Calle 5C #53D-57, piso 3, barrio Gala, Bogotá'),
  plant_opening_hours = case when plant_opening_hours = '[]'::jsonb
    then '[{"day":"Lunes a viernes","hours":"8:00 a. m. – 5:00 p. m."}]'::jsonb else plant_opening_hours end
where id = 1;
-- Opcional: datos de la tienda (punto físico). Quita los "--" para aplicarlos.
update store_settings set whatsapp_number = '573025556304',
address = 'Calle 60 #57-22, local 104, Centro Comercial Quirinal, Bogotá',
opening_hours = '[{"day":"Lunes a sábado","hours":"10:00 a. m. – 7:00 p. m."},{"day":"Domingos","hours":"10:00 a. m. – 6:00 p. m."}]'::jsonb
where id = 1;

-- =========================================
-- Entrevistas: usan la misma tabla del blog (posts) con kind = 'entrevista'.
-- Se puede ejecutar varias veces sin problema.
-- =========================================
alter table posts add column if not exists kind text not null default 'publicacion';
alter table posts add column if not exists title text;
alter table posts add column if not exists video_url text;
do $$ begin
  alter table posts add constraint posts_kind_check check (kind in ('publicacion','entrevista'));
exception when duplicate_object then null; end $$;
create index if not exists posts_kind_feed_idx on posts (kind, is_published, is_pinned desc, created_at desc);

-- =========================================
-- Reconocimientos: un PDF (o imagen) por reconocimiento + la imagen de su primera página.
-- =========================================
create table if not exists awards (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 160),
  issuer text,
  year text,
  description text,
  image_url text not null,   -- miniatura (primera página del PDF)
  image_path text not null,
  width int,
  height int,
  file_url text,             -- PDF original (null si se subió solo una imagen)
  file_path text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists awards_order_idx on awards (is_published, sort_order, created_at desc);
alter table awards enable row level security;
do $$ begin
  create policy "public read awards" on awards for select using (is_published);
exception when duplicate_object then null; end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('awards', 'awards', true, 15728640, array['application/pdf','image/webp','image/jpeg','image/png'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

-- =========================================
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
  ('Tucán', 'Aves', 'El tucán, sembrador del bosque', 'Su gran pico colorido no es solo adorno: le sirve para alcanzar frutos en las ramas más delgadas, donde su cuerpo no llegaría.
Al comer frutos y desplazarse de árbol en árbol, el tucán va dejando semillas por el camino y ayuda a que el bosque se renueve. Verlo cerca de los cultivos es señal de un territorio vivo y bien cuidado.
Por eso cultivamos el cacao de forma orgánica y agroecológica: para que aves como él sigan siendo parte del paisaje.', '/photos/tucan.webp', 'seed/tucan', 720, 1440, 0),
  ('Búho', 'Aves', 'El búho, guardián de la noche', 'Mientras el campo descansa, el búho trabaja. Con su vuelo silencioso y su vista de noche, vigila los cultivos y se alimenta de roedores que, de otro modo, dañarían las mazorcas de cacao.
Es un aliado del agricultor: cuida la cosecha sin necesidad de venenos.
Esa es la idea detrás de la agroecología: dejar que la naturaleza haga parte del trabajo.', '/photos/buho.webp', 'seed/buho', 1200, 1600, 1),
  ('Armadillo', 'Fauna', 'El armadillo, arquitecto del suelo', 'Discreto y de hábitos nocturnos, el armadillo recorre el monte buscando insectos y larvas. Al escarbar, remueve y airea la tierra, y esos huecos terminan sirviendo de refugio a otros animales.
Un suelo vivo y suelto es la base de un buen cacao. Cuando el armadillo aparece, el terreno está sano.
Cuidar su hogar es cuidar la tierra de donde sale nuestro chocolate.', '/photos/armadillo.webp', 'seed/armadillo', 709, 945, 2),
  ('Ardilla', 'Fauna', 'La ardilla, vecina de las ramas', 'Ágil y curiosa, la ardilla se mueve por las copas de los árboles de la finca desde la mañana temprano. Entierra y olvida semillas, y así, sin proponérselo, siembra árboles nuevos.
Convivir con la fauna silvestre es parte de nuestra forma de producir: el cacao crece a la sombra de otros árboles y comparte el espacio con quienes ya vivían allí.', '/photos/ardilla.webp', 'seed/ardilla', 880, 1186, 3),
  ('Urraca', 'Aves', 'La urraca, la voz del monte', 'Inteligente y sociable, la urraca vive en grupos y es de las primeras en anunciar el día con su canto. Su presencia delata un bosque con buena comida y refugio.
Como ella, los agricultores de Santander trabajan en comunidad: se ayudan, se avisan y comparten la cosecha. Esa unión es la que queremos reconocer con cada barra de chocolate.', '/photos/urraca.webp', 'seed/urraca', 960, 1280, 4),
  ('Caballos', 'Paisaje', 'Los caballos, compañeros de trabajo', 'En las montañas de Santander hay caminos por donde los vehículos no llegan, y allí el caballo sigue siendo un compañero de trabajo: baja la cosecha, sube los insumos y acompaña a la familia campesina.
Cada grano de cacao que llega a nuestra planta empieza su viaje en un recorrido como este, entre potreros y senderos de monte.', '/photos/caballos.webp', 'seed/caballos', 1193, 896, 5),
  ('La casa', 'Paisaje', 'La casa, donde empieza todo', 'Casas como esta, entre cultivos y montaña, son el punto de partida de nuestra historia. En Landázuri, Santander, tierra de tradición cacaotera y de nuestro fundador, las familias han vivido del cacao por generaciones.
De allí viene la idea de ZURYCH: comprar directamente a los productores, reducir intermediarios y pagar de forma más justa por su trabajo.', '/photos/casa-montana.webp', 'seed/casa-montana', 1156, 671, 6),
  ('La iglesia', 'Paisaje', 'La iglesia, el centro del pueblo', 'En los pueblos cacaoteros, la iglesia y la plaza son el lugar de encuentro: allí se reúnen las familias, se cierran los tratos y se celebran las fiestas de la comunidad.
Cuando hablamos de comercio justo hablamos de esto: de relaciones cercanas, de conocer a quien cultiva y de que el trabajo del campo tenga el reconocimiento que merece.', '/photos/iglesia.webp', 'seed/iglesia', 1600, 1056, 7)
) as v(name, tag, title, story, image_url, image_path, width, height, sort_order)
where not exists (select 1 from land_tiles);
