import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

/** Diálogo accesible: trampa de foco, Escape, devuelve el foco y bloquea el scroll. */
export default function Modal({ open, onClose, label, children, side, className = '' }: {
  open: boolean; onClose: () => void; label: string; children: ReactNode; side?: 'right' | 'full'; className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const root = ref.current!;
    (root.querySelector<HTMLElement>('[data-autofocus]') ?? root.querySelector<HTMLElement>(FOCUSABLE))?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab') return;
      const f = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; prev?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  const pos = side === 'right' ? 'ml-auto h-full w-full max-w-md' : side === 'full' ? 'h-full w-full' : 'm-auto w-full max-w-lg';
  return (
    <div className="fixed inset-0 z-[60] flex bg-ink/80" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={label} className={`${pos} relative overflow-y-auto bg-papel ${className}`}>
        {side !== 'full' && (
          <button type="button" onClick={onClose} aria-label="Cerrar" className="btn-round absolute right-4 top-4 z-10 bg-bosque">
            <X size={20} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
