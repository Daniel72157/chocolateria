import { useState } from 'react';
import Reveal from '../../components/ui/Reveal';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import { useLand } from '../../hooks/useProducts';
import type { LandTile } from '../../../shared/types';

const PAIRS = ['bg-ink text-papel', 'bg-oro text-ink', 'bg-bosque text-papel', 'bg-arena text-ink'];

/** Las fotos del lugar como estampas con su tira de etiqueta. Cada una abre una ventana con su historia.
 *  Las fotos y las historias se editan desde el panel (Nuestra tierra). */
export default function Land() {
  const { data: tiles, isLoading } = useLand();
  const [open, setOpen] = useState<LandTile | null>(null);
  if (!isLoading && !tiles?.length) return null;
  return (
    <section aria-labelledby="tierra-title" className="bg-crema py-[clamp(72px,11vw,150px)]">
      <div className="wrap">
        <Reveal>
          <h2 id="tierra-title" className="t-h2">Nuestra tierra</h2>
          <p className="t-lead mt-4 max-w-[40ch] text-justify hyphens-auto">Una historia que comienza en la tierra. Toca una foto para conocer su historia.</p>
        </Reveal>
        <ul className="mt-10 grid grid-cols-2 gap-x-2 gap-y-6 lg:grid-cols-4 lg:gap-x-3">
          {isLoading && Array.from({ length: 4 }, (_, i) => <li key={i}><Skeleton className="aspect-[4/5]" /></li>)}
          {tiles?.map((t, i) => (
            <Reveal as="li" key={t.id} delay={(i % 4) * 0.07}>
              <button type="button" onClick={() => setOpen(t)} aria-label={`Ver la historia: ${t.name}`} className="hover-zoom block w-full text-left">
                <figure>
                  <div className="aspect-[4/5] overflow-hidden bg-arena"><img src={t.image_url} alt={t.name} width={t.width ?? 800} height={t.height ?? 1000} loading="lazy" className="h-full w-full object-cover" /></div>
                  <figcaption className={`flex items-center justify-between gap-2 p-3 ${PAIRS[i % 4]}`}><span className="font-display font-semibold">{t.name}</span>{t.tag && <span>{t.tag}</span>}</figcaption>
                </figure>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} label={open?.title || open?.name || 'Historia'} className="max-w-3xl">
        {open && (
          <div>
            <img src={open.image_url} alt={open.name} width={open.width ?? 800} height={open.height ?? 1000} className="max-h-[60svh] w-full object-cover" />
            <div className="p-6 md:p-8">
              <h3 className="t-h3 text-[clamp(1.6rem,2.6vw,2.4rem)]">{open.title || open.name}</h3>
              <div className="mt-4 grid gap-3 text-justify hyphens-auto text-lg">{(open.story ?? '').split('\n').map((l, k) => <p key={k}>{l}</p>)}</div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
