import { useState } from 'react';

const DURACION_RESERVA_MS = 2 * 60 * 60 * 1000; // Asumimos que la mesa se ocupa 2 horas

function obtenerInicioReserva(reserva) {
  return new Date(`${reserva.fecha}T${reserva.hora || reserva.desde}`).getTime();
}

function reservasSeSuperponen(reserva, otraReserva) {
  const inicio1 = obtenerInicioReserva(reserva);
  const fin1 = inicio1 + DURACION_RESERVA_MS;
  const inicio2 = obtenerInicioReserva(otraReserva);
  const fin2 = inicio2 + DURACION_RESERVA_MS;
  
  return Number.isFinite(inicio1) && Number.isFinite(inicio2) &&
         Math.max(inicio1, inicio2) < Math.min(fin1, fin2); // Lógica de superposición estricta
}

export default function AgendaReservas({
  reservasDelDia, reservas, fechasProximas, mesas,
  fechaFiltro, setFechaFiltro, onAsignarReserva, onCancelarReserva
}) {
  const [mesaSeleccionada, setMesaSeleccionada] = useState({});
  const [erroresAsignacion, setErroresAsignacion] = useState({});
  const [asignando, setAsignando] = useState({});

  const asignarMesa = async (reservaId, mesasIds) => {
    setAsignando((actuales) => ({ ...actuales, [reservaId]: true }));
    setErroresAsignacion((actuales) => ({ ...actuales, [reservaId]: '' }));
    try {
      await onAsignarReserva(reservaId, mesasIds);
      setMesaSeleccionada((actuales) => {
        const siguientes = { ...actuales };
        delete siguientes[reservaId];
        return siguientes;
      });
    } catch (error) {
      setErroresAsignacion((actuales) => ({ ...actuales, [reservaId]: error.message }));
    } finally {
      setAsignando((actuales) => ({ ...actuales, [reservaId]: false }));
    }
  };

  return (
    <div className="card shadow-sm border-0 bg-light h-100">
      <div className="card-header bg-dark text-white">
        <h5 className="m-0">Agenda de Reservas</h5>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <label className="form-label fw-bold small text-muted">Viendo reservas del día:</label>
          <input type="date" className="form-control border-dark" value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} />
        </div>

        {reservasDelDia.length === 0 ? (
          <div className="text-center text-muted py-4">
            <p className="mb-2">No hay reservas agendadas para esta fecha.</p>
            {fechasProximas.length > 0 && (
              <div className="mt-3">
                <p className="small fw-bold mb-2">Próximas fechas con reservas:</p>
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  {fechasProximas.map((fecha) => {
                    const etiqueta = new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR', {
                      weekday: 'short', day: 'numeric', month: 'short',
                    });
                    return (
                      <button key={fecha} type="button" className="btn btn-outline-dark btn-sm" onClick={() => setFechaFiltro(fecha)}>
                        {etiqueta}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {reservasDelDia.map((reserva) => {
              const mesasIdsAsignadas = reserva.mesasIds ?? [];
              const mesasAsignadas = mesasIdsAsignadas.map((id) => mesas.find((mesa) => mesa.id === Number(id))).filter(Boolean);
              const capacidadAsignada = mesasAsignadas.reduce((total, mesa) => total + mesa.capacidad, 0);
              const comensales = Number(reserva.comensales ?? reserva.personas);
              const resuelta = mesasAsignadas.length > 0 && capacidadAsignada >= comensales;
              const seleccionActual = mesaSeleccionada[reserva.id] ?? mesasIdsAsignadas;
              const seleccionIds = new Set(seleccionActual.map(Number));
              const mesasEnConflicto = new Set(
                reservas
                  .filter((otraReserva) => (otraReserva.id !== reserva.id && reservasSeSuperponen(reserva, otraReserva)))
                  .flatMap((otraReserva) => otraReserva.mesasIds ?? [])
                  .map(Number)
              );
              const mesasDisponibles = mesas.filter((mesa) => (
                seleccionIds.has(mesa.id) || (mesa.estado !== 'Ocupada' && !mesasEnConflicto.has(mesa.id))
              ));

              return (
                <div key={reserva.id} className="card border-secondary">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between">
                      <h6 className="fw-bold mb-1">{reserva.cliente}</h6>
                      <span className="badge bg-dark">{reserva.desde || reserva.hora} hs</span>
                    </div>
                    <p className="small text-muted mb-2">👥 {comensales} personas | 📞 {reserva.contacto || reserva.whatsapp}</p>
                    <p className="small text-secondary mb-2 fst-italic">Sector: {reserva.lugarMotivo || reserva.motivo}</p>
                    
                    <div className={`alert ${resuelta ? 'alert-success' : 'alert-warning'} py-1 px-2 mb-2 small`}>
                      <div className="fw-bold">{resuelta ? 'Resuelta' : 'Pendiente de mesas'}</div>
                      {mesasAsignadas.length > 0 ? (
                        <>
                          <div>Mesas asignadas: {mesasAsignadas.map((mesa) => `Mesa ${mesa.id}`).join(', ')}</div>
                          <div>Capacidad: {capacidadAsignada} de {comensales} lugares {!resuelta && ` (faltan ${comensales - capacidadAsignada})`}</div>
                        </>
                      ) : (<div>Sin mesas asignadas</div>)}
                    </div>

                    <div className="form-label small fw-bold mb-1">Asignar mesas</div>
                    <details className="border rounded">
                      <summary className="px-2 py-1 small fw-semibold">Elegir mesas ({seleccionActual.length})</summary>
                      <div className="p-2 border-top d-flex flex-column gap-1">
                        {mesas.map((mesa) => {
                          const seleccionada = seleccionIds.has(mesa.id);
                          const disponible = mesasDisponibles.some((item) => item.id === mesa.id);
                          return (
                            <label key={mesa.id} className="form-check mb-0">
                              <input
                                className="form-check-input" type="checkbox"
                                checked={seleccionada} disabled={!disponible}
                                onChange={(e) => {
                                  const agregada = e.target.checked;
                                  setMesaSeleccionada((actuales) => {
                                    const seleccionPrevia = actuales[reserva.id] ?? mesasIdsAsignadas;
                                    const seleccionNueva = agregada ? [...seleccionPrevia, mesa.id] : seleccionPrevia.filter((id) => Number(id) !== mesa.id);
                                    return { ...actuales, [reserva.id]: seleccionNueva };
                                  });
                                }}
                              />
                              <span className="form-check-label">Mesa {mesa.id} (hasta {mesa.capacidad} pers.) {!disponible && ' (no disponible en este horario)'}</span>
                            </label>
                          );
                        })}
                      </div>
                    </details>
                    <button className="btn btn-primary btn-sm fw-bold mt-2 w-100" disabled={asignando[reserva.id] || (seleccionActual.length === 0 && mesasIdsAsignadas.length === 0)} onClick={() => asignarMesa(reserva.id, seleccionActual)}>
                      {asignando[reserva.id] ? 'Guardando...' : 'Guardar mesas asignadas'}
                    </button>
                    {erroresAsignacion[reserva.id] && (<div className="text-danger small mt-2" role="alert">{erroresAsignacion[reserva.id]}</div>)}
                  </div>
                  <div className="card-footer bg-white border-top-0 pt-0 text-end">
                    <button className="btn btn-link text-danger text-decoration-none btn-sm p-0" onClick={() => onCancelarReserva(reserva.id, reserva.cliente)}>
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