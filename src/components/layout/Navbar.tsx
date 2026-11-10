import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, ShoppingBag, X } from 'lucide-react';
import { useSettings } from '../../hooks/useProducts';
import { cartCount, useCart } from '../../store/cart';
import { useUi } from '../../store/ui';

const CATALOGS = [
  { to: '/tienda/canasta-familiar', label: 'Canasta familiar' },
  { to: '/tienda/snacks', label: 'Snacks' },
  { to: '/tienda/industrial', label: 'Industrial' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const home = pathname === '/';
  const { data: settings } = useSettings();
  const count = useCart((s) => cartCount(s.items));
  const setDrawer = useUi((s) => s.setDrawer);
  const [menu, setMenu] = useState(false);
  const [sub, setSub] = useState(false);
  const subRef = useRef<HTMLDivElement>(null);
  const [bump, setBump] = useState(false);

  useEffect(() => { setMenu(false); setSub(false); }, [pathname]);
  useEffect(() => { if (count) { setBump(true); const t = setTimeout(() => setBump(false), 400); return () => clearTimeout(t); } }, [count]);
  useEffect(() => {
    if (!sub) return;
    const off = (e: MouseEvent) => !subRef.current?.contains(e.target as Node) && setSub(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setSub(false);
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, [sub]);
  useEffect(() => { document.body.style.overflow = menu ? 'hidden' : ''; }, [menu]);

  const tone = home ? 'bg-ink text-crema on-dark' : 'bg-crema text-ink';
  const link = ({ isActive }: { isActive: boolean }) => `rounded-full px-4 py-2 font-semibold transition hover:bg-oro/25 ${isActive ? 'underline decoration-oro decoration-[3px] underline-offset-[10px]' : ''}`;
  const name = settings?.store_name ?? 'Chocolatería';

  return (
    <header className={`sticky top-0 z-50 ${tone}`}>
      <nav aria-label="Principal" className="wrap flex h-[72px] items-center justify-between gap-4">
        <Link to="/" aria-label={`${name}, inicio`} className="flex items-center"><img src="/brand/logo-sm.webp" alt={name} width={420} height={260} className="h-[66px] w-auto" /></Link>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={link}>Inicio</NavLink>
          <div ref={subRef} className="relative">
            <button type="button" aria-expanded={sub} aria-haspopup="true" onClick={() => setSub(!sub)} className="flex items-center gap-1 rounded-full px-4 py-2 font-semibold transition hover:bg-oro/25">
              Tienda virtual <ChevronDown size={16} className={`transition ${sub ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {sub && (
              <ul className="absolute left-0 top-full mt-2 w-60 bg-papel p-2 text-ink">
                <li><Link to="/tienda" className="block rounded-full px-4 py-3 font-semibold hover:bg-arena">Toda la tienda</Link></li>
                {CATALOGS.map((c) => <li key={c.to}><Link to={c.to} className="block rounded-full px-4 py-3 hover:bg-arena">{c.label}</Link></li>)}
              </ul>
            )}
          </div>
          <NavLink to="/donde-encontrarnos" className={link}>Dónde encontrarnos</NavLink>
          <NavLink to="/blog" className={link}>Blog</NavLink>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setDrawer(true)} aria-label={`Abrir tu pedido, ${count} productos`} className={`relative flex h-12 w-12 items-center justify-center rounded-full transition ${home ? 'bg-oro text-ink' : 'bg-bosque text-papel'} hover:scale-105`}>
            <ShoppingBag size={22} aria-hidden />
            {count > 0 && <span className={`num absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-rojo px-1 text-sm font-bold text-papel ${bump ? 'bump' : ''}`}>{count}</span>}
          </button>
          <button type="button" onClick={() => setMenu(true)} aria-label="Abrir menú" className="flex h-12 w-12 items-center justify-center rounded-full md:hidden"><Menu size={26} /></button>
        </div>
      </nav>

      {menu && (
        <div role="dialog" aria-modal="true" aria-label="Menú" className="on-dark fixed inset-0 z-[55] flex flex-col bg-ink px-[var(--gutter)] pb-8 pt-3 text-crema md:hidden">
          <div className="flex h-[64px] items-center justify-between">
            <img src="/brand/logo-sm.webp" alt={name} width={420} height={260} className="h-[56px] w-auto" />
            <button type="button" onClick={() => setMenu(false)} aria-label="Cerrar menú" className="flex h-12 w-12 items-center justify-center"><X size={28} /></button>
          </div>
          <ul className="mt-6 flex flex-1 flex-col gap-1 font-display text-3xl">
            {[['/', 'Inicio'], ['/tienda/canasta-familiar', 'Canasta familiar'], ['/tienda/snacks', 'Snacks'], ['/tienda/industrial', 'Industrial'], ['/donde-encontrarnos', 'Dónde encontrarnos'], ['/blog', 'Blog']].map(([to, label]) => (
              <li key={to}><Link to={to} className="block py-2">{label}</Link></li>
            ))}
          </ul>
          <Link to="/carrito" className="btn btn-gold">Ver mi pedido{count > 0 && ` (${count})`}</Link>
        </div>
      )}
    </header>
  );
}
