import { useState } from 'react';
import { Award as AwardIcon, FileText } from 'lucide-react';
import Seo from '../components/ui/Seo';
import Reveal from '../components/ui/Reveal';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import { useAwards } from '../hooks/usePosts';
import type { Award } from '../../shared/types';

const PLACEHOLDERS = 3;

export default function Recognitions() {
  const { data: awards, isLoading } = useAwards();
  const [open, setOpen] = useState<Award | null>(null);
  return (
    <>
      <Seo title="Sellos y reconocimientos" description="Sellos, reconocimientos y premios que ha recibido Chocolate Zurych." path="/reconocimientos" />
      <Reveal as="section" className="wrap pb-8 pt-14 md:pt-20">
        <h1 className="t-display text-[clamp(2.4rem,6vw,5.5rem)]">Sellos y reconocimientos</h1>
        <p className="t-lead mt-5 max-w-[40ch] text-justify hyphens-auto">Los premios y certificados que respaldan nuestro trabajo con el cacao de Santander.</p>
      </Reveal>
      <section aria-label="Reconocimientos" className="wrap pb-24">
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && Array.from({ length: PLACEHOLDERS }, (_, i) => <li key={i}><Skeleton className="aspect-[4/3]" /></li>)}
          {awards?.map((a, i) => (
            <Reveal as="li" key={a.id} delay={(i % 3) * 0.07}>
              <figure className="paper flex h-full flex-col">
                <button type="button" onClick={() => setOpen(a)} aria-label={`Ver ${a.title} en grande`} className="hover-zoom block overflow-hidden bg-crema p-4">
                  <img src={a.image_url} alt={a.title} width={a.width ?? 1200} height={a.height ?? 900} loading="lazy" className="aspect-[4/3] w-full object-contain drop-shadow-md" />
                </button>
                <figcaption className="flex flex-1 flex-col p-5">
                  <p className="font-display text-xl font-semibold leading-tight">{a.title}</p>
                  {(a.issuer || a.year) && <p className="num mt-1 text-tierra">{[a.issuer, a.year].filter(Boolean).join(' · ')}</p>}
                  {a.description && <p className="mt-3 text-justify hyphens-auto">{a.description}</p>}
                  {a.file_url && <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-soft btn-sm mt-4 self-start"><FileText size={16} aria-hidden /> Ver documento</a>}
                </figcaption>
              </figure>
            </Reveal>
          ))}
          {!isLoading && !awards?.length && Array.from({ length: PLACEHOLDERS }, (_, i) => (
            <li key={i} className="flex aspect-[4/3] flex-col items-center justify-center gap-3 border-2 border-dashed border-tierra/40 bg-crema p-6 text-center text-tierra">
              <AwardIcon size={36} aria-hidden />
              <p className="font-display text-lg">Próximamente</p>
              <p className="t-small">Aquí irá la imagen del sello, certificado o premio.</p>
            </li>
          ))}
        </ul>
      </section>
      <Modal open={!!open} onClose={() => setOpen(null)} label={open?.title ?? 'Reconocimiento'} className="max-w-4xl">
        {open && (
          <div>
            <img src={open.image_url} alt={open.title} width={open.width ?? 1200} height={open.height ?? 900} className="max-h-[75svh] w-full bg-crema object-contain" />
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-display text-xl font-semibold">{open.title}</p>
                {(open.issuer || open.year) && <p className="num text-tierra">{[open.issuer, open.year].filter(Boolean).join(' · ')}</p>}
              </div>
              {open.file_url && <a href={open.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm"><FileText size={16} aria-hidden /> Abrir PDF</a>}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
