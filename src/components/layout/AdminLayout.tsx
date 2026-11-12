import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Package, Tags, Newspaper, MessageSquare, ClipboardList, Inbox, Settings, LogOut, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import Toasts from '../ui/Toasts';
import type { AdminStats } from '../../../shared/types';

const LINKS = [
  { to: '/admin', label: 'Inicio', Icon: LayoutDashboard, end: true },
  { to: '/admin/productos', label: 'Productos', Icon: Package },
  { to: '/admin/categorias', label: 'Categorías', Icon: Tags },
  { to: '/admin/publicaciones', label: 'Blog', Icon: Newspaper },
  { to: '/admin/comentarios', label: 'Comentarios', Icon: MessageSquare, badge: true },
  { to: '/admin/pqr', label: 'PQR', Icon: Inbox },
  { to: '/admin/pedidos', label: 'Pedidos', Icon: ClipboardList },
  { to: '/admin/ajustes', label: 'Ajustes', Icon: Settings },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: () => api<AdminStats>('/admin/stats'), refetchInterval: 60_000 });
  const out = async () => { await supabase.auth.signOut(); navigate('/admin/login'); };
  return (
    <div className="min-h-[100svh] bg-papel md:flex">
      <aside className="on-dark bg-ink p-3 text-crema md:sticky md:top-0 md:h-[100svh] md:w-64 md:shrink-0 md:p-5">
        <p className="hidden font-display text-2xl md:block">Panel</p>
        <nav aria-label="Administración" className="flex gap-1 overflow-x-auto md:mt-6 md:flex-col">
          {LINKS.map(({ to, label, Icon, end, badge }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex shrink-0 items-center gap-3 rounded-full px-4 py-3 font-semibold transition ${isActive ? 'bg-oro text-ink' : 'hover:bg-bosque'}`}>
              <Icon size={18} aria-hidden /> {label}
              {badge && !!stats?.pendingComments && <span className="num ml-auto rounded-full bg-rojo px-2 text-sm text-papel" aria-label={`${stats.pendingComments} pendientes`}>{stats.pendingComments}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="mt-2 hidden gap-1 md:mt-8 md:flex md:flex-col">
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-full px-4 py-3 font-semibold hover:bg-bosque"><ExternalLink size={18} aria-hidden /> Ver la tienda</a>
          <button type="button" onClick={out} className="flex items-center gap-3 rounded-full px-4 py-3 text-left font-semibold hover:bg-bosque"><LogOut size={18} aria-hidden /> Salir</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-10"><Outlet /></main>
      <Toasts />
    </div>
  );
}
