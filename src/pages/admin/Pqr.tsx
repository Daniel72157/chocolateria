import { useState } from 'react';
import { api } from '../../lib/api';
import { useAdminGet, useAdminMutation, json, confirmDelete } from '../../hooks/useAdmin';
import { ago } from '../../lib/format';
import { PQR_LABEL, PQR_STATUSES, PQR_TYPES } from '../../../shared/schemas';

type Status = (typeof PQR_STATUSES)[number];
type Type = (typeof PQR_TYPES)[number];
type Row = { id: string; code: string; type: Type; name: string; phone: string | null; email: string | null; body: string; status: Status; created_at: string };
type Data = { summary: { total: number; byType: Record<string, number>; byStatus: Record<string, number>; byMonth: Record<string, number> }; items: Row[] };
const STATUS_LABEL: Record<Status, string> = { nuevo: 'Nuevo', en_proceso: 'En proceso', resuelto: 'Resuelto' };

export default function Pqr() {
  const [status, setStatus] = useState<'' | Status>('');
  const [type, setType] = useState<'' | Type>('');
  const { data } = useAdminGet<Data>(['pqr', status, type], `/admin/pqr?status=${status}&type=${type}`);
  const inv = [['admin', 'pqr']];
  const set = useAdminMutation(({ id, status }: { id: string; status: Status }) => api(`/admin/pqr/${id}`, json('PATCH', { status })), { invalidate: inv, ok: 'Listo' });
  const del = useAdminMutation((id: string) => api(`/admin/pqr/${id}`, json('DELETE')), { invalidate: inv, ok: 'Mensaje eliminado' });
  const sm = data?.summary;
  const months = Object.entries(sm?.byMonth ?? {}).sort().slice(-6);
  const max = Math.max(1, ...months.map(([, n]) => n));
  return (
    <>
      <h1 className="t-h2 text-4xl">PQR</h1>
      {sm && (
        <section aria-label="Balance" className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="bg-crema p-4"><p className="t-small">Total recibidos</p><p className="num font-display text-4xl">{sm.total}</p>
            <p className="t-small mt-2">{PQR_STATUSES.map((s) => `${STATUS_LABEL[s]}: ${sm.byStatus[s] ?? 0}`).join(' · ')}</p></div>
          <div className="bg-crema p-4"><p className="t-small">Por tipo</p>
            <ul className="num mt-1">{PQR_TYPES.map((t) => <li key={t} className="flex justify-between"><span>{PQR_LABEL[t]}</span><strong>{sm.byType[t] ?? 0}</strong></li>)}</ul></div>
          <div className="bg-crema p-4"><p className="t-small">Últimos meses</p>
            <ul className="num mt-1 grid gap-1">{months.length === 0 && <li>Sin datos</li>}{months.map(([m, n]) => (
              <li key={m} className="flex items-center gap-2"><span className="w-16">{m}</span><span className="h-3 bg-bosque" style={{ width: `${(n / max) * 100}%` }} /><strong>{n}</strong></li>
            ))}</ul></div>
        </section>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        <select aria-label="Filtrar por estado" className="field !w-auto" value={status} onChange={(e) => setStatus(e.target.value as '' | Status)}>
          <option value="">Todos los estados</option>{PQR_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select aria-label="Filtrar por tipo" className="field !w-auto" value={type} onChange={(e) => setType(e.target.value as '' | Type)}>
          <option value="">Todos los tipos</option>{PQR_TYPES.map((t) => <option key={t} value={t}>{PQR_LABEL[t]}</option>)}
        </select>
      </div>
      <ul className="mt-6 grid gap-3">
        {data?.items.length === 0 && <li>No hay mensajes aquí.</li>}
        {data?.items.map((r) => (
          <li key={r.id} className="bg-crema p-4">
            <p className="flex flex-wrap justify-between gap-2"><span><strong>{r.name}</strong> · {PQR_LABEL[r.type]} · <span className="num">{r.code}</span></span><span className="t-small">{ago(r.created_at)}</span></p>
            {(r.phone || r.email) && <p className="t-small mt-1">{[r.phone, r.email].filter(Boolean).join(' · ')}</p>}
            <p className="mt-2 whitespace-pre-line">{r.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PQR_STATUSES.filter((s) => s !== r.status).map((s) => <button key={s} className="btn btn-soft btn-sm" onClick={() => set.mutate({ id: r.id, status: s })}>Marcar {STATUS_LABEL[s].toLowerCase()}</button>)}
              <span className="rounded-full bg-bosque px-3 py-2 text-sm text-papel">{STATUS_LABEL[r.status]}</span>
              <button className="btn btn-danger btn-sm" onClick={() => confirmDelete('este mensaje') && del.mutate(r.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
