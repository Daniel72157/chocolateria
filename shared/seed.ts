// Datos de ejemplo. Los usa el MODO DEMO de la API y el script que genera supabase/seed.sql.
// Todo el contenido es de muestra: reemplázalo por el real desde el panel de administración.
import { createHash } from 'node:crypto';
import type { AboutSection, Catalog, Category, Post, PostComment, Product, StoreSettings } from './types.js';

export const uid = (key: string) => {
  const h = createHash('sha1').update(key).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

export const settings: StoreSettings = {
  store_name: 'Chocolate Zurych',
  whatsapp_number: '573132584586',
  email: 'zurychrb@hotmail.com',
  delivery_fee: 0, // no hay dato de domicilio: se acuerda por WhatsApp
  free_delivery_from: null,
  address: 'Calle 5C # 53S-57, barrio Quirinal, Bogotá',
  opening_hours: [],
  instagram_url: null,
  facebook_url: null,
  maps_embed_url: null,
  order_message_footer: '¡Gracias por tu pedido!',
};

const catalogRows = [
  { slug: 'canasta-familiar', name: 'Canasta familiar', tagline: 'Chocolate artesanal para el hogar', description: 'Chocolate elaborado con cacao de agricultores de Santander, cultivado con prácticas orgánicas y agroecológicas.', accent: 'bosque', sort_order: 1, cover_url: '/photos/mujer-desayuno.webp' },
  { slug: 'snacks', name: 'Snacks', tagline: 'El cacao de otras formas', description: 'Derivados del cacao para disfrutar, como nuestro helado elaborado con mucílago, un componente del fruto que tradicionalmente se desperdicia.', accent: 'oro', sort_order: 2, cover_url: '/photos/postre-malteada.webp' },
  { slug: 'industrial', name: 'Industrial', tagline: 'Calidad y trazabilidad del cacao colombiano', description: 'Para empresas y mercados que valoran la calidad, la trazabilidad, la sostenibilidad y el origen de sus alimentos. Escríbenos y coordinamos tu pedido.', accent: 'ink', sort_order: 3, cover_url: '/photos/ciclista-brownie.webp' },
] as const;

const catRows: [string, string, string][] = [
  ['canasta-familiar', 'Chocolate artesanal', 'chocolate-artesanal'],
  ['snacks', 'Helados', 'helados'],
  ['industrial', 'Cacao y derivados', 'cacao-y-derivados'],
];
export const categories: Category[] = catRows.map(([catalog_slug, name, slug], i) => ({
  id: uid(`cat:${catalog_slug}:${slug}`), catalog_slug: catalog_slug as Category['catalog_slug'], name, slug, sort_order: i,
}));
const catId = (c: string, s: string) => categories.find((x) => x.catalog_slug === c && x.slug === s)!.id;

type P = {
  c: Product['catalog_slug']; cat: string; name: string; short: string; long: string; ing: string; all: string;
  unit: string; price: number | null; was?: number; req?: boolean; min?: number; feat?: boolean; out?: boolean;
  tags?: string[]; art: string; variants?: [string, number][];
};
const P: P[] = [
  { c: 'canasta-familiar', cat: 'chocolate-artesanal', name: 'Chocolate artesanal ZURYCH', short: 'Chocolate de cacao de agricultores de Santander.', long: 'Chocolate artesanal elaborado en nuestra planta de Bogotá con cacao de agricultores de Santander, cultivado mediante prácticas orgánicas y agroecológicas. Escríbenos por WhatsApp para conocer presentaciones y precios.', ing: '', all: '', unit: 'unidad', price: null, req: true, feat: true, art: 'barra' },
  { c: 'snacks', cat: 'helados', name: 'Helado de mucílago de cacao', short: 'Helado hecho con el mucílago del fruto del cacao.', long: 'Helado elaborado con mucílago, un componente del fruto del cacao que tradicionalmente se desperdicia. Es parte de nuestra apuesta por la economía circular. Escríbenos por WhatsApp para conocer presentaciones y precios.', ing: '', all: '', unit: 'unidad', price: null, req: true, feat: true, art: 'helado' },
  { c: 'industrial', cat: 'cacao-y-derivados', name: 'Cacao y derivados para empresas', short: 'Pedidos coordinados directamente con nosotros.', long: 'Para empresas y mercados que valoran la calidad, la trazabilidad, la sostenibilidad y el origen de sus alimentos. Cuéntanos qué necesitas por WhatsApp y coordinamos tu pedido.', ing: '', all: '', unit: 'pedido', price: null, req: true, feat: true, art: 'mayorista' },
];

export const products: Product[] = P.map((p, i) => {
  const id = uid(`prod:${p.name}`);
  const slug = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    id, catalog_slug: p.c, category_id: catId(p.c, p.cat), name: p.name, slug,
    short_description: p.short, description: p.long, ingredients: p.ing, allergens: p.all, unit_label: p.unit,
    price_cop: p.price, compare_at_price_cop: p.was ?? null, price_on_request: !!p.req, min_qty: p.min ?? 1,
    is_active: true, is_available: !p.out, is_featured: !!p.feat, tags: p.tags ?? [], sort_order: i,
    product_images: [{ url: `/art/${p.art}.webp`, path: `seed/${p.art}.webp`, alt: p.name, sort_order: 0 }],
    product_variants: (p.variants ?? []).map(([name, price_cop], j) => ({ id: uid(`var:${p.name}:${name}`), name, price_cop, is_active: true, sort_order: j })),
    created_at: new Date(2026, 8, 1 + i).toISOString(),
  };
});

