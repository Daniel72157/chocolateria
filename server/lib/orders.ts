import type { OrderInput } from '../../shared/schemas.js';
import type { PricedLine } from './whatsapp.js';

type ProductRow = {
  id: string;
  catalog_slug: string;
  name: string;
  unit_label: string;
  price_cop: number | null;
  price_on_request: boolean;
  min_qty: number;
  is_active: boolean;
  is_available: boolean;
  product_variants: { id: string; name: string; price_cop: number; is_active: boolean }[];
};
export type SettingsRow = { delivery_fee: number; free_delivery_from: number | null };
export type PricedOrderLine = PricedLine & { productId: string; unitLabel: string };

export class OrderError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

/** Recalcula precios con los datos de la base; el total del navegador nunca se usa. */
export function priceOrder(input: OrderInput, products: ProductRow[], settings: SettingsRow) {
  const lines: PricedOrderLine[] = [];
  for (const item of input.items) {
    const p = products.find((x) => x.id === item.productId);
    if (!p || !p.is_active || !p.is_available) {
      throw new OrderError(409, 'unavailable', p ? `${p.name} ya no está disponible` : 'Un producto ya no está disponible', { productId: item.productId });
    }
    if (item.quantity < p.min_qty) throw new OrderError(400, 'min_qty', `${p.name}: mínimo ${p.min_qty} unidades`);
    const v = item.variantId ? p.product_variants.find((x) => x.id === item.variantId && x.is_active) : null;
    if (item.variantId && !v) throw new OrderError(409, 'unavailable', `Presentación no disponible: ${p.name}`);
    const unitPrice: number | null = p.price_on_request ? null : (v?.price_cop ?? p.price_cop);
    lines.push({
      productId: p.id, catalogSlug: p.catalog_slug, name: p.name, variantName: v?.name ?? null, unitLabel: p.unit_label,
      unitPrice, quantity: item.quantity, lineTotal: unitPrice === null ? null : unitPrice * item.quantity,
    });
  }
  if (lines.some((l) => l.catalogSlug === 'industrial') && !input.customer.document) {
    throw new OrderError(400, 'document_required', 'La cédula o NIT es obligatoria para pedidos industriales');
  }
  const subtotal = lines.reduce((s, l) => s + (l.lineTotal ?? 0), 0);
  const isDelivery = input.delivery.method === 'domicilio';
  const free = settings.free_delivery_from;
  const deliveryFee = !isDelivery ? 0 : free !== null && subtotal >= free ? 0 : settings.delivery_fee;
  return {
    lines, subtotal, deliveryFee, total: subtotal + deliveryFee,
    hasPriceOnRequest: lines.some((l) => l.unitPrice === null),
    deliveryText:
      input.delivery.method === 'domicilio'
        ? `Domicilio: ${input.delivery.address}, barrio ${input.delivery.neighborhood}, ${input.delivery.city}`
        : 'Recoger en tienda',
  };
}

export const PAYMENT_LABEL: Record<string, string> = { efectivo: 'Efectivo', transferencia: 'Transferencia', otro: 'Otro' };
