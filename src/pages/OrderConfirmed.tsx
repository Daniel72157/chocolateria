import { Link, useParams } from 'react-router-dom';
import Seo from '../components/ui/Seo';

export default function OrderConfirmed() {
  const { code = '' } = useParams();
  const url = sessionStorage.getItem(`wa:${code}`);
  return (
    <section className="wrap py-14 md:py-24">
      <Seo title="Pedido recibido" noindex />
      <div className="paper scallop-b mx-auto max-w-xl p-8 text-center sm:p-12">
        <h1 className="t-h2 text-[clamp(2rem,4vw,3rem)]">¡Recibimos tu pedido!</h1>
        <p className="num mt-6 inline-block bg-ink px-6 py-3 font-display text-3xl text-papel">{code}</p>
        <p className="mt-6">Se abrió WhatsApp con tu mensaje listo. <strong>Pulsa «Enviar»</strong> para que la tienda lo reciba y confirme disponibilidad y pago por chat.</p>
        <div className="mt-8 grid gap-3">
          {url && <a href={url} className="btn btn-wa">Abrir WhatsApp de nuevo</a>}
          <Link to="/tienda" className="btn btn-primary">Seguir comprando</Link>
        </div>
      </div>
    </section>
  );
}