export const catalogs: Catalog[] = catalogRows.map((c) => ({ ...c, categories: categories.filter((k) => k.catalog_slug === c.slug) })) as Catalog[];

const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
export const posts: Post[] = [
  { id: uid('post:1'), body: 'ZURYCH: una historia que comienza en la tierra, se transforma a través del cacao y busca llegar al mundo.\nSomos una empresa colombiana de carácter familiar y artesanal, dedicada a transformar el cacao en productos de chocolate que destacan por su calidad, origen y autenticidad.', is_pinned: true, created_at: ago(30), post_media: [{ url: '/photos/familia.webp', width: 1066, height: 1600, sort_order: 0 }], reactionCounts: {}, commentCount: 0 },
  { id: uid('post:2'), body: 'Nuestra trayectoria ha recibido reconocimientos:\n• 2020: Premio Empresario Colombiano de la Universidad del Rosario, categoría Colibrí Esmeralda.\n• 2021: Tercer puesto en los Premios Latinoamérica Verde, categoría Economía, subcategoría Finanzas Sostenibles.', is_pinned: false, created_at: ago(80), post_media: [{ url: '/photos/padre.webp', width: 1066, height: 1600, sort_order: 0 }], reactionCounts: {}, commentCount: 0 },
  { id: uid('post:3'), body: 'En 2021 abrimos nuestra primera tienda física especializada en cacao y chocolate, en el barrio Quirinal de Bogotá: un lugar para descubrir diferentes presentaciones, preparaciones y derivados del cacao, con servicio a la mesa.', is_pinned: false, created_at: ago(170), post_media: [{ url: '/photos/ciclistas-mesa.webp', width: 1600, height: 1066, sort_order: 0 }], reactionCounts: {}, commentCount: 0 },
  { id: uid('post:4'), body: 'También exploramos nuevas formas de aprovechar el cacao: desarrollamos helados elaborados con mucílago, un componente del fruto que tradicionalmente se desperdicia, y aprovechamos la cascarilla para aplicaciones innovadoras.', is_pinned: false, created_at: ago(260), post_media: [{ url: '/photos/mujer-chocolate.webp', width: 1600, height: 1066, sort_order: 0 }], reactionCounts: {}, commentCount: 0 },
  { id: uid('post:5'), body: 'Tres pilares guían nuestra forma de hacer chocolate:\n1. El cacao como alimento.\n2. Comercio justo.\n3. Economía circular.', is_pinned: false, created_at: ago(340), post_media: [], reactionCounts: {}, commentCount: 0 },
];
export const comments: PostComment[] = [];
export const commentPostMap: Record<string, string> = {};

