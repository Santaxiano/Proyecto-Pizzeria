import { useState, useEffect } from 'react';

function Navbar({ enlaces = [] }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [desplazado, setDesplazado] = useState(false);

  useEffect(() => {
    const controlarScroll = () => {
      if (window.scrollY > 50) {
        setDesplazado(true);
      } else {
        setDesplazado(false);
      }
    };

    window.addEventListener('scroll', controlarScroll);
    return () => window.removeEventListener('scroll', controlarScroll);
  }, []);

  const toggleMenu = () => setMenuAbierto(!menuAbierto);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className={`encabezado ${desplazado ? 'desplazado' : ''}`}>
      <nav className="barra-navegacion">
        <a href="#inicio" className="logo-navegacion" onClick={cerrarMenu}>
          <img src="/logo en blanco.png" alt="Logo +PIZZA" />
        </a>

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
            {enlaces.map((enlace) => (
              <li key={enlace.id}>
                <a href={enlace.destino} onClick={cerrarMenu}>
                  {enlace.texto}
                </a>
              </li>
            ))}
          </ul>

          <a href="#login" className="boton-ingreso" onClick={cerrarMenu}>
            Iniciar Sesión
          </a>
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