import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { AboutSection, Catalog, Product, ProductPage, StoreSettings } from '../../shared/types';

export const useSettings = () => useQuery({ queryKey: ['settings'], queryFn: () => api<StoreSettings>('/settings'), staleTime: 5 * 60_000 });
export const useAbout = () => useQuery({ queryKey: ['about'], queryFn: () => api<AboutSection[]>('/about') });
export const useCatalogs = () => useQuery({ queryKey: ['catalogs'], queryFn: () => api<Catalog[]>('/catalogs'), staleTime: 5 * 60_000 });
export const useFeatured = () => useQuery({ queryKey: ['featured'], queryFn: () => api<Product[]>('/products/featured') });
export const useProduct = (slug?: string) =>
  useQuery({ queryKey: ['product', slug], queryFn: () => api<Product & { related: Product[] }>(`/products/${slug}`), enabled: !!slug, retry: false });

export function useCatalogProducts(slug: string, opts: { category?: string; q?: string; sort?: string }) {
  return useInfiniteQuery({
    queryKey: ['catalog-products', slug, opts],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => {
      const p = new URLSearchParams({ page: String(pageParam) });
      if (opts.category) p.set('category', opts.category);
      if (opts.q) p.set('q', opts.q);
      if (opts.sort) p.set('sort', opts.sort);
      return api<ProductPage>(`/catalogs/${slug}/products?${p}`);
    },
    getNextPageParam: (last) => (last.page * last.pageSize < last.total ? last.page + 1 : undefined),
  });
}
