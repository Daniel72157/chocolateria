import Seo from '../components/ui/Seo';
import { useSettings } from '../hooks/useProducts';

// Texto de muestra: debe ser revisado por un abogado antes del lanzamiento (Ley 1581 de 2012).
export default function Privacy() {
  const { data: s } = useSettings();
  return (
    <article className="wrap max-w-3xl py-14 md:py-20">
      <Seo title="Política de privacidad" path="/privacidad" />
      <h1 className="t-h2">Política de privacidad</h1>
      <p className="t-small mt-2 text-tierra">Tratamiento de datos personales conforme a la Ley 1581 de 2012.</p>
      <div className="mt-8 grid gap-5">
        <p>{s?.store_name} es responsable del tratamiento de los datos personales que nos entregas al hacer un pedido: nombre, celular, correo, documento, empresa y dirección de entrega.</p>
        <h2 className="t-h3 mt-4">Para qué los usamos</h2>
        <p>Usamos tus datos únicamente para confirmar y entregar tu pedido, contactarte por WhatsApp sobre su estado y, si lo pides, emitir factura. No vendemos ni compartimos tus datos con terceros con fines comerciales.</p>
        <h2 className="t-h3 mt-4">Tus derechos</h2>
        <p>Puedes conocer, actualizar, rectificar y pedir la supresión de tus datos, o revocar tu autorización, escribiéndonos por WhatsApp{s ? ` al +${s.whatsapp_number}` : ''}.</p>
        <h2 className="t-h3 mt-4">Comentarios en el blog</h2>
        <p>Cuando comentas guardamos tu nombre y una huella cifrada de tu conexión (no tu dirección IP) para prevenir el spam. Los comentarios se publican solo después de revisarlos.</p>
      </div>
    </article>
  );
}
