import type { CatalogSlug } from './schemas.js';

export type { CatalogSlug };
export type OrderStatus = 'nuevo' | 'confirmado' | 'en_preparacion' | 'entregado' | 'cancelado';
export type ReactionType = 'me_gusta' | 'me_encanta' | 'delicioso';
export type CommentStatus = 'pendiente' | 'aprobado' | 'rechazado';

export type Catalog = {
  slug: CatalogSlug;
  name: string;
  tagline: string | null;
  description: string | null;
  cover_url: string | null;
  accent: 'oro' | 'bosque' | 'ink';
  sort_order: number;
  categories: Category[];
};
export type Category = { id: string; catalog_slug: CatalogSlug; name: string; slug: string; sort_order: number };
export type ProductImage = { id?: string; url: string; path: string; alt: string | null; sort_order: number };
export type ProductVariant = { id: string; name: string; price_cop: number; is_active: boolean; sort_order: number };
export type Product = {
  id: string;
  catalog_slug: CatalogSlug;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  ingredients: string | null;
  allergens: string | null;
  unit_label: string;
  price_cop: number | null;
  compare_at_price_cop: number | null;
  price_on_request: boolean;
  min_qty: number;
  is_active: boolean;
  is_available: boolean;
  is_featured: boolean;
  tags: string[];
  sort_order: number;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  created_at?: string;
};
export type ProductPage = { items: Product[]; page: number; total: number; pageSize: number };

export type PostMedia = { url: string; width: number | null; height: number | null; sort_order: number };
export type Post = {
  id: string;
  body: string | null;
  is_pinned: boolean;
  allow_comments?: boolean;
  is_published?: boolean;
  created_at: string;
  post_media: PostMedia[];
  reactionCounts: Partial<Record<ReactionType, number>>;
  commentCount: number;
  myReaction?: ReactionType | null;
};
export type PostFeed = { items: Post[]; nextCursor: string | null };
export type PostComment = { id: string; author_name: string; body: string; created_at: string; status?: CommentStatus };
export type PostDetail = Post & { comments: PostComment[] };

export type OpeningHour = { day: string; hours: string };
export type StoreSettings = {
  store_name: string;
  whatsapp_number: string;
  email: string | null;
  delivery_fee: number;
  free_delivery_from: number | null;
  address: string | null;
  opening_hours: OpeningHour[];
  instagram_url: string | null;
  facebook_url: string | null;
  maps_embed_url: string | null;
  order_message_footer: string | null;
};
export type AboutSection = { id: string; title: string; body: string; image_url: string | null; sort_order: number };

export type OrderRow = {
  id: string;
  code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_document: string | null;
  company_name: string | null;
  delivery_method: 'domicilio' | 'recoger_en_tienda';
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  preferred_date: string | null;
  payment_method: string;
  notes: string | null;
  subtotal_cop: number;
  delivery_fee_cop: number;
  total_cop: number;
  has_price_on_request: boolean;
  status: OrderStatus;
  whatsapp_message: string;
  created_at: string;
  order_items?: {
    id: string;
    catalog_slug: string;
    product_name: string;
    variant_name: string | null;
    unit_price_cop: number | null;
    quantity: number;
    line_total_cop: number | null;
  }[];
};
export type AdminStats = {
  ordersToday: number;
  ordersWeek: number;
  weekValue: number;
  pendingComments: number;
  activeProducts: Record<string, number>;
  latestOrders: OrderRow[];
};
