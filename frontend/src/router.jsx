import { createBrowserRouter } from 'react-router';
import LayoutPublico from './shared/layout/LayoutPublico';
import LayoutGestor from './shared/layout/Layoutgestor';
import NoEncontradaPage from './shared/pages/NoEncontradaPage';

import HomePage from './features/home/pages/HomePage';
import { MenuPage, DetalleProductoPage } from './features/carta';
import CarritoPage from './features/carrito/pages/CarritoPage';
import ReservaPage from './features/reservas/pages/ReservaPage';
<<<<<<< HEAD
import ContactoPage from './features/contacto/pages/ContactoPage';
import LoginPage from './features/iniciogestor/pages/login';
import { protegerRuta, redirigirSiHaySesion } from './features/iniciogestor/service/inicioservice';
import { StockPage } from './features/ingredientes';
=======
import LoginPage from './features/iniciogestor/pages/login';
import { protegerRuta, redirigirSiHaySesion } from './features/iniciogestor/service/inicioservice';
import SalonPage from './features/salon/pages/SalonPage';
import ComandasPage from './features/comandas/pages/ComandasPage';
import ComandaDetallePage from './features/comandas/pages/ComandaDetallePage';
>>>>>>> origin/Integrante-2

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutPublico />,
    errorElement: <NoEncontradaPage />,
    children: [
<<<<<<< HEAD
      { index: true, element: <HomePage /> },           
      {path: '/menu',element: <MenuPage />},
      { path: '/menu/:id', element: <DetalleProductoPage />},           
      { path: 'carrito', element: <CarritoPage /> },     
      { path: 'reserva', element: <ReservaPage /> }, 
      { path: 'contacto', element: <ContactoPage /> } ,   
      { path: '*', element: <NoEncontradaPage /> }     
=======
      { index: true, element: <HomePage /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'carrito', element: <CarritoPage /> },
      { path: 'reservar', element: <ReservaPage /> },
      { path: '*', element: <NoEncontradaPage /> }
>>>>>>> origin/Integrante-2
    ]
  },

  {
    path: '/login',
<<<<<<< HEAD
    path: '/login',
=======
>>>>>>> origin/Integrante-2

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
<<<<<<< HEAD
        element: (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Gestión de Salón y Comandas</h2>
            <p>Control de mesas y pedidos en preparación (Integrante 2)</p>
          </div>
        )
      },
      {
        path: 'stock',
        element: <StockPage />
=======
        element: <ComandasPage />
      },
      {
        path: 'comandas/:comandaId',
        element: <ComandaDetallePage />
>>>>>>> origin/Integrante-2
      }
    ]
  }
]);