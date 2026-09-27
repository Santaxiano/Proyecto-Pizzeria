import { NavLink, Link } from 'react-router';

function Navbar({ cantidadCarrito = 0 }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div className="container">
        {/* Marca / Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img src="/logo en blanco.png" alt="+PIZZA" height="35" />
        </Link>

        {/* Botón hamburguesa oficial de Bootstrap */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menuPrincipal"
          aria-controls="menuPrincipal"
          aria-expanded="false"
          aria-label="Desplegar navegación"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido colapsable */}
        <div className="collapse navbar-collapse" id="menuPrincipal">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Inicio
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/menu">
                Menú Online
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/reservar">
                Reservar Mesa
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/carrito">
                Carrito{' '}
                <span className="badge rounded-pill text-bg-danger ms-1">
                  {cantidadCarrito}
                </span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;