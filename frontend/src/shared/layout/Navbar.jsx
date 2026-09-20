import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router';

function Navbar({ cantidadCarrito = 0 }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [desplazado, setDesplazado] = useState(false);

  useEffect(() => {
    const controlarScroll = () => {
      setDesplazado(window.scrollY > 50);
    };
    window.addEventListener('scroll', controlarScroll);
    return () => window.removeEventListener('scroll', controlarScroll);
  }, []);

  const toggleMenu = () => setMenuAbierto(!menuAbierto);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className={`encabezado ${desplazado ? 'desplazado' : ''}`}>
      <nav className="barra-navegacion">
        <Link to="/" className="logo-navegacion" onClick={cerrarMenu}>
          <img src="/logo en blanco.png" alt="+PIZZA" />
        </Link>

        <button 
          className="boton-hamburguesa" 
          aria-label="Abrir menú" 
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`contenedor-menu-navegacion ${menuAbierto ? 'activo' : ''}`}>
          <button 
            className="boton-cerrar-menu" 
            aria-label="Cerrar menú" 
            onClick={cerrarMenu}
          >
            &times;
          </button>

          <ul className="enlaces-navegacion">
            <li>
              <NavLink to="/" end onClick={cerrarMenu}>
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink to="/menu" onClick={cerrarMenu}>
                Menú Online
              </NavLink>
            </li>
            <li>
              <NavLink to="/reservar" onClick={cerrarMenu}>
                Reservar Mesa
              </NavLink>
            </li>
            <li>
              <NavLink to="/carrito" onClick={cerrarMenu} className="enlace-carrito">
                Carrito {cantidadCarrito > 0 && <span className="badge-carrito">({cantidadCarrito})</span>}
              </NavLink>
            </li>
          </ul>
        </div>

        <div 
          className={`capa-fondo-menu ${menuAbierto ? 'activo' : ''}`} 
          onClick={cerrarMenu}
        ></div>
      </nav>
    </header>
  );
}

export default Navbar;