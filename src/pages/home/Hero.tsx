import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useProducts';
import { waUrl } from '../../lib/format';

/** Portada: una foto grande de la montaña y el nombre de la tienda. */
export default function Hero() {
  const { data: s } = useSettings();
  return (
    <section aria-labelledby="hero-title" className="on-dark relative isolate flex min-h-[calc(100svh-72px)] items-end overflow-hidden bg-ink">
      <img src="/photos/montana.webp" alt="Montaña verde al atardecer, de donde viene nuestro cacao" width={1600} height={844} fetchPriority="high"
        className="drift-slow absolute inset-0 -z-20 h-full w-full object-cover object-[50%_35%]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-ink/40" />
      <div className="wrap pb-12 pt-32 md:pb-16">
        <h1 id="hero-title" className="font-rust text-[clamp(3.2rem,11.5vw,10.5rem)] font-normal leading-[0.88] tracking-normal text-papel">Chocolate Zurych</h1>
        <p className="mt-4 font-script text-[clamp(1.9rem,4.4vw,3.5rem)] leading-none text-arena">Redescubre el chocolate</p>
        <p className="t-lead mt-6 max-w-[38ch] text-papel">Empresa colombiana, familiar y artesanal. Transformamos el cacao de agricultores de Santander en chocolate de calidad, origen y autenticidad.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/tienda" className="btn btn-gold">Tienda virtual</Link>
          {s && <a href={waUrl(s.whatsapp_number, 'Hola, quiero hacer un pedido.')} target="_blank" rel="noopener noreferrer" className="btn btn-light">Pedir por WhatsApp</a>}
        </div>
      </div>
    </section>
  );
}
