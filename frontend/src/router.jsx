import { createBrowserRouter } from 'react-router';
import LayoutPublico from './shared/layout/LayoutPublico';
import LayoutGestor from './shared/layout/Layoutgestor';
import NoEncontradaPage from './shared/pages/NoEncontradaPage';

// --- Páginas Públicas ---
import HomePage from './features/home/pages/HomePage';
import { MenuPage, DetalleProductoPage } from './features/carta';
import CarritoPage from './features/carrito/pages/CarritoPage';
import ReservaPage from './features/reservas/pages/ReservaPage';
import ContactoPage from './features/contacto/pages/ContactoPage';

// --- Autenticación ---
import LoginPage from './features/iniciogestor/pages/login';
import { protegerRuta, redirigirSiHaySesion } from './features/iniciogestor/service/inicioservice';

// --- Páginas del Gestor ---
import { StockPage } from './features/ingredientes';
import SalonPage from './features/salon/pages/SalonPage';
import ComandasPage from './features/comandas/pages/ComandasPage';
import ComandaDetallePage from './features/comandas/pages/ComandaDetallePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutPublico />,
    errorElement: <NoEncontradaPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'menu/:id', element: <DetalleProductoPage /> },
      { path: 'carrito', element: <CarritoPage /> },
      { path: 'reserva', element: <ReservaPage /> },
      { path: 'contacto', element: <ContactoPage /> },
      { path: '*', element: <NoEncontradaPage /> }
    ]
  },
  {
    path: '/login',
    element: <LoginPage />,
    loader: redirigirSiHaySesion,
    errorElement: <NoEncontradaPage />
  },
  {
    path: '/gestor',
    element: <LayoutGestor />,
    loader: protegerRuta,
    errorElement: <NoEncontradaPage />,
    children: [
      {
        index: true,
        element: (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Panel de Inicio del Gestor</h2>
            <p>Resumen de ventas y accesos rápidos (Integrante 3)</p>
          </div>
        )
      },
      {
        path: 'salon',
        element: <SalonPage />
      },
      {
        path: 'comandas',
        element: <ComandasPage />
      },
      {
        path: 'comandas/:comandaId',
        element: <ComandaDetallePage />
      },
      {
        path: 'stock',
        element: <StockPage />
      }
    ]
  }
]);