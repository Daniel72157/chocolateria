import { Link } from 'react-router-dom';
import { Plus, Pin, PlayCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAdminGet, useAdminMutation, json, confirmDelete } from '../../hooks/useAdmin';
import { ago } from '../../lib/format';
import Badge from '../../components/ui/Badge';
import type { Post } from '../../../shared/types';

type Row = Post & { reactionCount: number; pendingCount: number };

/** Lista del blog o de entrevistas (misma tabla, distinto `kind`). */
export default function Posts({ kind = 'publicacion' }: { kind?: 'publicacion' | 'entrevista' }) {
  const interview = kind === 'entrevista';
  const base = interview ? '/admin/entrevistas' : '/admin/publicaciones';
  const { data } = useAdminGet<Row[]>(['posts', kind], `/admin/posts?kind=${kind}`);
  const del = useAdminMutation((id: string) => api(`/admin/posts/${id}`, json('DELETE')), { invalidate: [['admin', 'posts'], ['posts'], ['posts-latest']], ok: interview ? 'Entrevista eliminada' : 'Publicación eliminada' });
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="t-h2 text-4xl">{interview ? 'Entrevistas' : 'Blog'}</h1>
        <Link to={`${base}/nueva`} className="btn btn-primary"><Plus size={18} aria-hidden /> {interview ? 'Nueva entrevista' : 'Nueva entrada'}</Link>
      </div>
      <ul className="mt-6 grid gap-3">
        {data?.length === 0 && <li>{interview ? 'Todavía no has agregado entrevistas.' : 'Todavía no has publicado nada.'}</li>}
        {data?.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-4 bg-crema p-4">
            {p.post_media[0] ? <img src={p.post_media[0].url} alt="" width={64} height={80} className="h-20 w-16 bg-arena object-cover" />
              : <span className="flex h-20 w-16 items-center justify-center bg-arena text-tierra" aria-hidden>{p.video_url && <PlayCircle />}</span>}
            <div className="min-w-[200px] flex-1">
              {p.title && <p className="font-bold">{p.title}</p>}
              <p className="line-clamp-2">{p.body ?? (p.video_url ? '(Video)' : '(Solo imágenes)')}</p>
              <p className="t-small mt-1 flex flex-wrap items-center gap-2 text-tierra">{ago(p.created_at)} · <span className="num">{p.reactionCount} reacciones · {p.commentCount} comentarios{p.pendingCount ? ` · ${p.pendingCount} pendientes` : ''}</span></p>
            </div>
            <span className="flex gap-2">{p.is_pinned && <Badge tone="gold"><Pin size={12} className="mr-1" aria-hidden />Fijado</Badge>}<Badge tone={p.is_published ? 'sage' : 'light'}>{p.is_published ? 'Publicado' : 'Borrador'}</Badge></span>
            <span className="flex gap-2"><Link to={`${base}/${p.id}`} className="btn btn-soft btn-sm">Editar</Link><button className="btn btn-danger btn-sm" onClick={() => confirmDelete(interview ? 'esta entrevista' : 'esta publicación') && del.mutate(p.id)}>Eliminar</button></span>
          </li>
        ))}
      </ul>
    </>
  );
}
