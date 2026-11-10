import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { cartCount, cartSubtotal, useCart } from '../../store/cart';
import { cop } from '../../lib/format';

/** El talón de la carta: queda abajo a la izquierda cuando la portada ya pasó. */
export default function Stub() {
  const items = useCart((s) => s.items);
  const n = cartCount(items);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.75);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  if (!show) return null;
  return (
    <Link to={n ? '/carrito' : '/#carta'} onClick={(e) => { if (!n) { e.preventDefault(); document.getElementById('carta')?.scrollIntoView({ behavior: 'smooth' }); } }}
      className="num fixed bottom-4 left-4 z-40 hidden items-center gap-3 bg-oro px-5 py-3 font-bold text-ink transition hover:bg-arena xl:flex">
      <ShoppingBag size={20} aria-hidden />
      {n ? <span>Tu pedido · {n} · {cop(cartSubtotal(items))}</span> : <span>Armar mi pedido</span>}
    </Link>
  );
}
