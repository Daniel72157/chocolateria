import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mic } from 'lucide-react';
import Seo from '../components/ui/Seo';
import PostCard from '../components/forum/PostCard';
import Reveal from '../components/ui/Reveal';
import Skeleton from '../components/ui/Skeleton';
import { usePostFeed } from '../hooks/usePosts';
import { INTERVIEWS } from '../data/content';

export default function Community() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'entrevistas' ? 'entrevistas' : 'publicaciones';
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePostFeed();
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && !isFetchingNextPage && fetchNextPage(), { rootMargin: '400px' });
    io.observe(el); return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const posts = data?.pages.flatMap((p) => p.items) ?? [];
  return (
    <>
      <Seo title="Blog" description="Novedades, lotes nuevos y avisos de la tienda. Reacciona y comenta." path="/blog" />
      <Reveal as="section" className="wrap pb-8 pt-14 md:pt-20">
        <h1 className="t-display text-[clamp(2.6rem,6.5vw,6rem)]">Blog</h1>
        <p className="t-lead mt-5 max-w-[36ch]">Novedades, historias y avisos de la tienda. Reacciona con un toque y cuéntanos qué piensas.</p>
        <Link to="/tienda" className="btn btn-primary mt-8">Ir a la tienda virtual</Link>
      </Reveal>
      <div role="tablist" aria-label="Secciones del blog" className="wrap mb-8 flex gap-2">
        {([['publicaciones', 'Publicaciones'], ['entrevistas', 'Entrevistas']] as const).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setParams(k === 'publicaciones' ? {} : { tab: k }, { replace: true })}
            className={`rounded-full px-6 py-3 font-semibold transition ${tab === k ? 'bg-bosque text-papel' : 'bg-arena hover:bg-oro'}`}>{l}</button>
        ))}
      </div>
      {tab === 'entrevistas' && (
        <section aria-label="Entrevistas" className="wrap pb-24">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {INTERVIEWS.map((v) => (
              <Reveal as="li" key={v.title}>
                <article className="paper h-full">
                  {v.image && <img src={v.image} alt={v.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />}
                  <div className="p-5">
                    <p className="num text-tierra">{v.outlet} · {v.date}</p>
                    <h2 className="mt-1 font-display text-xl font-semibold">{v.title}</h2>
                    {v.summary && <p className="mt-2">{v.summary}</p>}
                    {v.url && <a className="btn btn-soft btn-sm mt-4" href={v.url} target="_blank" rel="noopener noreferrer">Ver entrevista</a>}
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
          {INTERVIEWS.length === 0 && (
            <div className="mx-auto flex max-w-[680px] flex-col items-center gap-3 border-2 border-dashed border-tierra/40 bg-crema p-10 text-center text-tierra">
              <Mic size={36} aria-hidden />
              <p className="font-display text-lg">Próximamente</p>
              <p className="t-small">Aquí compartiremos las entrevistas que nos han realizado.</p>
            </div>
          )}
        </section>
      )}
      {tab === 'publicaciones' && <section aria-label="Publicaciones" className="wrap pb-24">
        <div className="mx-auto grid max-w-[680px] gap-6">
          {isLoading && [0, 1].map((i) => <Skeleton key={i} className="h-72" />)}
          {posts.map((p) => <Reveal key={p.id}><PostCard post={p} /></Reveal>)}
          {!isLoading && posts.length === 0 && <p className="paper p-8 text-center">Todavía no hay publicaciones. Vuelve pronto.</p>}
          <div ref={sentinel} aria-hidden className="h-1" />
          {hasNextPage && <button type="button" className="btn btn-soft justify-self-center" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>{isFetchingNextPage ? 'Cargando…' : 'Ver publicaciones anteriores'}</button>}
        </div>
      </section>}
    </>
  );
}
