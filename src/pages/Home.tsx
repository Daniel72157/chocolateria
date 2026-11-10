import Seo from '../components/ui/Seo';
import Hero from './home/Hero';
import About from './home/About';
import Showcase from './home/Showcase';
import MenuSheet from './home/MenuSheet';
import Process from './home/Process';
import Land from './home/Land';
import PostTiles from './home/PostTiles';
import Contact from './home/Contact';
import Stub from './home/Stub';
import { useSettings } from '../hooks/useProducts';

export default function Home() {
  const { data: s } = useSettings();
  return (
    <>
      <Seo
        title={`${s?.store_name ?? 'Chocolate Zurych'} · Redescubre el chocolate`}
        description="Empresa colombiana, familiar y artesanal que transforma el cacao de agricultores de Santander en chocolate de calidad, origen y autenticidad. Tienda en el barrio Quirinal, Bogotá."
        path="/"
        jsonLd={s && {
          '@context': 'https://schema.org', '@type': 'Store', name: s.store_name, address: s.address ?? undefined,
          telephone: `+${s.whatsapp_number}`, email: s.email ?? undefined, image: '/og-image.jpg',
        }}
      />
      <Hero />
      <About />
      <Showcase />
      <MenuSheet />
      <Process />
      <Land />
      <PostTiles />
      <Contact />
      <Stub />
    </>
  );
}
