import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Factory, MessageCircle, Store, X } from 'lucide-react';
import { useSettings } from '../../hooks/useProducts';
import { waUrl } from '../../lib/format';

/** Botón flotante: al tocarlo muestra dos opciones (planta o tienda) y cada una abre el WhatsApp que le corresponde. */
export default function WhatsAppFab() {
  const { data: s } = useSettings();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, [open]);

  if (!s) return null;
  const options = [
    s.plant_whatsapp_number && { label: 'Asesoría en la planta', Icon: Factory, href: waUrl(s.plant_whatsapp_number, 'Hola, quiero una asesoría con la planta de producción.') },
    { label: 'Tienda física', Icon: Store, href: waUrl(s.whatsapp_number, 'Hola, tengo una pregunta sobre la tienda.') },
  ].filter(Boolean) as { label: string; Icon: typeof Store; href: string }[];

  return (
    <div ref={ref} className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      {open && (
        <ul id="wa-options" aria-label="¿Con quién quieres hablar?" className="grid w-64 gap-2 bg-papel p-3 text-ink shadow-xl">
          <li className="px-2 pb-1 text-sm font-semibold text-tierra">¿Con quién quieres hablar?</li>
          {options.map(({ label, Icon, href }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-full bg-crema px-4 py-3 font-semibold transition hover:bg-oro">
                <Icon size={20} aria-hidden /> {label}
              </a>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="wa-options" aria-label={open ? 'Cerrar opciones de WhatsApp' : 'Escríbenos por WhatsApp'}
        className="btn-wa flex h-14 w-14 items-center justify-center rounded-full transition hover:scale-105 active:scale-95">
        {open ? <X size={26} aria-hidden /> : <MessageCircle size={28} aria-hidden />}
      </button>
    </div>
  );
}
