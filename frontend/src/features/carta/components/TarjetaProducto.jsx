import { Link } from 'react-router';

function TarjetaProducto({ producto }) {
  // "disponible" lo calcula el backend: hay stock Y ningún ingrediente desactivado (efecto dominó).
  // Si no viniera, se usa el stock como antes.
  const sinStock = !(producto.disponible ?? producto.stock > 0);

  return (
    <article className="card h-100 shadow-sm tarjeta-pizza">
      <Link to={`/menu/${producto.id}`}>
        <img 
          src={producto.imagen} 
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
        
        <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
          <span className="precio-pizza mb-0">${producto.precio.toLocaleString('es-AR')}</span>
          
          {sinStock ? (
            <span className="badge text-bg-secondary">Sin Stock</span>
          ) : (
            <Link to={`/menu/${producto.id}`} className="btn btn-sm btn-pizza">
              {producto.categoria === 'pizzas' ? 'Elegir Sabores' : 'Ver Detalle'}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default TarjetaProducto;