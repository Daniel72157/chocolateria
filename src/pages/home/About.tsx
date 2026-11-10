import { useAbout } from '../../hooks/useProducts';
import Reveal from '../../components/ui/Reveal';
import Skeleton from '../../components/ui/Skeleton';

/** Información general: quiénes somos, con las fotos del lugar. Los bloques se editan en Ajustes. */
export default function About() {
  const { data } = useAbout();
  return (
    <section id="quienes-somos" aria-labelledby="quienes-title" className="bg-crema py-[clamp(72px,11vw,150px)]">
      <div className="wrap">
        <Reveal><h2 id="quienes-title" className="t-h2">Quiénes somos</h2></Reveal>
        <div className="mt-12 grid gap-16 md:gap-24">
          {!data && <Skeleton className="h-80" />}
          {data?.map((b, i) => (
            <div key={b.id} className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
              <Reveal className={i % 2 ? 'md:order-2' : ''}>
                {b.image_url && <img src={b.image_url} alt={b.title} width={1066} height={1600} loading="lazy" className={`w-full object-cover ${i % 2 ? 'aspect-[4/3]' : 'aspect-[4/5] md:max-h-[640px]'}`} />}
              </Reveal>
              <Reveal delay={0.1} className={i % 2 ? 'md:order-1' : ''}>
                <h3 className="t-h3 text-[clamp(1.6rem,2.6vw,2.4rem)]">{b.title}</h3>
                <div className="mt-5 grid max-w-[52ch] gap-4 text-lg">{b.body.split('\n').map((l, k) => <p key={k}>{l}</p>)}</div>
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
