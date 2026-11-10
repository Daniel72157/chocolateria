import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppFab from './WhatsAppFab';
import CartDrawer from '../cart/CartDrawer';
import Toasts from '../ui/Toasts';

export default function PublicLayout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return (
    <div id="top">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-oro focus:px-5 focus:py-3 focus:font-bold">Saltar al contenido</a>
      <Navbar />
      <main id="contenido"><Outlet /></main>
      <Footer />
      <WhatsAppFab />
      <CartDrawer />
      <Toasts />
    </div>
  );
}
