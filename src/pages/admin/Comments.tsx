import { useState } from 'react';
import { api } from '../../lib/api';
import { useAdminGet, useAdminMutation, json, confirmDelete } from '../../hooks/useAdmin';
import { ago } from '../../lib/format';
import type { CommentStatus } from '../../../shared/types';

type Row = { id: string; author_name: string; body: string; created_at: string; status: CommentStatus; posts?: { body: string | null } };
const TABS: [CommentStatus, string][] = [['pendiente', 'Pendientes'], ['aprobado', 'Aprobados'], ['rechazado', 'Rechazados']];

export default function Comments() {
  const [tab, setTab] = useState<CommentStatus>('pendiente');
  const { data } = useAdminGet<Row[]>(['comments', tab], `/admin/comments?status=${tab}`);
  const inv = [['admin', 'comments']];
  const set = useAdminMutation(({ id, status }: { id: string; status: CommentStatus }) => api(`/admin/comments/${id}`, json('PATCH', { status })), { invalidate: inv, ok: 'Listo' });
  const del = useAdminMutation((id: string) => api(`/admin/comments/${id}`, json('DELETE')), { invalidate: inv, ok: 'Comentario eliminado' });
  return (
    <>
      <h1 className="t-h2 text-4xl">Comentarios</h1>
      <div role="tablist" className="mt-5 flex gap-2">{TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-full px-5 py-2 font-semibold ${tab === k ? 'bg-bosque text-papel' : 'bg-crema'}`}>{l}</button>)}</div>
      <ul className="mt-6 grid gap-3">
        {data?.length === 0 && <li>No hay comentarios aquí.</li>}
        {data?.map((c) => (
          <li key={c.id} className="bg-crema p-4">
            <p className="flex flex-wrap justify-between gap-2"><strong>{c.author_name}</strong><span className="t-small">{ago(c.created_at)}</span></p>
            <p className="mt-1 whitespace-pre-line">{c.body}</p>
            {c.posts?.body && <p className="t-small mt-2 line-clamp-1 text-tierra">En: {c.posts.body}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {tab !== 'aprobado' && <button className="btn btn-primary btn-sm" onClick={() => set.mutate({ id: c.id, status: 'aprobado' })}>Aprobar</button>}
              {tab !== 'rechazado' && <button className="btn btn-soft btn-sm" onClick={() => set.mutate({ id: c.id, status: 'rechazado' })}>Rechazar</button>}
              <button className="btn btn-danger btn-sm" onClick={() => confirmDelete('este comentario') && del.mutate(c.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
