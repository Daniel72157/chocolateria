import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Factory, Store } from 'lucide-react';
import { useSettings } from '../../hooks/useProducts';
import { waUrl } from '../../lib/format';
import type { StoreSettings } from '../../../shared/types';

export type WaOption = { label: string; Icon: typeof Store; href: string };

/** Las dos opciones de contacto (planta y tienda). `plant` y `store` son los mensajes que abre cada una. */
export function waOptions(s: StoreSettings, msg: { plant: string; store: string }): WaOption[] {
  return [
    s.plant_whatsapp_number && { label: 'Asesoría en la planta', Icon: Factory, href: waUrl(s.plant_whatsapp_number, msg.plant) },
    { label: 'Tienda física', Icon: Store, href: waUrl(s.whatsapp_number, msg.store) },
  ].filter(Boolean) as WaOption[];
}

/** Cierra con clic afuera o con Escape. */
export function useDismiss(open: boolean, close: () => void, ref: RefObject<HTMLElement>) {
  useEffect(() => {
    if (!open) return;
    const off = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && close();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', off); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, [open, close, ref]);
}

/** Tarjeta "¿Con quién quieres hablar?" con los dos botones. Es la misma del botón flotante de WhatsApp. */
export function WaOptionsList({ id, options, onPick }: { id?: string; options: WaOption[]; onPick: () => void }) {
  return (
    <ul id={id} aria-label="¿Con quién quieres hablar?" className="grid w-64 max-w-full gap-2 bg-papel p-3 text-ink shadow-xl">
      <li className="px-2 pb-1 text-sm font-semibold text-tierra">¿Con quién quieres hablar?</li>
      {options.map(({ label, Icon, href }) => (
        <li key={label}>
          <a href={href} target="_blank" rel="noopener noreferrer" onClick={onPick} className="flex items-center gap-3 rounded-full bg-crema px-4 py-3 font-semibold transition hover:bg-oro">
            <Icon size={20} aria-hidden /> {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Botón que, en vez de abrir un solo WhatsApp, deja elegir entre la planta y la tienda física.
 *  `open` y `onOpenChange` son opcionales: sirven para abrirlo desde afuera (por ejemplo, al enviar un formulario). */
export default function WhatsAppChoice({ children, className, message, align = 'left', block = false, open: openProp, onOpenChange }: {
  children: ReactNode; className: string; message: string; align?: 'left' | 'right'; block?: boolean; open?: boolean; onOpenChange?: (v: boolean) => void;
}) {
  const { data: s } = useSettings();
  const [inner, setInner] = useState(false);
  const open = openProp ?? inner;
  const set = (v: boolean) => { setInner(v); onOpenChange?.(v); };
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useDismiss(open, () => set(false), ref);

  if (!s) return null;
  const options = waOptions(s, { plant: message, store: message });
  return (
    <div ref={ref} className={`relative ${block ? 'block' : 'inline-block'}`}>
      {open && (
        <div className={`absolute bottom-full z-30 mb-2 ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <WaOptionsList id={id} options={options} onPick={() => set(false)} />
        </div>
      )}
      <button type="button" onClick={() => set(!open)} aria-expanded={open} aria-controls={open ? id : undefined} className={className}>{children}</button>
    </div>
  );
}
