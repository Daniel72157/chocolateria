import { describe, expect, it } from 'vitest';
import { awardInput, landInput, postInput, pqrInput, settingsInput, signInput } from '../shared/schemas';
import { startPrice, toCartItem } from '../src/lib/cart-helpers';
import { publicCache } from '../server/middleware/cache';
import { validate } from '../server/middleware/validate';

describe('postInput', () => {
  it('acepta una publicación solo con texto, video o imagen', () => {
    expect(postInput.safeParse({ body: 'Hola' }).success).toBe(true);
    expect(postInput.safeParse({ kind: 'entrevista', title: 'Radio', videoUrl: 'https://youtu.be/abc' }).success).toBe(true);
    expect(postInput.safeParse({ media: [{ url: '/a.webp', path: 'a' }] }).success).toBe(true);
  });
  it('rechaza una publicación vacía', () => {
    expect(postInput.safeParse({}).success).toBe(false);
  });
  it('una entrevista exige título', () => {
    expect(postInput.safeParse({ kind: 'entrevista', body: 'texto' }).success).toBe(false);
  });
  it('rechaza enlaces de video inválidos', () => {
    expect(postInput.safeParse({ kind: 'entrevista', title: 'Radio', videoUrl: 'no-es-url' }).success).toBe(false);
  });
});

describe('awardInput y landInput', () => {
  it('un reconocimiento necesita nombre y archivo', () => {
    expect(awardInput.safeParse({ title: 'Premio', imageUrl: '/a.webp', imagePath: 'a' }).success).toBe(true);
    expect(awardInput.safeParse({ title: 'P', imageUrl: '/a.webp', imagePath: 'a' }).success).toBe(false);
    expect(awardInput.safeParse({ title: 'Premio', imageUrl: '', imagePath: '' }).success).toBe(false);
  });
  it('una foto de la tierra necesita nombre y foto', () => {
    expect(landInput.safeParse({ name: 'Tucán', imageUrl: '/t.webp', imagePath: 't' }).success).toBe(true);
    expect(landInput.safeParse({ name: 'Tucán', imageUrl: '', imagePath: '' }).success).toBe(false);
  });
});

describe('signInput', () => {
  it('los PDF solo se permiten en reconocimientos', () => {
    expect(signInput.safeParse({ bucket: 'awards', folder: 'tmp', contentType: 'application/pdf' }).success).toBe(true);
    expect(signInput.safeParse({ bucket: 'posts', folder: 'tmp', contentType: 'application/pdf' }).success).toBe(false);
    expect(signInput.safeParse({ bucket: 'land', folder: 'tmp', contentType: 'image/webp' }).success).toBe(true);
  });
});

describe('settingsInput (redes por local)', () => {
  const base = { storeName: 'Zurych', whatsappNumber: '573025556304', deliveryFee: 0, freeDeliveryFrom: null, openingHours: [] };
  it('acepta redes vacías o con URL, para tienda y planta', () => {
    expect(settingsInput.safeParse({ ...base, tiktokUrl: '', plantTiktokUrl: 'https://www.tiktok.com/@zurych' }).success).toBe(true);
  });
  it('rechaza redes que no son URL', () => {
    expect(settingsInput.safeParse({ ...base, plantInstagramUrl: 'zurych' }).success).toBe(false);
  });
});

describe('pqrInput', () => {
  it('pide un mensaje de al menos 10 letras', () => {
    expect(pqrInput.safeParse({ type: 'queja', name: 'Ana', body: 'corto' }).success).toBe(false);
    expect(pqrInput.safeParse({ type: 'queja', name: 'Ana', body: 'Un mensaje suficientemente largo' }).success).toBe(true);
  });
});

describe('carrito', () => {
  const p: any = {
    id: 'p1', slug: 's', name: 'Barra', catalog_slug: 'snacks', unit_label: 'unidad', min_qty: 1, price_cop: 5000, price_on_request: false,
    product_images: [{ url: '/i.webp' }], product_variants: [{ id: 'v1', name: 'x6', price_cop: 24000 }, { id: 'v2', name: 'x3', price_cop: 13000 }],
  };
  it('toCartItem usa el precio de la presentación elegida', () => {
    expect(toCartItem(p, 'v1')).toMatchObject({ variantId: 'v1', unitPrice: 24000, variantName: 'x6', image: '/i.webp' });
    expect(toCartItem(p)).toMatchObject({ variantId: null, unitPrice: 5000 });
  });
  it('precio a convenir no tiene precio unitario', () => {
    expect(toCartItem({ ...p, price_on_request: true }).unitPrice).toBeNull();
    expect(startPrice({ ...p, price_on_request: true })).toBeNull();
  });
  it('startPrice toma la presentación más barata', () => {
    expect(startPrice(p)).toBe(13000);
    expect(startPrice({ ...p, product_variants: [] })).toBe(5000);
  });
});

describe('middleware', () => {
  const run = (path: string, method = 'GET') => {
    const headers: Record<string, string> = {};
    const res: any = { set: (k: string, v: string) => { headers[k] = v; } };
    let called = false;
    publicCache({ path, method } as any, res, () => { called = true; });
    return { headers, called };
  };
  it('las rutas públicas GET se guardan en caché', () => {
    expect(run('/products').headers['Cache-Control']).toContain('s-maxage=60');
  });
  it('el panel nunca se guarda en caché', () => {
    expect(run('/admin/products').headers['Cache-Control']).toBe('private, no-store');
  });
  it('los POST no llevan caché y siguen adelante', () => {
    const r = run('/pqr', 'POST');
    expect(r.headers['Cache-Control']).toBeUndefined();
    expect(r.called).toBe(true);
  });
  it('validate responde 400 con datos inválidos y deja pasar los válidos', () => {
    const mw = validate(landInput);
    let status = 0;
    let body: any;
    const res: any = { status(c: number) { status = c; return this; }, json(b: unknown) { body = b; } };
    let next = false;
    mw({ body: {} } as any, res, () => { next = true; });
    expect(status).toBe(400);
    expect(body.error.code).toBe('validation');
    expect(next).toBe(false);
    const req: any = { body: { name: 'Tucán', imageUrl: '/t.webp', imagePath: 't' } };
    mw(req, res, () => { next = true; });
    expect(next).toBe(true);
    expect(req.body.isPublished).toBe(true);
  });
});
