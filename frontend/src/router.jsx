import { createBrowserRouter } from 'react-router';
import LayoutPublico from './shared/layout/LayoutPublico';
import LayoutGestor from './shared/layout/Layoutgestor';
import NoEncontradaPage from './shared/pages/NoEncontradaPage';

import HomePage from './features/home/pages/HomePage';
import MenuPage from './features/pedidos/pages/MenuPage';
import CarritoPage from './features/pedidos/pages/CarritoPage';
import ReservaPage from './features/reservas/pages/ReservaPage';
import LoginPage from './features/iniciogestor/pages/login';
import { protegerRuta, redirigirSiHaySesion } from './features/iniciogestor/service/inicioservice';
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
      { path: 'carrito', element: <CarritoPage /> },
      { path: 'reservar', element: <ReservaPage /> },
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
        path: 'comandas/:mesaId',
        element: <ComandaDetallePage />
      }
    ]
  }
]);