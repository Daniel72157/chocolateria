import { Link } from 'react-router-dom';
import Seo from '../components/ui/Seo';

export default function NotFound() {
  return (
    <section className="wrap py-24 md:py-36">
      <Seo title="Página no encontrada" noindex />
      <h1 className="t-display text-[clamp(2.4rem,6vw,5.5rem)]">Esta página no está en la carta</h1>
      <p className="t-lead mt-5 max-w-[34ch]">Puede que el enlace haya cambiado. Vuelve al inicio o mira los catálogos.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/" className="btn btn-primary">Ir al inicio</Link>
        <Link to="/tienda" className="btn btn-soft">Ver catálogos</Link>
      </div>
    </section>
  );
}
