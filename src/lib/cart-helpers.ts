import type { Product } from '../../shared/types';
import type { CartItem } from '../store/cart';

/** Convierte un producto (y una presentación opcional) en la línea que guarda el carrito. */
export function toCartItem(p: Product, variantId?: string | null): Omit<CartItem, 'key' | 'quantity'> {
  const v = variantId ? p.product_variants.find((x) => x.id === variantId) : undefined;
  return {
    productId: p.id, variantId: v?.id ?? null, slug: p.slug, name: p.name, variantName: v?.name,
    catalogSlug: p.catalog_slug, image: p.product_images[0]?.url, unitLabel: p.unit_label,
    unitPrice: p.price_on_request ? null : (v?.price_cop ?? p.price_cop), minQty: p.min_qty,
  };
}
export const startPrice = (p: Product) =>
  p.price_on_request ? null : p.product_variants.length ? Math.min(...p.product_variants.map((v) => v.price_cop)) : p.price_cop;
