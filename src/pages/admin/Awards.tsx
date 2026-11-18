import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, FileText, Plus } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useAdminGet, useAdminMutation, json, confirmDelete } from '../../hooks/useAdmin';
import { toast } from '../../store/toast';
import Badge from '../../components/ui/Badge';
import type { Award } from '../../../shared/types';

const KEY = ['admin', 'awards'];

/** Reconocimientos en el mismo orden en que salen en la página; las flechas cambian ese orden. */
export default function Awards() {
  const qc = useQueryClient();
  const { data } = useAdminGet<Award[]>(['awards'], '/admin/awards');
  const del = useAdminMutation((id: string) => api(`/admin/awards/${id}`, json('DELETE')), { invalidate: [KEY, ['awards']], ok: 'Reconocimiento eliminado' });
  const toggle = useAdminMutation(({ id, on }: { id: string; on: boolean }) => api(`/admin/awards/${id}`, json('PATCH', { isPublished: on })), { invalidate: [KEY, ['awards']] });
  const reorder = useMutation({
    mutationFn: (ids: string[]) => api('/admin/awards/order', json('PUT', { ids })),
    onMutate: (ids) => {
      const prev = qc.getQueryData<Award[]>(KEY);
      if (prev) qc.setQueryData(KEY, ids.map((id) => prev.find((a) => a.id === id)!));
      return { prev };
    },
    onError: (e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(KEY, ctx.prev); toast.error(e instanceof ApiError ? e.message : 'No se pudo cambiar el orden'); },
    onSettled: () => { void qc.invalidateQueries({ queryKey: KEY }); void qc.invalidateQueries({ queryKey: ['awards'] }); },
  });
  const move = (i: number, d: number) => {
    if (!data) return;
    const ids = data.map((a) => a.id);
    [ids[i], ids[i + d]] = [ids[i + d], ids[i]];
    reorder.mutate(ids);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="t-h2 text-4xl">Reconocimientos</h1>
        <Link to="/admin/reconocimientos/nuevo" className="btn btn-primary"><Plus size={18} aria-hidden /> Nuevo reconocimiento</Link>
      </div>
      <p className="mt-3 max-w-[60ch] text-tierra">Se muestran en la página en este mismo orden. Usa las flechas para moverlos.</p>
      {data?.length === 0 && <p className="mt-6">Todavía no has agregado reconocimientos.</p>}
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data?.map((a, i) => (
          <li key={a.id} className="flex flex-col bg-crema">
            <div className="relative bg-arena/40 p-3">
              <img src={a.image_url} alt="" className="aspect-[4/3] w-full object-contain" />
              <span className="num absolute left-2 top-2 rounded-full bg-ink px-2 text-sm font-bold text-papel">{i + 1}</span>
              {a.file_url && <a href={a.file_url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir PDF de ${a.title}`} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-papel"><FileText size={16} /></a>}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex-1">
                <p className="font-bold leading-tight">{a.title}</p>
                {(a.issuer || a.year) && <p className="t-small text-tierra">{[a.issuer, a.year].filter(Boolean).join(' · ')}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => toggle.mutate({ id: a.id, on: !a.is_published })} title="Cambiar visibilidad"><Badge tone={a.is_published ? 'sage' : 'light'}>{a.is_published ? 'Visible' : 'Oculto'}</Badge></button>
                <span className="ml-auto flex gap-1">
                  <button type="button" disabled={i === 0 || reorder.isPending} aria-label="Mover antes" onClick={() => move(i, -1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-papel disabled:opacity-30"><ArrowLeft size={16} /></button>
                  <button type="button" disabled={i === data.length - 1 || reorder.isPending} aria-label="Mover después" onClick={() => move(i, 1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-papel disabled:opacity-30"><ArrowRight size={16} /></button>
                </span>
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/reconocimientos/${a.id}`} className="btn btn-soft btn-sm flex-1">Editar</Link>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => confirmDelete(`«${a.title}»`) && del.mutate(a.id)}>Eliminar</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
