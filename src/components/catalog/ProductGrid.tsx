import ProductCard from './ProductCard';
import Reveal from '../ui/Reveal';
import Skeleton from '../ui/Skeleton';
import type { Product } from '../../../shared/types';

export default function ProductGrid({ items, loading }: { items?: Product[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4" aria-busy="true" aria-label="Cargando productos">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}><Skeleton className="aspect-[4/5]" /><Skeleton className="mt-3 h-6 w-3/4" /><Skeleton className="mt-2 h-4 w-1/2" /></div>
        ))}
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
      {items?.map((p, i) => <Reveal as="li" key={p.id} delay={(i % 4) * 0.06}><ProductCard p={p} /></Reveal>)}
    </ul>
  );
}
