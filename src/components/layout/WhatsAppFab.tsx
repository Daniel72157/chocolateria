import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { useSettings } from '../../hooks/useProducts';
import { WaOptionsList, useDismiss, waOptions } from '../ui/WhatsAppChoice';

/** Botón flotante: al tocarlo muestra dos opciones (planta o tienda) y cada una abre el WhatsApp que le corresponde. */
export default function WhatsAppFab() {
  const { data: s } = useSettings();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useDismiss(open, () => setOpen(false), ref);

  if (!s) return null;
  const options = waOptions(s, { plant: 'Hola, quiero una asesoría con la planta de producción.', store: 'Hola, tengo una pregunta sobre la tienda.' });

  return (
    <div ref={ref} className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
      {open && <WaOptionsList id="wa-options" options={options} onPick={() => setOpen(false)} />}
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="wa-options" aria-label={open ? 'Cerrar opciones de WhatsApp' : 'Escríbenos por WhatsApp'}
        className="btn-wa flex h-14 w-14 items-center justify-center rounded-full transition hover:scale-105 active:scale-95">
        {open ? <X size={26} aria-hidden /> : <MessageCircle size={28} aria-hidden />}
      </button>
    </div>
  );
}
