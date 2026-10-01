import { createBrowserRouter } from 'react-router';
import LayoutPublico from './shared/layout/LayoutPublico';
import LayoutGestor from './shared/layout/Layoutgestor';
import NoEncontradaPage from './shared/pages/NoEncontradaPage';

import HomePage from './features/home/pages/HomePage';
import { MenuPage, DetalleProductoPage } from './features/carta';
import CarritoPage from './features/carrito/pages/CarritoPage';
import ReservaPage from './features/reservas/pages/ReservaPage';
import ContactoPage from './features/contacto/pages/ContactoPage';
import LoginPage from './features/iniciogestor/pages/login';
import { protegerRuta, redirigirSiHaySesion } from './features/iniciogestor/service/inicioservice';
import { StockPage } from './features/ingredientes';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LayoutPublico />,
    errorElement: <NoEncontradaPage />,
    children: [
      { index: true, element: <HomePage /> },           
      {path: '/menu',element: <MenuPage />},
      { path: '/menu/:id', element: <DetalleProductoPage />},           
      { path: 'carrito', element: <CarritoPage /> },     
      { path: 'reserva', element: <ReservaPage /> }, 
      { path: 'contacto', element: <ContactoPage /> } ,   
      { path: '*', element: <NoEncontradaPage /> }     
    ]
  },

  {
    path: '/login',
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
        path: 'comandas',
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
      }
    ]
  }
]);