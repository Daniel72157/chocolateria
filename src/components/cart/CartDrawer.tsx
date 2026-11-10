import { Link } from 'react-router-dom';
import Modal from '../ui/Modal';
import CartItem from './CartItem';
import { cartSubtotal, groupByCatalog, hasOnRequest, useCart } from '../../store/cart';
import { useUi } from '../../store/ui';
import { cop } from '../../lib/format';

export default function CartDrawer() {
  const { drawer, setDrawer } = useUi();
  const items = useCart((s) => s.items);
  const close = () => setDrawer(false);
  return (
    <Modal open={drawer} onClose={close} label="Tu pedido" side="right">
      <div className="flex min-h-full flex-col p-6 pt-8">
        <h2 className="t-h3 pr-14">Tu pedido</h2>
        {items.length === 0 ? (
          <div className="my-auto py-16">
            <p className="t-lead">Aún no has elegido nada.</p>
            <p className="mt-2">Mira los catálogos y agrega tus favoritos.</p>
            <Link to="/tienda" onClick={close} className="btn btn-primary mt-6">Ver catálogos</Link>
          </div>
        ) : (
          <>
            <div className="flex-1">
              {groupByCatalog(items).map((g) => (
                <section key={g.slug} className="mt-5" aria-label={g.name}>
                  <h3 className="rounded-full bg-crema px-4 py-1 font-sans text-base font-bold">{g.name}</h3>
                  <ul>{g.items.map((i) => <CartItem key={i.key} item={i} compact />)}</ul>
                </section>
              ))}
            </div>
            <div className="mt-6 bg-crema p-4">
              <p className="flex justify-between font-bold"><span>Subtotal</span><span className="num">{cop(cartSubtotal(items))}</span></p>
              {hasOnRequest(items) && <p className="t-small mt-1">Los productos con precio a convenir se cotizan por WhatsApp.</p>}
              <div className="mt-4 grid gap-2">
                <Link to="/pedido" onClick={close} className="btn btn-primary">Continuar con el pedido</Link>
                <Link to="/carrito" onClick={close} className="btn btn-soft">Ver carrito</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
