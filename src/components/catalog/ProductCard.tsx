import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Badge from '../ui/Badge';
import { cop, TAG_LABEL } from '../../lib/format';
import { startPrice, toCartItem } from '../../lib/cart-helpers';
import { useCart } from '../../store/cart';
import { toast } from '../../store/toast';
import type { Product } from '../../../shared/types';

/** Tarjeta de producto: foto con una tira de etiqueta pegada debajo, como una estampa con su rótulo. */
export default function ProductCard({ p }: { p: Product }) {
  const add = useCart((s) => s.add);
  const price = startPrice(p);
  const img = p.product_images[0];
  const hasVariants = p.product_variants.length > 0;
  const tags = p.tags.filter((t) => TAG_LABEL[t]);
  const onAdd = () => {
    add(toCartItem(p, p.product_variants[0]?.id));
    toast.ok(`${p.name} agregado`, { label: 'Ver carrito', to: '/carrito' });
  };
  return (
    <article className="flex flex-col bg-papel">
      <Link to={`/producto/${p.slug}`} className="hover-zoom relative block aspect-[4/5] overflow-hidden bg-arena" aria-label={`Ver ${p.name}`}>
        {img && <img src={img.url} alt={img.alt ?? p.name} width={800} height={1000} loading="lazy" className="h-full w-full object-cover" />}
        <span className="absolute left-3 top-3 flex flex-wrap gap-1">
          {!p.is_available && <Badge tone="red">Agotado</Badge>}
          {p.min_qty > 1 && <Badge tone="dark">Mínimo {p.min_qty} unidades</Badge>}
          {tags.map((t) => <Badge key={t} tone={t === 'sin-azucar' || t === 'vegano' ? 'sage' : 'gold'}>{TAG_LABEL[t]}</Badge>)}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="t-h3 text-xl"><Link to={`/producto/${p.slug}`} className="hover:underline">{p.name}</Link></h3>
        <p className="line-clamp-2 text-base text-ink">{p.short_description}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="num text-xl font-bold leading-none text-bosque">
            {price === null ? 'A convenir' : <>{hasVariants && <span className="mr-1 text-sm font-semibold">Desde</span>}{cop(price)}</>}
          </p>
          {p.is_available ? (
            hasVariants ? (
              <Link to={`/producto/${p.slug}`} className="btn-round" aria-label={`Elegir presentación de ${p.name}`}><Plus size={22} aria-hidden /></Link>
            ) : (
              <button type="button" onClick={onAdd} className="btn-round" aria-label={`Agregar ${p.name} al pedido`}><Plus size={22} aria-hidden /></button>
            )
          ) : null}
        </div>
      </div>
    </article>
  );
}
