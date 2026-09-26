import { createBrowserRouter } from 'react-router';
import LayoutPublico from './shared/layout/LayoutPublico';
import NoEncontradaPage from './shared/pages/NoEncontradaPage';

import HomePage from './features/home/pages/HomePage';
import MenuPage from './features/pedidos/pages/MenuPage';
import CarritoPage from './features/pedidos/pages/CarritoPage';
import ReservaPage from './features/reservas/pages/ReservaPage';
import SalonPage from './features/salon/pages/salon';
import ComandasPage from './features/comandas/pages/ComandasPage';

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
      { path: 'salon', element: <SalonPage /> },
      { path: '*', element: <NoEncontradaPage /> }      
    ]
  },

  {
    path: '/login',
    element: (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h2>Acceso de Personal (+PIZZA)</h2>
        <p>Formulario de autenticación con JWT (A cargo de Integrante 3)</p>
      </div>
    ),
    errorElement: <NoEncontradaPage />
  },

  {
    path: '/gestor',
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
        element: <ComandasPage />
      }
    ]
  }
]);