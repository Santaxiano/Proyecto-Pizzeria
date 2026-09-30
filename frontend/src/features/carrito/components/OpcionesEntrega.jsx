function OpcionesEntrega({
  tipoEntrega,
  setTipoEntrega,
  sePuedeInmediato,
  modalidadHorario,
  setModalidadHorario,
  fechaProgramada,
  setFechaProgramada,
  horaProgramada,
  setHoraProgramada,
  errores
}) {
  return (
    <div className="mb-4">
      {/* Selector Retiro / Delivery */}
      <div className="btn-group w-100 mb-4" role="group">
        <button
          type="button"
          className={`btn py-2 fw-bold ${tipoEntrega === 'delivery' ? 'btn-dark' : 'btn-outline-dark'}`}
          onClick={() => setTipoEntrega('delivery')}
        >
          🛵 Delivery
        </button>
        <button
          type="button"
          className={`btn py-2 fw-bold ${tipoEntrega === 'retirar' ? 'btn-dark' : 'btn-outline-dark'}`}
          onClick={() => setTipoEntrega('retirar')}
        >
          🏪 Para retirar
        </button>
      </div>

      {/* Selector de Horario */}
      <div className="p-3 bg-light rounded-3 border">
        <label className="form-label fw-bold small text-uppercase">Horario de entrega / retiro</label>
        
        {!sePuedeInmediato && (
          <div className="badge text-bg-warning d-block text-start p-2 mb-3 text-wrap lh-base">
            ⚠️ Local cerrado para pedidos inmediatos. (Atención: 12:00 a 15:30 y 19:00 a 00:30 hs. Tomamos pedidos hasta 1 h antes del cierre).
          </div>
        )}

        <div className="d-flex flex-column flex-md-row gap-3 mb-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="modalidadHorario"
              id="horarioInmediato"
              value="inmediato"
              disabled={!sePuedeInmediato}
              checked={modalidadHorario === 'inmediato'}
              onChange={() => setModalidadHorario('inmediato')}
            />
            <label className="form-check-label small fw-semibold" htmlFor="horarioInmediato">
              Lo antes posible
            </label>
          </div>

          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="modalidadHorario"
              id="horarioProgramado"
              value="programado"
              checked={modalidadHorario === 'programado'}
              onChange={() => setModalidadHorario('programado')}
            />
            <label className="form-check-label small fw-semibold" htmlFor="horarioProgramado">
              Programar horario / otro día
            </label>
          </div>
        </div>

        {modalidadHorario === 'programado' && (
          <div className="row g-2 mt-2">
            <div className="col-sm-6">
              <input
                type="date"
                className={`form-control form-control-sm ${errores.fechaProgramada ? 'is-invalid' : ''}`}
                min={new Date().toISOString().split('T')[0]}
                value={fechaProgramada}
                onChange={(e) => setFechaProgramada(e.target.value)}
              />
              {errores.fechaProgramada && <div className="invalid-feedback">{errores.fechaProgramada}</div>}
            </div>
            <div className="col-sm-6">
              <select
                className="form-select form-select-sm"
                value={horaProgramada}
                onChange={(e) => setHoraProgramada(e.target.value)}
              >
                <option value="12:30">12:30 hs</option>
                <option value="13:30">13:30 hs</option>
                <option value="20:00">20:00 hs</option>
                <option value="21:00">21:00 hs</option>
                <option value="22:00">22:00 hs</option>
                <option value="23:00">23:00 hs</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OpcionesEntrega;