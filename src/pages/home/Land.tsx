import { useState } from 'react';
import Reveal from '../../components/ui/Reveal';
import Modal from '../../components/ui/Modal';
import { STORIES } from '../../data/content';

const TILES: { img: string; name: string; tag: string; w: number; h: number }[] = [
  { img: 'tucan', name: 'Tucán', tag: 'Aves', w: 720, h: 1440 },
  { img: 'buho', name: 'Búho', tag: 'Aves', w: 1200, h: 1600 },
  { img: 'armadillo', name: 'Armadillo', tag: 'Fauna', w: 709, h: 945 },
  { img: 'ardilla', name: 'Ardilla', tag: 'Fauna', w: 880, h: 1186 },
  { img: 'urraca', name: 'Urraca', tag: 'Aves', w: 960, h: 1280 },
  { img: 'caballos', name: 'Caballos', tag: 'Paisaje', w: 1193, h: 896 },
  { img: 'casa-montana', name: 'La casa', tag: 'Paisaje', w: 1156, h: 671 },
  { img: 'iglesia', name: 'La iglesia', tag: 'Paisaje', w: 1600, h: 1056 },
];
const PAIRS = ['bg-ink text-papel', 'bg-oro text-ink', 'bg-bosque text-papel', 'bg-arena text-ink'];

/** Las fotos del lugar como estampas con su tira de etiqueta. Cada una abre una ventana con su historia. */
export default function Land() {
  const [open, setOpen] = useState<(typeof TILES)[number] | null>(null);
  const story = open ? STORIES[open.img] : null;
  return (
    <section aria-labelledby="tierra-title" className="bg-crema py-[clamp(72px,11vw,150px)]">
      <div className="wrap">
        <Reveal>
          <h2 id="tierra-title" className="t-h2">Nuestra tierra</h2>
          <p className="t-lead mt-4 max-w-[40ch]">Una historia que comienza en la tierra. Toca una foto para conocer su historia.</p>
        </Reveal>
        <ul className="mt-10 grid grid-cols-2 gap-x-2 gap-y-6 lg:grid-cols-4 lg:gap-x-3">
          {TILES.map((t, i) => (
            <Reveal as="li" key={t.img} delay={(i % 4) * 0.07}>
              <button type="button" onClick={() => setOpen(t)} aria-label={`Ver la historia: ${t.name}`} className="hover-zoom block w-full text-left">
                <figure>
                  <div className="aspect-[4/5] overflow-hidden bg-arena"><img src={`/photos/${t.img}.webp`} alt={t.name} width={t.w} height={t.h} loading="lazy" className="h-full w-full object-cover" /></div>
                  <figcaption className={`flex items-center justify-between gap-2 p-3 ${PAIRS[i % 4]}`}><span className="font-display font-semibold">{t.name}</span><span>{t.tag}</span></figcaption>
                </figure>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} label={story?.title ?? 'Historia'} className="max-w-3xl">
        {open && (
          <div>
            <img src={`/photos/${open.img}.webp`} alt={open.name} width={open.w} height={open.h} className="max-h-[60svh] w-full object-cover" />
            <div className="p-6 md:p-8">
              <h3 className="t-h3 text-[clamp(1.6rem,2.6vw,2.4rem)]">{story?.title ?? open.name}</h3>
              <div className="mt-4 grid gap-3 text-lg">{(story?.text ?? '').split('\n').map((l, k) => <p key={k}>{l}</p>)}</div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
