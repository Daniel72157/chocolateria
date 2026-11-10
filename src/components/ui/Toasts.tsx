import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { useToasts } from '../../store/toast';

export default function Toasts() {
  const { toasts, dismiss } = useToasts();
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-8">
      {toasts.map((t) => (
        <div key={t.id} role="status" className={`pointer-events-auto flex max-w-md items-center gap-3 rounded-full py-2 pl-4 pr-2 font-semibold ${t.kind === 'error' ? 'bg-rojo text-papel' : 'bg-ink text-papel'}`}>
          {t.kind === 'ok' && <Check size={18} className="shrink-0 text-arena" aria-hidden />}
          <span>{t.text}</span>
          {t.action && <Link to={t.action.to} onClick={() => dismiss(t.id)} className="rounded-full bg-oro px-4 py-2 text-ink">{t.action.label}</Link>}
          <button type="button" onClick={() => dismiss(t.id)} aria-label="Cerrar aviso" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-bosque"><X size={16} /></button>
        </div>
      ))}
    </div>
  );
}
