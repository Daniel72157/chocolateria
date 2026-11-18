import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mic } from 'lucide-react';
import Seo from '../components/ui/Seo';
import PostCard from '../components/forum/PostCard';
import Reveal from '../components/ui/Reveal';
import Skeleton from '../components/ui/Skeleton';
import { usePostFeed } from '../hooks/usePosts';

/** Lista con carga infinita: sirve para publicaciones y para entrevistas. */
function Feed({ kind }: { kind: 'publicacion' | 'entrevista' }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = usePostFeed(kind);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver((e) => e[0].isIntersecting && !isFetchingNextPage && fetchNextPage(), { rootMargin: '400px' });
    io.observe(el); return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const posts = data?.pages.flatMap((p) => p.items) ?? [];
  const interview = kind === 'entrevista';
  return (
    <section aria-label={interview ? 'Entrevistas' : 'Publicaciones'} className="wrap pb-24">
      <div className="mx-auto grid max-w-[680px] gap-6">
        {isLoading && [0, 1].map((i) => <Skeleton key={i} className="h-72" />)}
        {posts.map((p) => <Reveal key={p.id}><PostCard post={p} /></Reveal>)}
        {!isLoading && posts.length === 0 && (interview ? (
          <div className="flex flex-col items-center gap-3 border-2 border-dashed border-tierra/40 bg-crema p-10 text-center text-tierra">
            <Mic size={36} aria-hidden />
            <p className="font-display text-lg">Próximamente</p>
            <p className="t-small">Aquí compartiremos las entrevistas que nos han realizado.</p>
          </div>
        ) : <p className="paper p-8 text-center">Todavía no hay publicaciones. Vuelve pronto.</p>)}
        <div ref={sentinel} aria-hidden className="h-1" />
        {hasNextPage && <button type="button" className="btn btn-soft justify-self-center" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>{isFetchingNextPage ? 'Cargando…' : interview ? 'Ver entrevistas anteriores' : 'Ver publicaciones anteriores'}</button>}
      </div>
    </section>
  );
}

export default function Community() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'entrevistas' ? 'entrevistas' : 'publicaciones';
  return (
    <>
      <Seo title="Blog" description="Novedades, entrevistas y avisos de la tienda. Reacciona y comenta." path="/blog" />
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
      <Feed key={tab} kind={tab === 'entrevistas' ? 'entrevista' : 'publicacion'} />
    </>
  );
}
