import { createBrowserRouter } from 'react-router';
import LayoutPublico from './shared/layout/LayoutPublico';
import LayoutGestor from './shared/layout/Layoutgestor';
import NoEncontradaPage from './shared/pages/NoEncontradaPage';

// --- Páginas Públicas ---
import HomePage from './features/home/pages/HomePage';
import { MenuPage, DetalleProductoPage } from './features/carta';
import CarritoPage from './features/carrito/pages/CarritoPage';
import PagoResultadoPage from './features/carrito/pages/PagoResultadoPage';
import ReservaPage from './features/reservas/pages/ReservaPage';
import ContactoPage from './features/contacto/pages/ContactoPage';

// --- Autenticación ---
import LoginPage from './features/login/pages/LoginPage';
import { protegerRuta, protegerRutaAdmin, redirigirSiHaySesion } from './features/login/service/inicioservice';

// --- Páginas del Gestor ---
import InicioGestorPage from './features/home/pages/InicioGestorPage'; 
import { StockPage } from './features/stock';
import SalonPage from './features/salon/pages/SalonPage';
import ComandasPage from './features/comandas/pages/ComandasPage';
import EmpleadoPage from './features/empleados/pages/EmpleadoPage';
import UsuariosPage from './features/usuarios/pages/UsuariosPage';

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
      { path: 'pago-exitoso', element: <PagoResultadoPage resultado="exitoso" /> },
      { path: 'pago-exitoso/:pedidoId', element: <PagoResultadoPage resultado="exitoso" /> },
      { path: 'pago-fallido', element: <PagoResultadoPage resultado="fallido" /> },
      { path: 'pago-fallido/:pedidoId', element: <PagoResultadoPage resultado="fallido" /> },
      { path: 'pago-pendiente', element: <PagoResultadoPage resultado="pendiente" /> },
      { path: 'pago-pendiente/:pedidoId', element: <PagoResultadoPage resultado="pendiente" /> },
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
      { index: true, element: <InicioGestorPage /> },
      { path: 'salon', element: <SalonPage /> },
      { path: 'comandas', element: <ComandasPage /> },
      { path: 'stock', element: <StockPage /> },
      // Solo administradores (el backend también lo exige)
      { path: 'empleados', element: <EmpleadoPage />, loader: protegerRutaAdmin },
      { path: 'usuarios', element: <UsuariosPage />, loader: protegerRutaAdmin }
    ]
  }
]);