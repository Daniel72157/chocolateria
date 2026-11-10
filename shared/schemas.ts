import { z } from 'zod';

export const CATALOG_SLUGS = ['canasta-familiar', 'snacks', 'industrial'] as const;
export type CatalogSlug = (typeof CATALOG_SLUGS)[number];

export const phoneCO = z
  .string()
  .trim()
  .regex(/^(\+?57)?\s?3\d{2}\s?\d{3}\s?\d{4}$/, 'Celular colombiano inválido');

export const orderItemInput = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  quantity: z.number().int().min(1).max(5000),
});

export const orderInput = z.object({
  customer: z.object({
    name: z.string().trim().min(3, 'Escribe tu nombre completo').max(80),
    phone: phoneCO,
    email: z.string().email('Correo inválido').optional().or(z.literal('')),
    document: z.string().trim().max(20).optional(),
    companyName: z.string().trim().max(120).optional(),
  }),
  delivery: z.discriminatedUnion('method', [
    z.object({
      method: z.literal('domicilio'),
      address: z.string().trim().min(5, 'Escribe la dirección').max(160),
      neighborhood: z.string().trim().min(2, 'Escribe el barrio').max(80),
      city: z.string().trim().min(2, 'Escribe la ciudad').max(60),
    }),
    z.object({ method: z.literal('recoger_en_tienda') }),
  ]),
  preferredDate: z.string().date().optional(),
  paymentMethod: z.enum(['efectivo', 'transferencia', 'otro']),
  notes: z.string().trim().max(500).optional(),
  items: z.array(orderItemInput).min(1).max(60),
  website: z.string().max(0).optional(), // honeypot anti-bots: debe llegar vacío
});
export type OrderInput = z.infer<typeof orderInput>;

export const commentInput = z.object({
  authorName: z.string().trim().min(2, 'Escribe tu nombre').max(60),
  body: z.string().trim().min(1, 'Escribe tu comentario').max(1000),
  website: z.string().max(0).optional(),
});

export const reactionInput = z.object({
  visitorId: z.string().min(8).max(64),
  type: z.enum(['me_gusta', 'me_encanta', 'delicioso']),
});
export const reactionDelete = z.object({ visitorId: z.string().min(8).max(64) });

export const productInput = z
  .object({
    catalogSlug: z.enum(CATALOG_SLUGS),
    categoryId: z.string().uuid().nullable(),
    name: z.string().trim().min(2).max(120),
    slug: z.string().regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
    shortDescription: z.string().max(160).optional(),
    description: z.string().max(4000).optional(),
    ingredients: z.string().max(1000).optional(),
    allergens: z.string().max(300).optional(),
    unitLabel: z.string().max(40).default('unidad'),
    priceCop: z.number().int().min(0).nullable(),
    compareAtPriceCop: z.number().int().min(0).nullable().optional(),
    priceOnRequest: z.boolean().default(false),
    minQty: z.number().int().min(1).default(1),
    isActive: z.boolean().default(true),
    isAvailable: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    variants: z
      .array(
        z.object({
          id: z.string().uuid().optional(),
          name: z.string().min(1),
          priceCop: z.number().int().min(0),
        }),
      )
      .default([]),
    images: z
      .array(z.object({ url: z.string().min(1), path: z.string(), alt: z.string().optional() }))
      .max(8)
      .default([]),
  })
  .refine((p) => p.priceOnRequest || p.priceCop !== null, {
    message: 'Precio requerido',
    path: ['priceCop'],
  });
export type ProductInput = z.infer<typeof productInput>;

export const productQuickPatch = z.object({
  isActive: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const postInput = z
  .object({
    body: z.string().trim().max(5000).optional(),
    isPublished: z.boolean().default(true),
    isPinned: z.boolean().default(false),
    allowComments: z.boolean().default(true),
    media: z
      .array(
        z.object({
          url: z.string().min(1),
          path: z.string(),
          width: z.number().int().optional(),
          height: z.number().int().optional(),
        }),
      )
      .max(10)
      .default([]),
  })
  .refine((p) => (p.body && p.body.length > 0) || p.media.length > 0, {
    message: 'Agrega texto o al menos una imagen',
    path: ['body'],
  });
export type PostInput = z.infer<typeof postInput>;

export const categoryInput = z.object({
  catalogSlug: z.enum(CATALOG_SLUGS),
  name: z.string().trim().min(2).max(60),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  sortOrder: z.number().int().default(0),
});

export const catalogInput = z.object({
  name: z.string().trim().min(2).max(60),
  tagline: z.string().max(120).nullable().optional(),
  description: z.string().max(600).nullable().optional(),
  coverUrl: z.string().nullable().optional(),
});

export const commentPatch = z.object({ status: z.enum(['aprobado', 'rechazado', 'pendiente']) });
export const orderPatch = z.object({
  status: z.enum(['nuevo', 'confirmado', 'en_preparacion', 'entregado', 'cancelado']),
});

export const settingsInput = z.object({
  storeName: z.string().trim().min(2).max(80),
  whatsappNumber: z.string().regex(/^\d{10,15}$/, 'Solo dígitos, con indicativo (ej. 573001234567)'),
  email: z.string().email().or(z.literal('')).nullable().optional(),
  deliveryFee: z.number().int().min(0),
  freeDeliveryFrom: z.number().int().min(0).nullable(),
  address: z.string().max(200).nullable().optional(),
  openingHours: z.array(z.object({ day: z.string().min(1), hours: z.string().min(1) })).max(10),
  instagramUrl: z.string().url().or(z.literal('')).nullable().optional(),
  facebookUrl: z.string().url().or(z.literal('')).nullable().optional(),
  mapsEmbedUrl: z.string().url().or(z.literal('')).nullable().optional(),
  orderMessageFooter: z.string().max(200).nullable().optional(),
});

export const aboutInput = z.object({
  sections: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        title: z.string().min(1).max(120),
        body: z.string().min(1).max(3000),
        imageUrl: z.string().nullable().optional(),
      }),
    )
    .max(12),
});

export const signInput = z.object({
  bucket: z.enum(['products', 'posts', 'catalogs']),
  folder: z.string().regex(/^[a-z0-9-]+$/),
  contentType: z.enum(['image/webp', 'image/jpeg', 'image/png']),
});
export const deleteUploadInput = z.object({
  bucket: z.enum(['products', 'posts', 'catalogs']),
  path: z.string().min(3),
});
