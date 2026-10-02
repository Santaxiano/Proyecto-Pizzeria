import { useState } from 'react';

export default function AgendaReservas({ 
  reservasDelDia, 
  mesas, 
  fechaFiltro, 
  setFechaFiltro, 
  onAsignarReserva, 
  onCancelarReserva 
}) {
  const [mesaSeleccionada, setMesaSeleccionada] = useState({});

  // Filtramos solo las mesas que están libres para esa reserva
  const mesasLibres = mesas.filter(m => m.estado === 'Libre');

  return (
    <div className="card shadow-sm border-0 bg-light h-100">
      <div className="card-header bg-dark text-white">
        <h5 className="m-0">Agenda de Reservas</h5>
      </div>
      <div className="card-body">
        
        <div className="mb-4">
          <label className="form-label fw-bold small text-muted">Viendo reservas del día:</label>
          <input 
            type="date" 
            className="form-control border-dark" 
            value={fechaFiltro} 
            onChange={(e) => setFechaFiltro(e.target.value)} 
          />
        </div>

        {reservasDelDia.length === 0 ? (
          <div className="text-center text-muted py-4">No hay reservas agendadas para esta fecha.</div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {reservasDelDia.map(reserva => {
              // Verificamos si esta reserva específica ya tiene una mesa asignada
              const mesaAsignada = mesas.find(m => m.reservaId === reserva.id);

              return (
                <div key={reserva.id} className="card border-secondary">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between">
                      <h6 className="fw-bold mb-1">{reserva.cliente}</h6>
                      <span className="badge bg-dark">{reserva.desde || reserva.hora} hs</span>
                    </div>
                    <p className="small text-muted mb-2">👥 {reserva.comensales || reserva.personas} personas | 📞 {reserva.contacto || reserva.whatsapp}</p>
                    <p className="small text-secondary mb-2 fst-italic">Sector: {reserva.lugarMotivo || reserva.motivo}</p>
                    
                    {mesaAsignada ? (
                      <div className="alert alert-success py-1 px-2 mb-0 small text-center">
                        Asignado a <strong>Mesa {mesaAsignada.id}</strong>
                      </div>
                    ) : (
                      <div className="d-flex gap-2 mt-2">
                        <select 
                          className="form-select form-select-sm"
                          value={mesaSeleccionada[reserva.id] || ''}
                          onChange={(e) => setMesaSeleccionada({...mesaSeleccionada, [reserva.id]: e.target.value})}
                        >
                          <option value="">Asignar mesa libre...</option>
                          {mesasLibres.map(m => (
                            <option key={m.id} value={m.id}>Mesa {m.id} (Hasta {m.capacidad} pers.)</option>
                          ))}
                        </select>
                        <button 
                          className="btn btn-primary btn-sm fw-bold"
                          disabled={!mesaSeleccionada[reserva.id]}
                          onClick={() => {
                            onAsignarReserva(reserva.id, mesaSeleccionada[reserva.id]);
                            // Limpiamos el select de esta reserva
                            setMesaSeleccionada({...mesaSeleccionada, [reserva.id]: ''});
                          }}
                        >
                          Fijar
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="card-footer bg-white border-top-0 pt-0 text-end">
                    <button 
                      className="btn btn-link text-danger text-decoration-none btn-sm p-0" 
                      onClick={() => onCancelarReserva(reserva.id, reserva.cliente)}
                    >
                      Cancelar Reserva
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}