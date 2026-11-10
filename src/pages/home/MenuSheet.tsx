import { Plus } from 'lucide-react';
import { useFeatured } from '../../hooks/useProducts';
import { cop } from '../../lib/format';
import { startPrice, toCartItem } from '../../lib/cart-helpers';
import { CATALOG_NAME, CATALOG_ORDER, useCart } from '../../store/cart';
import { toast } from '../../store/toast';
import Comanda from '../../components/cart/Comanda';
import Reveal from '../../components/ui/Reveal';
import Skeleton from '../../components/ui/Skeleton';
import type { Product } from '../../../shared/types';

function Row({ p }: { p: Product }) {
  const add = useCart((s) => s.add);
  const price = startPrice(p);
  const v = p.product_variants[0];
  const note = [v?.name, p.min_qty > 1 ? `Desde ${p.min_qty} unidades` : null, p.short_description].filter(Boolean).join(' · ');
  return (
    <li className="flex items-start gap-3 py-2">
      <div className="min-w-0 flex-1">
        <h4 className="font-sans text-base font-bold leading-snug tracking-normal">{p.name}</h4>
        <p className="text-base leading-snug text-tierra">{note}</p>
      </div>
      <p className="num pt-0.5 text-right text-base font-bold">{price === null ? 'A convenir' : <>{p.product_variants.length > 0 && <span className="mr-1 text-base font-semibold">desde</span>}{cop(price)}</>}</p>
      <button type="button" className="btn-round" aria-label={`Agregar ${p.name} a mi comanda`} onClick={() => { add(toCartItem(p, v?.id)); toast.ok(`${p.name} agregado`); }}>
        <Plus size={20} aria-hidden />
      </button>
    </li>
  );
}

/** La carta impresa: los favoritos de la casa en una hoja de papel, con la comanda al lado. */
export default function MenuSheet() {
  const { data, isLoading } = useFeatured();
  return (
    <section id="carta" aria-labelledby="carta-title" className="on-dark bg-ink py-[clamp(72px,12vw,160px)]">
      <div className="wrap grid items-start gap-16 lg:grid-cols-[minmax(0,640px)_minmax(0,460px)] lg:justify-center lg:gap-14">
        <Reveal className="paper scallop-t scallop-b px-5 py-10 sm:px-12 sm:py-16">
          <h2 className="t-h2 text-center text-[clamp(2rem,4vw,3rem)]">Lo más pedido de la casa</h2>
          <p className="mx-auto mt-3 max-w-[40ch] text-center text-base">Toca el + para armar tu pedido: la comanda se va llenando a un lado.</p>
          {isLoading && <div className="mt-10 grid gap-4"><Skeleton className="h-12" /><Skeleton className="h-12" /><Skeleton className="h-12" /></div>}
          {CATALOG_ORDER.map((slug) => {
            const items = data?.filter((p) => p.catalog_slug === slug) ?? [];
            if (!items.length) return null;
            return (
              <div key={slug} className="mt-12">
                <h3 className="text-center text-xl">{CATALOG_NAME[slug]}</h3>
                <ul className="mt-4">{items.map((p) => <Row key={p.id} p={p} />)}</ul>
              </div>
            );
          })}
          <p className="mt-12 text-center text-base text-tierra">Los precios y presentaciones se coordinan por WhatsApp.</p>
        </Reveal>

        <Reveal delay={0.1} className="lg:sticky lg:top-28">
          <Comanda />
        </Reveal>
      </div>
    </section>
  );
}
