import { Link } from 'react-router';

function ResumenPedidoLateral({ items, onModificarCantidad, onEliminar, modoCheckout = false }) {
  const subtotal = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const tasaServicio = subtotal > 0 ? Math.round(subtotal * 0.02) : 0;
  const total = subtotal + tasaServicio;

  return (
    <div 
  className="card border shadow-sm p-4 bg-white sticky-top" style={{ top: '90px', zIndex: 4 }}>
      <h3 className="h5 fw-bold mb-3">Mi pedido</h3>

      {items.length === 0 ? (
        <div className="text-center py-4 text-secondary">
          <div className="fs-1 mb-2">🛍️</div>
          <p className="small mb-0">Pedido vacío</p>
        </div>
      ) : (
        <>
          <div className="d-flex flex-column gap-3 mb-3" style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {items.map((item) => (
              <div key={item.idVariante} className="d-flex justify-content-between align-items-center border-bottom pb-2">
                <div>
                  <h4 className="fw-semibold mb-0 fs-6">{item.nombre}</h4>
                  
                  {/* Detalles de la pizza */}
                  {item.tamanoElegido && (
                    <div className="small text-secondary" style={{ fontSize: '0.75rem' }}>
                      {item.tamanoElegido}
                    </div>
                  )}
                  {item.esMitadYMitad && (
                    <div className="small text-secondary" style={{ fontSize: '0.75rem' }}>
                      Mitad: {item.segundoSabor}
                    </div>
                  )}

                  <span className="small text-danger fw-bold">${item.precio.toLocaleString('es-AR')}</span>
                </div>
                
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => item.cantidad === 1 ? onEliminar(item.idVariante) : onModificarCantidad(item.idVariante, item.cantidad - 1)}
                  >
                    -
                  </button>
                  <span className="fw-bold px-1">{item.cantidad}</span>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => onModificarCantidad(item.idVariante, item.cantidad + 1)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn btn-link text-danger p-0 ms-1"
                    onClick={() => onEliminar(item.idVariante)}
                    title="Eliminar producto"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-top pt-2 mb-3 small">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-secondary">Subtotal</span>
              <span>${subtotal.toLocaleString('es-AR')}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-secondary">Tasa de servicio</span>
              <span>${tasaServicio.toLocaleString('es-AR')}</span>
            </div>
            <div className="d-flex justify-content-between fs-5 fw-bold text-dark pt-2 border-top">
              <span>Total</span>
              <span className="text-danger">${total.toLocaleString('es-AR')}</span>
            </div>
          </div>

          {!modoCheckout && (
            <Link to="/carrito" className="btn btn-danger w-100 py-2 fw-bold shadow-sm">
              Continuar con el pedido (${total.toLocaleString('es-AR')})
            </Link>
          )}
        </>
      )}
    </div>
  );
}

export default ResumenPedidoLateral;