export const about: AboutSection[] = [
  { id: uid('about:1'), title: 'Una empresa familiar y artesanal', body: 'ZURYCH es una empresa colombiana de carácter familiar y artesanal, dedicada a la transformación del cacao en productos de chocolate que destacan por su calidad, origen y autenticidad.\nNuestra esencia nace de una convicción: un chocolate extraordinario comienza mucho antes de su elaboración; comienza en el origen del cacao.\nTrabajamos con cacao de agricultores de Santander, cultivado mediante prácticas orgánicas y agroecológicas, para reconocer el trabajo de los productores, promover prácticas sostenibles y contribuir al bienestar de las comunidades rurales.', image_url: '/photos/familia.webp', sort_order: 1 },
  { id: uid('about:2'), title: 'Origen: Landázuri, Santander', body: 'La historia de ZURYCH está ligada a la vida de su fundador, Ricardo Bareño Mendoza, nacido en Landázuri, Santander, una región de tradición cacaotera.\nDurante unos doce años trabajó como guarda de seguridad en Bogotá y, en paralelo, estudió Administración de Empresas en la UNAD. En 2017, durante sus estudios, surgió la idea de crear una empresa que transformara el cacao y contribuyera al desarrollo de su tierra natal.\nAl recordar las dificultades de los agricultores de su región para comercializar sus cosechas, vio una oportunidad: comprar cacao directamente a los productores, reducir intermediarios y ofrecer una remuneración más justa.\nEn 2018, tras dejar su empleo, y con sus recursos y el apoyo de su familia, puso en marcha ZURYCH Chocolate Artesanal, con una planta de producción en Bogotá y conexión directa con los productores de Landázuri.', image_url: '/photos/casa-montana.webp', sort_order: 2 },
  { id: uid('about:3'), title: 'Una filosofía diferente', body: 'Desde nuestros inicios nos fundamentamos en tres pilares:\n1. El cacao como alimento: redescubrir el chocolate como un alimento de calidad, priorizando las características naturales del cacao y evitando depender de ingredientes innecesarios.\n2. Comercio justo: establecer relaciones directas con los agricultores y reconocer el valor de su trabajo.\n3. Economía circular: aprovechar integralmente los recursos del fruto del cacao, reduciendo desperdicios y desarrollando nuevas alternativas de transformación.', image_url: '/photos/mujer-chocolate.webp', sort_order: 3 },
  { id: uid('about:4'), title: 'Innovación y reconocimientos', body: 'Hemos explorado nuevas posibilidades de aprovechar el cacao, como helados elaborados con mucílago —un componente del fruto que tradicionalmente se desperdicia— y el uso de la cascarilla en aplicaciones innovadoras.\n2020: Premio Empresario Colombiano de la Universidad del Rosario, categoría Colibrí Esmeralda.\n2021: Tercer puesto en los Premios Latinoamérica Verde, categoría Economía, subcategoría Finanzas Sostenibles.', image_url: '/photos/padre.webp', sort_order: 4 },
  { id: uid('about:5'), title: 'Tienda ZURYCH', body: 'Una experiencia alrededor del cacao.\nEn 2021 abrimos nuestra primera tienda física especializada en cacao y chocolate, en el barrio Quirinal de Bogotá.\nNació para acercar a los consumidores al mundo del cacao con una experiencia que va más allá de vender chocolate: un lugar para descubrir diferentes presentaciones, preparaciones y derivados, con servicio a la mesa y distintas formas de consumir el cacao.', image_url: '/photos/ciclistas-mesa.webp', sort_order: 5 },
];

export const sampleImages = P.map((p) => p.art);
