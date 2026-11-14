import { Link } from 'react-router';
import { formatearPrecio } from '../../../shared/utils/formato';

// Barra fija para celulares y tablets. En escritorio el carrito se ve en el
// resumen lateral, por eso el contenedor lleva d-lg-none.
function BotonFlotanteCarrito({ cantidadTotal = 0, subtotal = 0 }) {
  if (cantidadTotal <= 0) return null;

  const etiqueta = `Ver carrito: ${cantidadTotal} ${cantidadTotal === 1 ? 'producto' : 'productos'}, subtotal ${formatearPrecio(subtotal)}`;

  return (
    <div className="fixed-bottom d-lg-none p-3 contenedor-boton-flotante">
      <Link
        to="/carrito"
        className="btn w-100 fw-bold py-3 d-flex justify-content-between align-items-center shadow-lg boton-flotante-pedido"
        aria-label={etiqueta}
      >
        <span className="d-flex align-items-center gap-3">
          <span className="icono-carrito-flotante">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span key={cantidadTotal} className="badge rounded-pill bg-white text-danger badge-carrito-flotante">
              {cantidadTotal}
            </span>
          </span>

          <span className="d-flex flex-column align-items-start lh-1">
            <span className="small fw-semibold text-white-50">Ver mi pedido</span>
            <span className="fs-5 fw-bold">{formatearPrecio(subtotal)}</span>
          </span>
        </span>

        <span className="d-flex align-items-center gap-2">
          <span className="small text-white-50 d-none d-sm-inline">Ir al carrito</span>
          <span className="fs-4" aria-hidden="true">→</span>
        </span>
      </Link>
    </div>
  );
}

export default BotonFlotanteCarrito;
