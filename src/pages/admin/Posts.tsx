import { Link } from 'react-router-dom';
import { Plus, Pin } from 'lucide-react';
import { api } from '../../lib/api';
import { useAdminGet, useAdminMutation, json, confirmDelete } from '../../hooks/useAdmin';
import { ago } from '../../lib/format';
import Badge from '../../components/ui/Badge';
import type { Post } from '../../../shared/types';

type Row = Post & { reactionCount: number; pendingCount: number };

export default function Posts() {
  const { data } = useAdminGet<Row[]>(['posts'], '/admin/posts');
  const del = useAdminMutation((id: string) => api(`/admin/posts/${id}`, json('DELETE')), { invalidate: [['admin', 'posts'], ['posts'], ['posts-latest']], ok: 'Publicación eliminada' });
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="t-h2 text-4xl">Blog</h1><Link to="/admin/publicaciones/nueva" className="btn btn-primary"><Plus size={18} aria-hidden /> Nueva entrada</Link></div>
      <ul className="mt-6 grid gap-3">
        {data?.length === 0 && <li>Todavía no has publicado nada.</li>}
        {data?.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-4 bg-crema p-4">
            {p.post_media[0] ? <img src={p.post_media[0].url} alt="" width={64} height={80} className="h-20 w-16 bg-arena object-cover" /> : <span className="h-20 w-16 bg-arena" aria-hidden />}
            <div className="min-w-[200px] flex-1">
              <p className="line-clamp-2">{p.body ?? '(Solo imágenes)'}</p>
              <p className="t-small mt-1 flex flex-wrap items-center gap-2 text-tierra">{ago(p.created_at)} · <span className="num">{p.reactionCount} reacciones · {p.commentCount} comentarios{p.pendingCount ? ` · ${p.pendingCount} pendientes` : ''}</span></p>
            </div>
            <span className="flex gap-2">{p.is_pinned && <Badge tone="gold"><Pin size={12} className="mr-1" aria-hidden />Fijado</Badge>}<Badge tone={p.is_published ? 'sage' : 'light'}>{p.is_published ? 'Publicado' : 'Borrador'}</Badge></span>
            <span className="flex gap-2"><Link to={`/admin/publicaciones/${p.id}`} className="btn btn-soft btn-sm">Editar</Link><button className="btn btn-danger btn-sm" onClick={() => confirmDelete('esta publicación') && del.mutate(p.id)}>Eliminar</button></span>
          </li>
        ))}
      </ul>
    </>
  );
}
