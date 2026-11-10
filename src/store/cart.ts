import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CatalogSlug } from '../../shared/types';

export type CartItem = {
  key: string; // productId + variantId
  productId: string;
  variantId?: string | null;
  slug: string;
  name: string;
  variantName?: string;
  catalogSlug: CatalogSlug;
  image?: string;
  unitLabel: string;
  unitPrice: number | null; // null = precio a convenir (solo informativo, el backend recalcula)
  minQty: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, 'key' | 'quantity'>, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = item.minQty) =>
        set((s) => {
          const key = `${item.productId}:${item.variantId ?? ''}`;
          const found = s.items.find((i) => i.key === key);
          if (found) return { items: s.items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + qty } : i)) };
          return { items: [...s.items, { ...item, key, quantity: Math.max(qty, item.minQty) }] };
        }),
      setQty: (key, qty) =>
        set((s) => ({ items: s.items.map((i) => (i.key === key ? { ...i, quantity: Math.max(qty, i.minQty) } : i)) })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'chocolateria-cart', version: 1 },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((sum, i) => sum + (i.unitPrice ?? 0) * i.quantity, 0);
export const hasOnRequest = (items: CartItem[]) => items.some((i) => i.unitPrice === null);

export const CATALOG_NAME: Record<string, string> = { 'canasta-familiar': 'Canasta familiar', snacks: 'Snacks', industrial: 'Industrial' };
export const CATALOG_ORDER: CatalogSlug[] = ['canasta-familiar', 'snacks', 'industrial'];
export const groupByCatalog = (items: CartItem[]) =>
  CATALOG_ORDER.map((slug) => ({ slug, name: CATALOG_NAME[slug], items: items.filter((i) => i.catalogSlug === slug) })).filter((g) => g.items.length);
