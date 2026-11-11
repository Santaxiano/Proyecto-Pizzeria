import { formatearPrecio } from '../../../shared/utils/formato'

function ItemCarrito({ item, onCambiarCantidad, onQuitar }) {
  const toppings = Array.isArray(item.toppings)
    ? item.toppings
        .map((topping) => (typeof topping === 'string' ? topping : topping?.nombre))
        .filter(Boolean)
    : []

  return (
    <li className="list-group-item py-3">
      <div className="d-flex flex-wrap flex-sm-nowrap gap-3 align-items-center">
        {item.imagen && (
           <img src={item.imagen} alt="" className="imagen-carrito rounded shadow-sm" style={{ width: '70px', height: '70px', objectFit: 'cover' }} />
        )}
        <div className="flex-grow-1">
          <h3 className="h6 mb-1 fw-bold">{item.nombre}</h3>
          
          <p className="small text-body-secondary mb-2">
            {item.tamanoElegido && <span className="me-1">{item.tamanoElegido} ·</span>}
            {item.esMitadYMitad && <span className="me-1">Mitad: {item.segundoSabor} ·</span>}
            {toppings.length > 0 && (
              <span className="d-block text-danger fw-semibold">
                Toppings: {toppings.join(', ')}
              </span>
            )}
            {formatearPrecio(item.precio)} c/u
          </p>

          <div className="input-group input-group-sm w-auto" style={{ maxWidth: '120px' }}>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => onCambiarCantidad(item.idVariante, item.cantidad - 1)}
            >
              −
            </button>
            <span className="input-group-text bg-white px-3 fw-bold">{item.cantidad}</span>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => onCambiarCantidad(item.idVariante, item.cantidad + 1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="text-sm-end ms-auto">
          <p className="fw-bold mb-1 text-dark fs-5">{formatearPrecio(item.precio * item.cantidad)}</p>
          <button type="button" className="btn btn-sm btn-link text-danger p-0 fw-semibold" onClick={() => onQuitar(item.idVariante)}>
            Quitar
          </button>
        </div>
      </div>
    </li>
  )
}

export default ItemCarrito