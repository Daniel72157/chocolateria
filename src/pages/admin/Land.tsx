import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useAdminGet, useAdminMutation, json, confirmDelete } from '../../hooks/useAdmin';
import { toast } from '../../store/toast';
import Badge from '../../components/ui/Badge';
import type { LandTile } from '../../../shared/types';

const KEY = ['admin', 'land'];

/** Fotos de "Nuestra tierra" en el mismo orden en que salen en el inicio; las flechas cambian ese orden. */
export default function Land() {
  const qc = useQueryClient();
  const { data } = useAdminGet<LandTile[]>(['land'], '/admin/land');
  const done = [KEY, ['land']];
  const del = useAdminMutation((id: string) => api(`/admin/land/${id}`, json('DELETE')), { invalidate: done, ok: 'Foto eliminada' });
  const toggle = useAdminMutation(({ id, on }: { id: string; on: boolean }) => api(`/admin/land/${id}`, json('PATCH', { isPublished: on })), { invalidate: done });
  const reorder = useMutation({
    mutationFn: (ids: string[]) => api('/admin/land/order', json('PUT', { ids })),
    onMutate: (ids) => {
      const prev = qc.getQueryData<LandTile[]>(KEY);
      if (prev) qc.setQueryData(KEY, ids.map((id) => prev.find((a) => a.id === id)!));
      return { prev };
    },
    onError: (e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(KEY, ctx.prev); toast.error(e instanceof ApiError ? e.message : 'No se pudo cambiar el orden'); },
    onSettled: () => { qc.invalidateQueries({ queryKey: KEY }); qc.invalidateQueries({ queryKey: ['land'] }); },
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
        <h1 className="t-h2 text-4xl">Nuestra tierra</h1>
        <Link to="/admin/tierra/nueva" className="btn btn-primary"><Plus size={18} aria-hidden /> Nueva foto</Link>
      </div>
      <p className="mt-3 max-w-[60ch] text-tierra">Son las fotos de la sección «Nuestra tierra» del inicio. Al tocar una, los visitantes leen su historia. Usa las flechas para cambiar el orden.</p>
      {data?.length === 0 && <p className="mt-6">Todavía no hay fotos.</p>}
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data?.map((t, i) => (
          <li key={t.id} className="flex flex-col bg-crema">
            <div className="relative aspect-[4/5] overflow-hidden bg-arena">
              <img src={t.image_url} alt="" className="h-full w-full object-cover" />
              <span className="num absolute left-2 top-2 rounded-full bg-ink px-2 text-sm font-bold text-papel">{i + 1}</span>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              <div className="flex-1">
                <p className="font-bold leading-tight">{t.name}</p>
                {t.tag && <p className="t-small text-tierra">{t.tag}</p>}
                <p className="t-small mt-1 line-clamp-2 text-tierra">{t.story || '(Sin historia)'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => toggle.mutate({ id: t.id, on: !t.is_published })} title="Cambiar visibilidad"><Badge tone={t.is_published ? 'sage' : 'light'}>{t.is_published ? 'Visible' : 'Oculta'}</Badge></button>
                <span className="ml-auto flex gap-1">
                  <button type="button" disabled={i === 0 || reorder.isPending} aria-label="Mover antes" onClick={() => move(i, -1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-papel disabled:opacity-30"><ArrowLeft size={16} /></button>
                  <button type="button" disabled={i === data.length - 1 || reorder.isPending} aria-label="Mover después" onClick={() => move(i, 1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-papel disabled:opacity-30"><ArrowRight size={16} /></button>
                </span>
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/tierra/${t.id}`} className="btn btn-soft btn-sm flex-1">Editar</Link>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => confirmDelete(`«${t.name}»`) && del.mutate(t.id)}>Eliminar</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
