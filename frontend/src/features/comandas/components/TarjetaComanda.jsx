export default function TarjetaComanda({ comanda, onEditar, onEliminar, onConfirmarWpp, onCambiarEstado }) {
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
          <p className="text-muted small mb-3">📍 {comanda.direccionMesa}</p>
          
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
              <button className="btn btn-outline-dark btn-sm w-50" onClick={onEditar} disabled={comanda.estado === 'Finalizada'}>
                Editar
              </button>
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