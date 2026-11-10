import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { cop } from '../../lib/format';
import { useCart, type CartItem as Item } from '../../store/cart';

export default function CartItem({ item, compact = false }: { item: Item; compact?: boolean }) {
  const { setQty, remove } = useCart();
  const dec = () => (item.quantity - 1 < item.minQty ? remove(item.key) : setQty(item.key, item.quantity - 1));
  return (
    <li className="flex gap-4 py-4">
      {item.image && (
        <Link to={`/producto/${item.slug}`} className="shrink-0" aria-label={`Ver ${item.name}`}>
          <img src={item.image} alt="" width={compact ? 64 : 88} height={compact ? 80 : 110} loading="lazy" className={`${compact ? 'h-20 w-16' : 'h-[110px] w-[88px]'} object-cover`} />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <Link to={`/producto/${item.slug}`} className="font-display text-xl leading-tight hover:underline">{item.name}</Link>
        <p className="t-small text-tierra">
          {item.variantName ?? item.unitLabel}
          {item.minQty > 1 && ` · mínimo ${item.minQty}`}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1" role="group" aria-label={`Cantidad de ${item.name}`}>
            <button type="button" onClick={dec} aria-label={item.quantity - 1 < item.minQty ? `Quitar ${item.name}` : `Quitar una unidad de ${item.name}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-crema hover:bg-arena">
              {item.quantity - 1 < item.minQty ? <Trash2 size={16} /> : <Minus size={16} />}
            </button>
            <span className="num w-10 text-center font-bold" aria-live="polite">{item.quantity}</span>
            <button type="button" onClick={() => setQty(item.key, item.quantity + 1)} aria-label={`Agregar una unidad de ${item.name}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-crema hover:bg-arena"><Plus size={16} /></button>
          </div>
          <p className="num font-bold">{item.unitPrice === null ? 'A convenir' : cop(item.unitPrice * item.quantity)}</p>
        </div>
      </div>
    </li>
  );
}
