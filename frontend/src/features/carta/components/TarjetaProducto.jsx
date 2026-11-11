import { Link } from 'react-router';

const obtenerPrecioMinimo = (variantes) => {
  if (!Array.isArray(variantes) || variantes.length === 0) return null;

  const precios = variantes
    .map((variante) => Number(variante.precio))
    .filter((precio) => Number.isFinite(precio) && precio >= 0);

  return precios.length > 0 ? Math.min(...precios) : null;
};

function TarjetaProducto({ producto }) {
  // "disponible" lo calcula el backend: hay stock Y ningún ingrediente desactivado (efecto dominó).
  // Si no viniera, se usa el stock como antes.
  const sinStock = !(producto.disponible ?? producto.stock > 0);

  // Como cada variante tiene su precio, mostramos el más bajo como referencia.
  const precioMinimo = obtenerPrecioMinimo(producto.variantes);
  const tieneToppings = producto.categoria === 'comidas'
    && Array.isArray(producto.toppings)
    && producto.toppings.length > 0;

  // Fallback seguro de la imagen por si no tiene, viene null o vacío
  const imagenSegura = (producto.imagen && producto.imagen.trim() !== '')
    ? producto.imagen
    : '/noimagen.jpg';

  return (
    <article className="card h-100 shadow-sm tarjeta-pizza">
      <Link to={`/menu/${producto.id}`}>
        <img
          src={imagenSegura}
          className="card-img-top"
          alt={producto.nombre}
          style={{ height: '220px', objectFit: 'cover' }}
        />
      </Link>
      <div className="card-body d-flex flex-column">
        <span className="badge text-bg-light border text-uppercase mb-2 align-self-start">
          {producto.categoria}
        </span>
        <h3 className="h5 card-title mb-1">
          <Link to={`/menu/${producto.id}`} className="text-dark text-decoration-none">
            {producto.nombre}
          </Link>
        </h3>
        <p className="small text-secondary flex-grow-1">{producto.descripcion}</p>
        {tieneToppings && (
          <p className="small text-danger fw-semibold mb-0">
            Personalizá con toppings opcionales
          </p>
        )}

        <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
          <span className="precio-pizza mb-0">
            {precioMinimo !== null
              ? `Desde $${precioMinimo.toLocaleString('es-AR')}`
              : 'Sin precio'}
          </span>

          {sinStock ? (
            <span className="badge text-bg-secondary">Sin Stock</span>
          ) : (
            <Link to={`/menu/${producto.id}`} className="btn btn-sm btn-pizza">
              {producto.categoria === 'pizzas'
                ? 'Elegir Sabores'
                : tieneToppings ? 'Elegir toppings' : 'Ver Detalle'}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default TarjetaProducto;
