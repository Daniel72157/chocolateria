import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/ui/Seo';
import PostCard from '../components/forum/PostCard';
import Reveal from '../components/ui/Reveal';
import Skeleton from '../components/ui/Skeleton';
import { usePostFeed } from '../hooks/usePosts';

export default function Community() {
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
      <section aria-label="Publicaciones" className="wrap pb-24">
        <div className="mx-auto grid max-w-[680px] gap-6">
          {isLoading && [0, 1].map((i) => <Skeleton key={i} className="h-72" />)}
          {posts.map((p) => <Reveal key={p.id}><PostCard post={p} /></Reveal>)}
          {!isLoading && posts.length === 0 && <p className="paper p-8 text-center">Todavía no hay publicaciones. Vuelve pronto.</p>}
          <div ref={sentinel} aria-hidden className="h-1" />
          {hasNextPage && <button type="button" className="btn btn-soft justify-self-center" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>{isFetchingNextPage ? 'Cargando…' : 'Ver publicaciones anteriores'}</button>}
        </div>
      </section>
    </>
  );
}
