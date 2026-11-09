export default function TarjetaComanda({ comanda, onEliminar, onConfirmarWpp, onCambiarEstado }) {
  // Colores dinámicos según el estado
  const colorEstado = 
    comanda.estado === 'Finalizada' ? 'bg-success' : 
    comanda.estado === 'Confirmada' ? 'bg-primary' : 'bg-danger';

  return (
    <div className="col">
      <div className={`card h-100 shadow-sm border-0 ${comanda.estado === 'Finalizada' ? 'opacity-75' : ''}`} style={{ borderTop: '4px solid var(--color-rojo-tomate)' }}>
        <div className="card-body d-flex flex-column">
          
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className={`badge ${comanda.tipo === 'delivery' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
              {comanda.tipo.toUpperCase()}
            </span>
            <span className={`badge ${colorEstado}`}>{comanda.estado}</span>
          </div>

          <div className="d-flex justify-content-between align-items-start mb-1">
            <h3 className="h5 fw-bold mb-0">{comanda.cliente}</h3>
            <span className="fw-bold text-success">${comanda.total}</span>
          </div>
          {comanda.direccionMesa && <p className="text-muted small mb-1">📍 {comanda.direccionMesa}</p>}
          {comanda.horario && <p className="text-muted small mb-1">🕒 {comanda.horario}</p>}
          {comanda.notas && <p className="text-muted small mb-1">📝 {comanda.notas}</p>}
          {comanda.ubicacionUrl && (
            <a
              href={comanda.ubicacionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-primary btn-sm align-self-start mb-2"
            >
              📍 Ver en el mapa
            </a>
          )}
          <p className="text-muted small mb-3">
            {comanda.formaPago === 'mercadopago' ? '💳 Mercado Pago' : '💵 Efectivo'}
          </p>
          
          <div className="bg-light p-2 rounded mb-3 flex-grow-1">
            <p className="small mb-0 fw-semibold">Detalle:</p>
            <p className="small mb-0 text-secondary">{comanda.detalle}</p>
          </div>

          {/* Botonera dinámica */}
          <div className="d-flex flex-column gap-2 mt-auto">
            
            {comanda.estado === 'Pendiente' && (
              <button className="btn btn-success fw-bold w-100" onClick={() => {
                onCambiarEstado('Confirmada');
                onConfirmarWpp();
              }}>
                <i className="bi bi-whatsapp"></i> Confirmar y Avisar
              </button>
            )}

            {comanda.estado === 'Confirmada' && (
              <button className="btn btn-primary fw-bold w-100" onClick={() => onCambiarEstado('Finalizada')}>
                ✓ Marcar como Finalizada
              </button>
            )}
            
            <div className="d-flex gap-2 mt-1">
              {/* El backend solo permite cambiar el estado de un pedido, no editarlo completo */}
              <span className="w-50" title="Para cambiar el pedido, eliminalo y crealo de nuevo">
                <button className="btn btn-outline-dark btn-sm w-100" disabled>
                  Editar
                </button>
              </span>
              <button className="btn btn-outline-danger btn-sm w-50" onClick={onEliminar}>
                Eliminar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}