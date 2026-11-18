import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAdminGet, useAdminMutation, json } from '../../hooks/useAdmin';
import { postInput } from '../../../shared/schemas';
import ImageList, { type Img } from '../../components/ui/ImageList';
import ImageGallery from '../../components/forum/ImageGallery';
import Linkified from '../../components/forum/Linkified';
import VideoEmbed from '../../components/forum/VideoEmbed';
import { useSettings } from '../../hooks/useProducts';
import { toast } from '../../store/toast';

type Row = { id: string; kind?: 'publicacion' | 'entrevista'; title: string | null; video_url: string | null; body: string | null; is_published: boolean; is_pinned: boolean; allow_comments: boolean; post_media: (Img & { sort_order: number })[] };
const MAX = 5000;

/** Formulario del blog y de entrevistas: texto, fotos y (en entrevistas) título y video. */
export default function PostForm({ kind: routeKind = 'publicacion' }: { kind?: 'publicacion' | 'entrevista' }) {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: s } = useSettings();
  const { data: ex } = useAdminGet<Row>(['post', id], `/admin/posts/${id}`, !!id);
  // Al editar, manda el tipo guardado (por si se abrió desde la sección equivocada).
  const kind = ex?.kind ?? routeKind;
  const interview = kind === 'entrevista';
  const base = interview ? '/admin/entrevistas' : '/admin/publicaciones';
  const [title, setTitle] = useState('');
  const [video, setVideo] = useState('');
  const [body, setBody] = useState('');
  const [media, setMedia] = useState<Img[]>([]);
  const [pin, setPin] = useState(false);
  const [comments, setComments] = useState(true);
  const [draft, setDraft] = useState(false);
  const [dirty, setDirty] = useState(false);
  useEffect(() => { if (ex) { setTitle(ex.title ?? ''); setVideo(ex.video_url ?? ''); setBody(ex.body ?? ''); setMedia(ex.post_media.map((m) => ({ url: m.url, path: m.path, width: m.width, height: m.height }))); setPin(ex.is_pinned); setComments(ex.allow_comments); setDraft(!ex.is_published); } }, [ex]);
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h); }, [dirty]);

  const save = useAdminMutation((p: unknown) => (id ? api(`/admin/posts/${id}`, json('PUT', p)) : api('/admin/posts', json('POST', p))),
    { invalidate: [['admin', 'posts'], ['posts'], ['posts-latest'], ['post']], ok: interview ? 'Entrevista guardada' : 'Publicación guardada', onDone: () => { setDirty(false); setTimeout(() => nav(base), 0); } });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = postInput.safeParse({
      kind, title: interview ? title : undefined, videoUrl: interview ? video : undefined,
      body, isPublished: !draft, isPinned: pin, allowComments: comments, media: media.map(({ url, path, width, height }) => ({ url, path, width, height })),
    });
    if (!r.success) return toast.error(r.error.issues[0].message);
    save.mutate(r.data);
  };
  const touch = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setDirty(true); };
  const validVideo = /^https?:\/\/\S+\.\S+/.test(video.trim());

  return (
    <form onSubmit={submit} className="grid max-w-5xl gap-6 lg:grid-cols-2">
      <div className="grid content-start gap-5">
        <h1 className="t-h2 text-4xl">{interview ? (id ? 'Editar entrevista' : 'Nueva entrevista') : (id ? 'Editar entrada' : 'Nueva entrada')}</h1>
        {interview && <>
          <div><label htmlFor="pt" className="label">Título</label>
            <input id="pt" className="field !bg-crema" maxLength={160} value={title} onChange={(e) => touch(setTitle)(e.target.value)} placeholder="Ej.: Entrevista en Caracol Radio" /></div>
          <div><label htmlFor="pv" className="label">Enlace del video (opcional)</label>
            <input id="pv" type="url" inputMode="url" className="field !bg-crema" value={video} onChange={(e) => touch(setVideo)(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
            <p className="t-small mt-1 text-tierra">YouTube, Vimeo, Facebook o Google Drive (compartido como «Cualquier persona con el enlace»).</p></div>
        </>}
        <div><label htmlFor="pb" className="label">{interview ? 'Texto de la entrevista' : '¿Qué quieres contar?'}</label>
          <textarea id="pb" className="field !min-h-[180px] !bg-crema" maxLength={MAX} value={body} onChange={(e) => { touch(setBody)(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} />
          <p className="num t-small mt-1 text-right">{body.length}/{MAX}</p></div>
        <div><p className="label">Fotos (hasta 10)</p><ImageList bucket="posts" folder={id ?? 'tmp'} max={10} value={media} onChange={touch(setMedia)} /></div>
        <fieldset className="grid gap-3 bg-crema p-4"><legend className="sr-only">Opciones</legend>
          {([['Fijar arriba', pin, setPin], ['Permitir comentarios', comments, setComments], ['Guardar como borrador', draft, setDraft]] as const).map(([l, v, set]) => (
            <label key={l} className="flex items-center gap-3"><input type="checkbox" className="h-6 w-6 accent-bosque" checked={v} onChange={(e) => touch(set)(e.target.checked)} />{l}</label>
          ))}
        </fieldset>
        <div className="flex gap-3"><button type="submit" className="btn btn-primary" disabled={save.isPending}>{draft ? 'Guardar borrador' : 'Publicar'}</button><Link to={base} className="btn btn-light">Cancelar</Link></div>
      </div>
      <aside aria-label="Vista previa" className="lg:sticky lg:top-6 lg:self-start">
        <p className="label">{interview ? 'Así se verá en Entrevistas' : 'Así se verá en el blog'}</p>
        <div className="paper bg-crema p-5">
          <p className="font-bold">{s?.store_name}</p><p className="t-small mb-3 text-tierra">hace un momento</p>
          {interview && title && <p className="mb-3 font-display text-xl font-semibold leading-tight">{title}</p>}
          {interview && validVideo && <div className="mb-3"><VideoEmbed url={video} title={title || 'Video'} /></div>}
          {body && <p className="mb-3"><Linkified text={body} /></p>}
          <ImageGallery media={media.map((m, i) => ({ url: m.url, width: m.width ?? null, height: m.height ?? null, sort_order: i }))} />
          {!body && media.length === 0 && !validVideo && <p className="text-tierra">{interview ? 'Escribe el texto, pega un video o agrega fotos para ver la vista previa.' : 'Escribe algo o agrega fotos para ver la vista previa.'}</p>}
        </div>
      </aside>
    </form>
  );
}
