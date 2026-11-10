import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../hooks/useProducts';
import { waUrl } from '../../lib/format';

export default function WhatsAppFab() {
  const { data: s } = useSettings();
  if (!s) return null;
  return (
    <a href={waUrl(s.whatsapp_number, 'Hola, quiero hacer un pedido.')} target="_blank" rel="noopener noreferrer" aria-label="Escríbenos por WhatsApp" className="btn-wa fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full transition hover:scale-105 active:scale-95">
      <MessageCircle size={28} aria-hidden />
    </a>
  );
}
