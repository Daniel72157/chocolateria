import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { cop, ago } from '../../lib/format';
import { CATALOG_NAME } from '../../store/cart';
import type { AdminStats } from '../../../shared/types';
import StatusBadge from './StatusBadge';

export default function Dashboard() {
  const { data: s } = useQuery({ queryKey: ['admin-stats'], queryFn: () => api<AdminStats>('/admin/stats') });
  const cards: [string, string | number][] = [
    ['Pedidos de hoy', s?.ordersToday ?? '…'], ['Pedidos de la semana', s?.ordersWeek ?? '…'],
    ['Valor estimado de la semana', s ? cop(s.weekValue) : '…'], ['Comentarios pendientes', s?.pendingComments ?? '…'],
  ];
  return (
    <>
      <h1 className="t-h2 text-4xl">Inicio</h1>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([l, v]) => <li key={l} className="bg-crema p-5"><p className="text-base">{l}</p><p className="num mt-1 font-display text-4xl">{v}</p></li>)}
      </ul>
      <h2 className="mt-10 font-display text-2xl">Productos activos por catálogo</h2>
      <ul className="mt-3 flex flex-wrap gap-3">
        {Object.entries(s?.activeProducts ?? {}).map(([k, n]) => <li key={k} className="bg-arena px-4 py-2 font-semibold">{CATALOG_NAME[k] ?? k}: <span className="num">{n}</span></li>)}
      </ul>
      <h2 className="mt-10 font-display text-2xl">Últimos pedidos</h2>
      <ul className="mt-3 grid gap-2">
        {s?.latestOrders.length === 0 && <li>Aún no hay pedidos.</li>}
        {s?.latestOrders.map((o) => (
          <li key={o.id}><Link to={`/admin/pedidos/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 bg-crema p-4 hover:bg-arena">
            <span className="num font-bold">{o.code}</span><span>{o.customer_name}</span><span className="num">{cop(o.total_cop)}</span><StatusBadge status={o.status} /><span className="t-small">{ago(o.created_at)}</span>
          </Link></li>
        ))}
      </ul>
    </>
  );
}
