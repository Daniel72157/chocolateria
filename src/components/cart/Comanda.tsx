import { Link } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import { cartSubtotal, groupByCatalog, hasOnRequest, useCart } from '../../store/cart';
import { useSettings } from '../../hooks/useProducts';
import { cop } from '../../lib/format';

/** La comanda: el mismo pedido que llegará a WhatsApp, armándose en vivo mientras eliges. */
export default function Comanda({ className = '' }: { className?: string }) {
  const { items, setQty, remove } = useCart();
  const { data: s } = useSettings();
  const subtotal = cartSubtotal(items);
  const groups = groupByCatalog(items);
  const today = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <aside aria-label="Tu comanda" className={`paper-100 zig-b p-7 md:p-8 ${className}`}>
      <h3 className="t-h3">Tu comanda</h3>
      <p className="text-base mt-1 text-tierra">Así le llega tu pedido a la tienda por WhatsApp · {today}</p>

      <div className="mt-6 min-h-[120px]" aria-live="polite">
        {items.length === 0 ? (
          <p className="py-6">Todavía no hay nada aquí. Toca el + junto a lo que se te antoje y lo verás aparecer.</p>
        ) : (
          groups.map((g) => (
            <div key={g.slug} className="mb-4">
              <p className="font-bold italic">{g.name}</p>
              <ul>
                {g.items.map((i) => (
                  <li key={i.key} className="mt-2 flex items-end gap-2">
                    <span className="min-w-0 max-w-[62%]">{i.quantity} × {i.name}{i.variantName ? ` (${i.variantName})` : ''}</span>
                    <span className="leader" aria-hidden />
                    <span className="num shrink-0 font-bold">{i.unitPrice === null ? 'A convenir' : cop(i.unitPrice * i.quantity)}</span>
                    <span className="flex shrink-0 gap-1">
                      <button type="button" aria-label={`Quitar una unidad de ${i.name}`} onClick={() => (i.quantity - 1 < i.minQty ? remove(i.key) : setQty(i.key, i.quantity - 1))} className="flex h-9 w-9 items-center justify-center rounded-full bg-papel hover:bg-arena"><Minus size={14} aria-hidden /></button>
                      <button type="button" aria-label={`Agregar una unidad de ${i.name}`} onClick={() => setQty(i.key, i.quantity + 1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-papel hover:bg-arena"><Plus size={14} aria-hidden /></button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <dl className="mt-4 grid gap-1">
        <div className="flex justify-between"><dt>Subtotal</dt><dd className="num">{cop(subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Domicilio</dt><dd className="num text-right">{s ? (s.delivery_fee ? cop(s.delivery_fee) : 'Se acuerda por WhatsApp') : '—'}</dd></div>
      </dl>
      {s?.free_delivery_from != null && <p className="text-base text-tierra">Domicilio gratis desde {cop(s.free_delivery_from)}.</p>}
      {hasOnRequest(items) && <p className="text-base mt-1">+ productos con precio a convenir</p>}
      <p className="mt-3 bg-ink px-4 py-3 text-papel"><span className="flex justify-between font-display text-xl"><span>Total</span><span className="num">{cop(subtotal + (s?.delivery_fee && s.free_delivery_from != null && subtotal >= s.free_delivery_from ? 0 : s?.delivery_fee ?? 0) * (items.length ? 1 : 0))}</span></span></p>

      <Link to={items.length ? '/pedido' : '/tienda'} className={`btn mt-5 w-full ${items.length ? 'btn-wa' : 'btn-primary'}`}>
        {items.length ? 'Enviar mi pedido por WhatsApp' : 'Ver los catálogos'}
      </Link>
    </aside>
  );
}
