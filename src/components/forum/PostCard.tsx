import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Pin } from 'lucide-react';
import ImageGallery from './ImageGallery';
import Linkified from './Linkified';
import VideoEmbed from './VideoEmbed';
import Reactions from './Reactions';
import Badge from '../ui/Badge';
import { useSettings } from '../../hooks/useProducts';
import { ago } from '../../lib/format';
import type { Post } from '../../../shared/types';

export default function PostCard({ post, full = false }: { post: Post; full?: boolean }) {
  const { data: s } = useSettings();
  const [expanded, setExpanded] = useState(full);
  const [clamped, setClamped] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { const el = ref.current; if (el && !full) setClamped(el.scrollHeight > el.clientHeight + 2); }, [post.body, full]);

  return (
    <article className="paper p-5 sm:p-6">
      <header className="flex items-center gap-3">
        <img src="/favicon.png" alt="" width={44} height={44} className="h-11 w-11 rounded-full" />
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-tight">{s?.store_name}</p>
          <p className="t-small text-tierra"><time dateTime={post.created_at}>{ago(post.created_at)}</time></p>
        </div>
        {post.is_pinned && <Badge tone="gold"><Pin size={12} className="mr-1" aria-hidden />Fijado</Badge>}
      </header>

      {post.title && (full
        ? <h1 className="mt-4 font-display text-2xl font-semibold leading-tight sm:text-3xl">{post.title}</h1>
        : <h2 className="mt-4 font-display text-xl font-semibold leading-tight sm:text-2xl"><Link to={`/blog/${post.id}`} className="hover:underline">{post.title}</Link></h2>)}
      {post.video_url && <div className="mt-4"><VideoEmbed url={post.video_url} title={post.title ?? 'Video'} /></div>}
      {post.body && (
        <div className="mt-4">
          <div ref={ref} className={expanded ? '' : 'line-clamp-5'}><Linkified text={post.body} /></div>
          {clamped && !expanded && <button type="button" onClick={() => setExpanded(true)} className="mt-1 font-bold underline">Ver más</button>}
        </div>
      )}
      {post.post_media.length > 0 && <div className="mt-4"><ImageGallery media={post.post_media} /></div>}

      <div className="mt-5 grid gap-3">
        <Reactions post={post} />
        <div className="flex items-center justify-between text-base">
          <span className="num text-tierra">{post.commentCount} {post.commentCount === 1 ? 'comentario' : 'comentarios'}</span>
          {!full && <Link to={`/blog/${post.id}`} className="inline-flex min-h-[44px] items-center gap-2 font-bold underline"><MessageCircle size={18} aria-hidden /> Comentar</Link>}
        </div>
      </div>
    </article>
  );
}
