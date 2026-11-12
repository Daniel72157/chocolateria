import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { useSettings } from '../../hooks/useProducts';
import { phonePretty } from '../../lib/format';

export default function Footer() {
  const { data: s } = useSettings();
  const phone = s ? phonePretty(s.whatsapp_number) : '';
  const year = new Date().getFullYear();
  return (
    <footer className="bg-oro text-ink">
      <div className="wrap flex min-h-[min(88svh,780px)] flex-col pb-24 pt-10 md:pb-8">
        <div className="grid gap-6 text-base md:grid-cols-[1fr_1fr_1fr_auto] md:gap-10">
          <div>
            <img src="/brand/logo-sm.webp" alt={s?.store_name ?? 'Chocolate Zurych'} width={420} height={260} className="h-[72px] w-auto" />
            <p className="mt-1 max-w-[30ch]">Chocolate artesanal colombiano. Redescubre el chocolate.</p>
          </div>
          <div>
            <p className="font-bold">Dónde estamos</p>
            <p>{s?.address}</p>
            {s?.instagram_url && <p><a className="underline" href={s.instagram_url} rel="noopener noreferrer" target="_blank">Instagram</a></p>}
            {s?.facebook_url && <p><a className="underline" href={s.facebook_url} rel="noopener noreferrer" target="_blank">Facebook</a></p>}
          </div>
          <div>
            <p className="font-bold">Contacto</p>
            {s?.email && <p><a className="underline" href={`mailto:${s.email}`}>{s.email}</a></p>}
            {s?.opening_hours.map((h) => <p key={h.day} className="num">{h.day}: {h.hours}</p>)}
          </div>
          <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-start gap-2 font-semibold underline md:justify-self-end">
            Volver arriba <ArrowUp size={18} aria-hidden />
          </a>
        </div>

        <div className="mt-auto pt-20">
          <p className="text-base mb-3 font-semibold">Pide por WhatsApp o llámanos</p>
          {s && (
            <a href={`tel:+${s.whatsapp_number}`} className="num block whitespace-nowrap font-rust font-normal leading-[0.95] tracking-normal hover:underline" style={{ fontSize: 'clamp(1.9rem, 7.6vw, 8.5rem)' }}>
              {phone}
            </a>
          )}
        </div>

        <div className="mt-10 grid gap-3 text-base md:grid-cols-3">
          <p className="flex flex-wrap gap-x-5 gap-y-1 font-semibold">
            <Link to="/tienda" className="hover:underline">Tienda virtual</Link>
            <Link to="/donde-encontrarnos" className="hover:underline">Dónde encontrarnos</Link>
            <Link to="/blog" className="hover:underline">Blog</Link>
            <Link to="/reconocimientos" className="hover:underline">Reconocimientos</Link>
            <Link to="/contacto" className="hover:underline">Contacto</Link>
            <Link to="/pqr" className="hover:underline">PQR</Link>
            <Link to="/privacidad" className="hover:underline">Privacidad</Link>
          </p>
          <p className="md:text-center">Cada pedido se coordina por WhatsApp.</p>
          <p className="md:text-right">© {year} {s?.store_name}</p>
        </div>
      </div>
    </footer>
  );
}
