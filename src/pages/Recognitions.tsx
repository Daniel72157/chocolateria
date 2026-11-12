import { Award as AwardIcon } from 'lucide-react';
import Seo from '../components/ui/Seo';
import Reveal from '../components/ui/Reveal';
import { AWARDS } from '../data/content';

const PLACEHOLDERS = 3;

export default function Recognitions() {
  return (
    <>
      <Seo title="Sellos y reconocimientos" description="Sellos, reconocimientos y premios que ha recibido Chocolate Zurych." path="/reconocimientos" />
      <Reveal as="section" className="wrap pb-8 pt-14 md:pt-20">
        <h1 className="t-display text-[clamp(2.4rem,6vw,5.5rem)]">Sellos y reconocimientos</h1>
        <p className="t-lead mt-5 max-w-[40ch]">Los premios y certificados que respaldan nuestro trabajo con el cacao de Santander.</p>
      </Reveal>
      <section aria-label="Reconocimientos" className="wrap pb-24">
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {AWARDS.map((a, i) => (
            <Reveal as="li" key={a.title} delay={(i % 3) * 0.07}>
              <figure className="paper h-full">
                {a.image && <img src={a.image} alt={a.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />}
                <figcaption className="p-5">
                  <p className="font-display text-xl font-semibold">{a.title}</p>
                  <p className="num mt-1 text-tierra">{a.issuer} · {a.year}</p>
                  {a.description && <p className="mt-3">{a.description}</p>}
                </figcaption>
              </figure>
            </Reveal>
          ))}
          {AWARDS.length === 0 && Array.from({ length: PLACEHOLDERS }, (_, i) => (
            <li key={i} className="flex aspect-[4/3] flex-col items-center justify-center gap-3 border-2 border-dashed border-tierra/40 bg-crema p-6 text-center text-tierra">
              <AwardIcon size={36} aria-hidden />
              <p className="font-display text-lg">Próximamente</p>
              <p className="t-small">Aquí irá la imagen del sello, certificado o premio.</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
