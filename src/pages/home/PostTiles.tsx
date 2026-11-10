import { Link } from 'react-router-dom';
import { useLatestPosts } from '../../hooks/usePosts';
import { ago } from '../../lib/format';
import Reveal from '../../components/ui/Reveal';
import Skeleton from '../../components/ui/Skeleton';
import type { Post } from '../../../shared/types';

const PAIRS = ['bg-ink text-papel', 'bg-oro text-ink', 'bg-bosque text-papel', 'bg-crema text-ink'];
const total = (p: Post) => Object.values(p.reactionCounts).reduce((a, b) => a + (b ?? 0), 0);

/** Las últimas publicaciones como estampas con su tira de etiqueta. */
export default function PostTiles() {
  const { data, isLoading } = useLatestPosts(3);
  return (
    <section aria-labelledby="comunidad-title" className="bg-arena py-[clamp(72px,12vw,160px)]">
      <div className="wrap">
        <h2 id="comunidad-title" className="t-h2 text-[clamp(1.75rem,3vw,2.25rem)]">Lo último en el blog</h2>
        <ul className="mt-10 grid grid-cols-2 gap-x-2 gap-y-7 lg:grid-cols-4 lg:gap-x-3">
          {isLoading && [0, 1, 2].map((i) => <li key={i}><Skeleton className="aspect-[4/5]" /></li>)}
          {data?.map((p, i) => {
            const media = p.post_media[0];
            return (
              <Reveal as="li" key={p.id} delay={i * 0.08}>
                <Link to={`/blog/${p.id}`} className="hover-zoom block" aria-label={`Ver la publicación de ${ago(p.created_at)}`}>
                  <div className="aspect-[4/5] overflow-hidden bg-arena">
                    {media ? <img src={media.url} alt="" width={800} height={1000} loading="lazy" className="h-full w-full object-cover" />
                      : <p className="flex h-full items-center bg-papel p-5 text-base">{p.body?.slice(0, 140)}</p>}
                  </div>
                  <div className={`num flex min-w-0 flex-col gap-1 break-words p-3 text-base font-semibold ${PAIRS[i % 4]}`}>
                    <span className="flex flex-wrap justify-between gap-x-2"><span>{total(p)} reacciones</span><span>{p.commentCount} comentarios</span></span>
                    <span className="flex flex-wrap justify-between gap-x-2"><span>{ago(p.created_at)}</span><span>{p.is_pinned ? 'Fijado' : 'Ver publicación'}</span></span>
                    <span className="line-clamp-1">{p.body?.split('\n')[0]}</span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
          <li className="col-span-2 lg:col-span-1">
            <Link to="/blog" className="flex h-full min-h-[160px] flex-col justify-between bg-oro p-5 transition hover:bg-crema lg:aspect-[4/5]">
              <span className="font-display text-2xl leading-tight">Entra al blog</span>
              <span className="font-semibold">Reacciona y comenta →</span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
