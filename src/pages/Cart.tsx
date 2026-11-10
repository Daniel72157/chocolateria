import { Link } from 'react-router-dom';
import Seo from '../components/ui/Seo';
import Reveal from '../components/ui/Reveal';

import CartItem from '../components/cart/CartItem';
import { cartSubtotal, groupByCatalog, hasOnRequest, useCart } from '../store/cart';
import { cop } from '../lib/format';

export default function Cart() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const groups = groupByCatalog(items);
  return (
    <>
      <Seo title="Tu carrito" noindex />
      <Reveal as="section" className="wrap pb-6 pt-14 md:pt-20">
        <h1 className="t-display text-[clamp(2.4rem,6vw,5.5rem)]">Tu pedido</h1>
      </Reveal>
      <section className="wrap pb-24" aria-label="Productos del pedido">
        {items.length === 0 ? (
          <div className="paper max-w-xl p-8">
            <p className="t-lead">Tu pedido está vacío.</p>
            <p className="mt-2">Elige tus favoritos en los catálogos y vuelve aquí.</p>
            <Link to="/tienda" className="btn btn-primary mt-6">Ver catálogos</Link>
          </div>
        ) : (
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_380px]">
            <div className="grid gap-6">
              {groups.map((g) => (
                <Reveal as="section" key={g.slug} className="paper p-5 sm:p-7">
                  <h2 id={`g-${g.slug}`} className="t-h3 font-display text-2xl">{g.name}</h2>
                  <ul className="mt-2">{g.items.map((i) => <CartItem key={i.key} item={i} />)}</ul>
                </Reveal>
              ))}
              <button type="button" onClick={clear} className="justify-self-start font-semibold underline">Vaciar el pedido</button>
            </div>
            <aside className="paper-100 zig-b p-7 lg:sticky lg:top-28">
              <h2 className="t-h3 font-display text-2xl">Resumen</h2>
              <p className="mt-4 flex justify-between text-lg font-bold"><span>Subtotal</span><span className="num">{cop(cartSubtotal(items))}</span></p>
              <p className="t-small mt-1 text-tierra">El domicilio se calcula en el siguiente paso.</p>
              {hasOnRequest(items) && <p role="note" className="mt-4 bg-arena p-3 text-base">Hay productos con <strong>precio a convenir</strong>: no suman al subtotal y te los cotizamos por WhatsApp.</p>}
              <Link to="/pedido" className="btn btn-primary mt-6 w-full">Continuar</Link>
              <Link to="/tienda" className="btn btn-soft mt-2 w-full">Seguir eligiendo</Link>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
