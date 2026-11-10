import { describe, expect, it } from 'vitest';
import { orderInput, productInput, commentInput } from '../shared/schemas.js';
import { buildOrderMessage, waLink } from '../server/lib/whatsapp.js';
import { OrderError, priceOrder } from '../server/lib/orders.js';

// Datos de prueba propios (independientes del contenido real de la tienda).
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const prod = (n: number, over: object = {}) => ({
  id: id(n), catalog_slug: 'snacks', name: `Producto ${n}`, unit_label: 'unidad', price_cop: 10000, price_on_request: false,
  min_qty: 1, is_active: true, is_available: true, product_variants: [] as { id: string; name: string; price_cop: number; is_active: boolean }[], ...over,
});
const variant = { id: id(90), name: 'Caja x6', price_cop: 18000, is_active: true };
const products = [
  prod(1, { price_cop: 12000 }),
  prod(2, { product_variants: [variant] }),
  prod(3, { catalog_slug: 'canasta-familiar', price_cop: 15000 }),
  prod(4, { catalog_slug: 'industrial', price_cop: 48000, min_qty: 20 }),
  prod(5, { catalog_slug: 'industrial', price_cop: null, price_on_request: true, min_qty: 5 }),
  prod(6, { is_available: false }),
];
const base = (items: { productId: string; variantId?: string | null; quantity: number }[], extra: object = {}) =>
  orderInput.parse({
    customer: { name: 'Laura Gómez', phone: '313 258 4586', email: 'laura@correo.com', ...extra },
    delivery: { method: 'domicilio', address: 'Calle 10 # 5-20', neighborhood: 'Centro', city: 'Bogotá' },
    paymentMethod: 'transferencia', items,
  });
const settings = { delivery_fee: 6000, free_delivery_from: 80000 };

describe('priceOrder', () => {
  it('recalcula precios con la base: variante, domicilio y total', () => {
    const r = priceOrder(base([{ productId: id(2), variantId: id(90), quantity: 2 }, { productId: id(1), quantity: 1 }]), products as any, settings);
    expect(r.subtotal).toBe(2 * 18000 + 12000);
    expect(r.deliveryFee).toBe(6000);
    expect(r.total).toBe(54000);
    expect(r.hasPriceOnRequest).toBe(false);
  });

  it('domicilio gratis sobre el mínimo y recoger en tienda cuesta 0', () => {
    expect(priceOrder(base([{ productId: id(3), quantity: 6 }]), products as any, settings).deliveryFee).toBe(0);
    const pickup = orderInput.parse({ ...base([{ productId: id(3), quantity: 1 }]), delivery: { method: 'recoger_en_tienda' } });
    expect(priceOrder(pickup, products as any, settings).deliveryFee).toBe(0);
  });

  it('rechaza cantidad menor al mínimo y exige NIT en pedidos industriales', () => {
    expect(() => priceOrder(base([{ productId: id(4), quantity: 5 }], { document: '900123' }), products as any, settings)).toThrow(/mínimo 20/);
    try { priceOrder(base([{ productId: id(4), quantity: 20 }]), products as any, settings); throw new Error('debía fallar'); } catch (e) { expect((e as OrderError).code).toBe('document_required'); }
  });

  it('precio a convenir no suma al total y se marca', () => {
    const r = priceOrder(base([{ productId: id(5), quantity: 50 }], { document: '900123' }), products as any, settings);
    expect(r.subtotal).toBe(0);
    expect(r.hasPriceOnRequest).toBe(true);
    expect(r.lines[0].lineTotal).toBeNull();
  });

  it('rechaza productos agotados', () => {
    expect(() => priceOrder(base([{ productId: id(6), quantity: 1 }]), products as any, settings)).toThrow(/ya no está disponible/);
  });

  it('ignora cualquier total enviado por el navegador', () => {
    const input: any = { ...base([{ productId: id(1), quantity: 1 }]), total: 1 };
    expect(priceOrder(orderInput.parse(input), products as any, { delivery_fee: 0, free_delivery_from: null }).total).toBe(12000);
  });
});

describe('buildOrderMessage', () => {
  it('agrupa por categoría y marca el total', () => {
    const input = base([{ productId: id(2), variantId: id(90), quantity: 2 }, { productId: id(3), quantity: 3 }]);
    const p = priceOrder(input, products as any, settings);
    const msg = buildOrderMessage({ code: 'PED-00042', createdAt: new Date('2026-10-26T20:45:00Z'), customer: input.customer, deliveryText: p.deliveryText, lines: p.lines, subtotal: p.subtotal, deliveryFee: p.deliveryFee, total: p.total, hasPriceOnRequest: false, paymentMethod: 'Transferencia', footer: '¡Gracias por tu pedido!' });
    expect(msg).toContain('*NUEVO PEDIDO - PED-00042*');
    expect(msg.indexOf('_Canasta familiar_')).toBeLessThan(msg.indexOf('_Snacks_'));
    expect(msg).toContain('• 2 x Producto 2 (Caja x6)');
    expect(msg).toMatch(/\*TOTAL: .*81\.000.*\*/);
  });
  it('sin costo de domicilio configurado, dice que se acuerda por WhatsApp', () => {
    const input = base([{ productId: id(1), quantity: 1 }]);
    const p = priceOrder(input, products as any, { delivery_fee: 0, free_delivery_from: null });
    const msg = buildOrderMessage({ code: 'PED-1', createdAt: new Date(), customer: input.customer, deliveryText: p.deliveryText, lines: p.lines, subtotal: p.subtotal, deliveryFee: p.deliveryFee, total: p.total, hasPriceOnRequest: false, paymentMethod: 'Efectivo' });
    expect(msg).toContain('Domicilio: Se acuerda por WhatsApp');
  });
  it('arma el enlace wa.me solo con dígitos', () => {
    expect(waLink('+57 313 258 4586', 'Hola & chao')).toBe('https://wa.me/573132584586?text=Hola%20%26%20chao');
  });
});

describe('esquemas', () => {
  it('valida celular colombiano', () => {
    expect(orderInput.safeParse({ ...base([{ productId: id(1), quantity: 1 }]), customer: { name: 'Ana Ruiz', phone: '12345' } }).success).toBe(false);
  });
  it('el honeypot debe llegar vacío', () => {
    expect(commentInput.safeParse({ authorName: 'Ana', body: 'Hola', website: 'http://spam' }).success).toBe(false);
  });
  it('un producto necesita precio o "a convenir"', () => {
    const p = { catalogSlug: 'snacks', categoryId: null, name: 'Algo', slug: 'algo', priceCop: null };
    expect(productInput.safeParse(p).success).toBe(false);
    expect(productInput.safeParse({ ...p, priceOnRequest: true }).success).toBe(true);
  });
});
