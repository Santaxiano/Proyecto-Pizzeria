import { Outlet } from 'react-router';
import Navbar from './Navbar'; 
import Footer from './Footer'; 
import { useCarrito } from '../../features/carrito/hooks/useCarrito';

function LayoutPublico() {
  // 1. Iniciamos el carrito global
  const carrito = useCarrito();

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar cantidadCarrito={carrito.cantidadTotal} />
      
      <main className="flex-grow-1">
        <Outlet context={carrito} />
      </main>
      
      <Footer />
    </div>
  );
}

export default LayoutPublico;