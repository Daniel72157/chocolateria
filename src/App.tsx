import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Home from './pages/Home';
import CatalogIndex from './pages/CatalogIndex';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Where from './pages/Where';
import Community from './pages/Community';
import PostDetail from './pages/PostDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmed from './pages/OrderConfirmed';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Products = lazy(() => import('./pages/admin/Products'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Posts = lazy(() => import('./pages/admin/Posts'));
const PostForm = lazy(() => import('./pages/admin/PostForm'));
const Comments = lazy(() => import('./pages/admin/Comments'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const Settings = lazy(() => import('./pages/admin/Settings'));

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } } });

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="tienda" element={<CatalogIndex />} />
              <Route path="tienda/:catalogSlug" element={<Catalog />} />
              <Route path="producto/:slug" element={<ProductDetail />} />
              <Route path="donde-encontrarnos" element={<Where />} />
              <Route path="blog" element={<Community />} />
              <Route path="blog/:id" element={<PostDetail />} />
              <Route path="carrito" element={<Cart />} />
              <Route path="pedido" element={<Checkout />} />
              <Route path="pedido/confirmado/:code" element={<OrderConfirmed />} />
              <Route path="privacidad" element={<Privacy />} />
              <Route path="nosotros" element={<Navigate to="/#quienes-somos" replace />} />
              <Route path="catalogo" element={<Navigate to="/tienda" replace />} />
              <Route path="comunidad" element={<Navigate to="/blog" replace />} />
            </Route>
            <Route path="admin/login" element={<Login />} />
            <Route path="admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="productos" element={<Products />} />
              <Route path="productos/nuevo" element={<ProductForm />} />
              <Route path="productos/:id" element={<ProductForm />} />
              <Route path="categorias" element={<Categories />} />
              <Route path="publicaciones" element={<Posts />} />
              <Route path="publicaciones/nueva" element={<PostForm />} />
              <Route path="publicaciones/:id" element={<PostForm />} />
              <Route path="comentarios" element={<Comments />} />
              <Route path="pedidos" element={<Orders />} />
              <Route path="pedidos/:id" element={<OrderDetail />} />
              <Route path="ajustes" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
