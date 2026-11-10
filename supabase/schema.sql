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
