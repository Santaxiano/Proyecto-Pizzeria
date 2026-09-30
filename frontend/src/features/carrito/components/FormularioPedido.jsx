function FormularioPedido({ 
  tipoEntrega, 
  setTipoEntrega,
  sePuedeInmediato,
  modalidadHorario,
  setModalidadHorario,
  fechaProgramada,
  setFechaProgramada,
  horaProgramada,
  setHoraProgramada,
  datosCliente,
  handleChange,
  errores,
  onSimularGeolocalizacion,
  onSubmit
}) {
  return (
    <form onSubmit={onSubmit} noValidate className="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
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
      <div className="p-3 bg-light rounded-3 border mb-4">
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

      <h4 className="h6 fw-bold mb-3">Datos de Contacto</h4>
      <div className="row g-3 mb-4">
        <div className="col-sm-6">
          <label className="form-label small fw-semibold">Nombre y apellido *</label>
          <input
            type="text"
            name="nombre"
            className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
            value={datosCliente.nombre}
            onChange={handleChange}
          />
          {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
        </div>
        <div className="col-sm-6">
          <label className="form-label small fw-semibold">Teléfono / WhatsApp *</label>
          <input
            type="tel"
            name="telefono"
            placeholder="Ej: 2664123456"
            className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
            value={datosCliente.telefono}
            onChange={handleChange}
          />
          {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
        </div>
      </div>

      {tipoEntrega === 'delivery' && (
        <div className="mb-4">
          <h4 className="h6 fw-bold mb-3">Dirección de Entrega</h4>
          <div className="row g-3 mb-3">
            <div className="col-sm-8">
              <label className="form-label small fw-semibold">Calle y número *</label>
              <input
                type="text"
                name="calleNumero"
                placeholder="Ej: Pringles 500"
                className={`form-control ${errores.calleNumero ? 'is-invalid' : ''}`}
                value={datosCliente.calleNumero}
                onChange={handleChange}
              />
              {errores.calleNumero && <div className="invalid-feedback">{errores.calleNumero}</div>}
            </div>
            <div className="col-sm-4">
              <label className="form-label small fw-semibold">Piso / Depto</label>
              <input
                type="text"
                name="pisoDepto"
                className="form-control"
                value={datosCliente.pisoDepto}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label small fw-semibold">Indicaciones de entrega</label>
              <input
                type="text"
                name="indicaciones"
                placeholder="Timbre 2, rejas negras, etc."
                className="form-control"
                value={datosCliente.indicaciones}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={onSimularGeolocalizacion}
          >
            📍 Validar zona de entrega
          </button>
          {errores.direccion && <div className="alert alert-danger small p-2 mt-2 mb-0">{errores.direccion}</div>}
          {errores.direccionExito && <div className="alert alert-success small p-2 mt-2 mb-0">{errores.direccionExito}</div>}
        </div>
      )}

      <h4 className="h6 fw-bold mb-3">Forma de Pago</h4>
      <div className="d-flex gap-4 mb-4">
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="formaPago"
            id="pagoEfectivo"
            value="efectivo"
            checked={datosCliente.formaPago === 'efectivo'}
            onChange={handleChange}
          />
          <label className="form-check-label small fw-semibold" htmlFor="pagoEfectivo">
            💵 Efectivo
          </label>
        </div>
        <div className="form-check">
          <input
            className="form-check-input"
            type="radio"
            name="formaPago"
            id="pagoTransferencia"
            value="transferencia"
            checked={datosCliente.formaPago === 'transferencia'}
            onChange={handleChange}
          />
          <label className="form-check-label small fw-semibold" htmlFor="pagoTransferencia">
            💳 Mercado Pago / Transferencia
          </label>
        </div>
      </div>

      <button type="submit" className="btn btn-danger w-100 py-3 fw-bold shadow-sm fs-5">
        Confirmar pedido
      </button>
    </form>
  )
}

export default FormularioPedido