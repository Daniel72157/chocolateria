import { Link, useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAdminGet, useAdminMutation, json } from '../../hooks/useAdmin';
import { cop, dateTime, waUrl } from '../../lib/format';
import StatusBadge, { STATUS_LABEL } from './StatusBadge';
import type { OrderRow, OrderStatus } from '../../../shared/types';

export default function OrderDetail() {
  const { id } = useParams();
  const { data: o } = useAdminGet<OrderRow>(['order', id], `/admin/orders/${id}`);
  const change = useAdminMutation((status: OrderStatus) => api(`/admin/orders/${id}`, json('PATCH', { status })), { invalidate: [['admin', 'order', id], ['admin', 'orders']], ok: 'Estado actualizado' });
  if (!o) return <p>Cargando…</p>;
  return (
    <>
      <Link to="/admin/pedidos" className="font-semibold underline">← Pedidos</Link>
      <div className="mt-3 flex flex-wrap items-center gap-4"><h1 className="t-h2 num text-4xl">{o.code}</h1><StatusBadge status={o.status} /></div>
      <p className="mt-1 text-tierra">{dateTime(o.created_at)}</p>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="cli" className="bg-crema p-5">
          <h2 id="cli" className="font-display text-2xl">Cliente y entrega</h2>
          <dl className="mt-3 grid gap-1">
            {([['Nombre', o.customer_name], ['Celular', o.customer_phone], ['Correo', o.customer_email], ['Cédula/NIT', o.customer_document], ['Empresa', o.company_name],
              ['Entrega', o.delivery_method === 'domicilio' ? `Domicilio: ${o.address}, ${o.neighborhood}, ${o.city}` : 'Recoger en tienda'], ['Fecha deseada', o.preferred_date], ['Pago preferido', o.payment_method], ['Notas', o.notes]] as [string, string | null][]).filter(([, v]) => v).map(([k, v]) => <div key={k} className="flex gap-3"><dt className="w-32 shrink-0 font-bold">{k}</dt><dd>{v}</dd></div>)}
          </dl>
          <a className="btn btn-wa mt-5" target="_blank" rel="noopener noreferrer" href={waUrl(o.customer_phone.replace(/\D/g, '').replace(/^(?!57)/, '57'), `Hola ${o.customer_name}, te escribimos por tu pedido ${o.code}.`)}><MessageCircle size={18} aria-hidden /> Escribir al cliente</a>
        </section>
        <section aria-labelledby="lin" className="bg-crema p-5">
          <h2 id="lin" className="font-display text-2xl">Productos</h2>
          <ul className="mt-3 grid gap-2">{o.order_items?.map((i) => <li key={i.id} className="flex justify-between gap-3"><span>{i.quantity} × {i.product_name}{i.variant_name ? ` (${i.variant_name})` : ''}</span><span className="num font-bold">{i.line_total_cop === null ? 'A convenir' : cop(i.line_total_cop)}</span></li>)}</ul>
          <p className="num mt-4 flex justify-between">Subtotal <span>{cop(o.subtotal_cop)}</span></p>
          <p className="num flex justify-between">Domicilio <span>{cop(o.delivery_fee_cop)}</span></p>
          <p className="num mt-2 flex justify-between bg-ink px-3 py-2 font-display text-xl text-papel">Total <span>{cop(o.total_cop)}</span></p>
          {o.has_price_on_request && <p className="t-small mt-2">+ productos con precio a convenir</p>}
          <label htmlFor="estado" className="label mt-6">Cambiar estado</label>
          <select id="estado" className="field !bg-papel" value={o.status} onChange={(e) => change.mutate(e.target.value as OrderStatus)}>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </section>
      </div>
      <details className="mt-8 bg-crema p-5"><summary className="cursor-pointer font-bold">Mensaje original de WhatsApp</summary><pre className="mt-3 whitespace-pre-wrap font-sans">{o.whatsapp_message}</pre></details>
    </>
  );
}
