export default function TarjetaMesa({ mesa, onOcupar, onLiberar, onQuitar }) {
  const colorCss = mesa.estado === 'Libre' ? 'success' : mesa.estado === 'Ocupada' ? 'danger' : 'secondary';

  return (
    <div className="col">
      <div className="card h-100 shadow-sm border-0" style={{ borderTop: `4px solid var(--bs-${colorCss})` }}>
        <div className="card-body d-flex flex-column">
          
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold fs-5 border rounded px-2">Mesa {mesa.id}</span>
            <span className={`badge bg-${colorCss}`}>{mesa.estado}</span>
          </div>
          
          <p className="small text-muted mb-2">Capacidad máxima: {mesa.capacidad} pers.</p>

          {/* Si está reservada, mostramos los datos inyectados por la barra lateral */}
          {mesa.estado === 'Reservada' && (
            <div className="bg-light p-2 rounded mb-3 border">
              <p className="mb-0 fw-bold">{mesa.cliente}</p>
              <p className="mb-0 small">Hora: {mesa.desde} | Pers: {mesa.comensales}</p>
            </div>
          )}

          {mesa.estado === 'Ocupada' && (
            <div className="bg-light p-2 rounded mb-3 border">
              <p className="mb-0 text-danger fw-bold text-center">En uso (Sin reserva)</p>
            </div>
          )}

          {/* Botonera de control manual */}
          <div className="mt-auto d-flex flex-column gap-2">
            {mesa.estado === 'Libre' && (
              <button className="btn btn-danger btn-sm fw-bold" onClick={() => onOcupar(mesa.id)}>
                Ocupar ahora
              </button>
            )}
            {mesa.estado !== 'Libre' && (
              <button className="btn btn-success btn-sm fw-bold" onClick={() => onLiberar(mesa.id)}>
                Liberar mesa
              </button>
            )}
            {mesa.estado === 'Libre' && (
              <button className="btn btn-outline-secondary btn-sm" onClick={() => onQuitar(mesa.id)}>
                Quitar del plano
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}