import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminGet } from '../../hooks/useAdmin';
import { cop, dateTime } from '../../lib/format';
import Pager from '../../components/ui/Pager';
import StatusBadge, { STATUS_LABEL } from './StatusBadge';
import type { OrderRow } from '../../../shared/types';

export default function Orders() {
  const [status, setStatus] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState(''); const [page, setPage] = useState(1);
  const p = new URLSearchParams({ page: String(page) });
  if (status) p.set('status', status); if (from) p.set('from', from); if (to) p.set('to', to);
  const { data } = useAdminGet<{ items: OrderRow[]; total: number; pageSize: number }>(['orders', p.toString()], `/admin/orders?${p}`);
  return (
    <>
      <h1 className="t-h2 text-4xl">Pedidos</h1>
      <div className="mt-5 flex flex-wrap items-end gap-3">
        <div><label className="label" htmlFor="st">Estado</label><select id="st" className="field !bg-crema" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">Todos</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label className="label" htmlFor="fd">Desde</label><input id="fd" type="date" className="field !bg-crema" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} /></div>
        <div><label className="label" htmlFor="td">Hasta</label><input id="td" type="date" className="field !bg-crema" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} /></div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead><tr className="bg-crema">{['Código', 'Fecha', 'Cliente', 'Celular', 'Total', 'Estado'].map((h) => <th key={h} scope="col" className="px-3 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {data?.items.map((o) => (
              <tr key={o.id} className="odd:bg-crema/60">
                <td className="px-3 py-3"><Link className="num font-bold underline" to={`/admin/pedidos/${o.id}`}>{o.code}</Link></td>
                <td className="num px-3 py-3">{dateTime(o.created_at)}</td><td className="px-3 py-3">{o.customer_name}</td><td className="num px-3 py-3">{o.customer_phone}</td>
                <td className="num px-3 py-3">{cop(o.total_cop)}{o.has_price_on_request && ' +'}</td><td className="px-3 py-3"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
            {data?.items.length === 0 && <tr><td colSpan={6} className="px-3 py-8">No hay pedidos con esos filtros.</td></tr>}
          </tbody>
        </table>
      </div>
      {data && <Pager page={page} total={data.total} size={data.pageSize} onPage={setPage} />}
    </>
  );
}
