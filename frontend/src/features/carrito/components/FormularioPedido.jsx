import { useMemo } from 'react';

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

  // Generación dinámica de horarios para los pedidos
  const horariosDisponibles = useMemo(() => {
    if (!fechaProgramada) return [];
    
    const [anio, mes, dia] = fechaProgramada.split('-');
    const fechaObj = new Date(anio, mes - 1, dia);
    const esDomingo = fechaObj.getDay() === 0;

    let horarios = [];
    
    // Rango Mediodía (Lunes a Sábado). 
    // Apertura: 12:00 a 15:30. Pedidos hasta 1 hora antes (14:30).
    if (!esDomingo) {
      horarios.push('12:00', '12:30', '13:00', '13:30', '14:00', '14:30');
    }
    
    // Rango Noche (Todos los días). 
    // Apertura: 19:00 a 00:30. Pedidos hasta 1 hora antes (23:30).
    horarios.push('19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30');

    // Filtramos si eligió "Hoy" para no mostrar horarios pasados
    const hoy = new Date();
    const esHoy = hoy.getFullYear() === fechaObj.getFullYear() &&
                  hoy.getMonth() === fechaObj.getMonth() &&
                  hoy.getDate() === fechaObj.getDate();

    if (esHoy) {
      const horaActual = hoy.getHours() * 60 + hoy.getMinutes();
      // Damos 30 min de gracia: ej si son 20:15, el turno de las 20:30 ya no se puede pedir programado.
      horarios = horarios.filter(h => {
        const [hh, mm] = h.split(':').map(Number);
        return (hh * 60 + mm) > (horaActual + 30); 
      });
    }

    return horarios;
  }, [fechaProgramada]);

  // Si cambia la fecha y la hora actual ya no es válida, reseteamos el select
  if (horaProgramada && !horariosDisponibles.includes(horaProgramada)) {
    setHoraProgramada('');
  }

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
              onChange={() => {
                setModalidadHorario('inmediato');
                setErrores((prev) => ({ ...prev, fechaProgramada: null, horaProgramada: null }));
              }}
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
              <label className="form-label small fw-semibold mb-1">Fecha</label>
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
              <label className="form-label small fw-semibold mb-1">Horario</label>
              {horariosDisponibles.length > 0 ? (
                <select
                  className={`form-select form-select-sm ${errores.horaProgramada ? 'is-invalid' : ''}`}
                  value={horaProgramada}
                  onChange={(e) => setHoraProgramada(e.target.value)}
                >
                  <option value="">Seleccioná...</option>
                  {horariosDisponibles.map((hora) => (
                    <option key={hora} value={hora}>{hora} hs</option>
                  ))}
                </select>
              ) : (
                <select className="form-select form-select-sm" disabled>
                  <option>Sin horarios disponibles</option>
                </select>
              )}
              {errores.horaProgramada && <div className="text-danger small mt-1">{errores.horaProgramada}</div>}
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

      <button type="submit" className="btn btn-danger w-100 py-3 fw-bold shadow-sm fs-5" disabled={modalidadHorario === 'programado' && (!fechaProgramada || !horaProgramada)}>
        Confirmar pedido
      </button>
    </form>
  )
}

export default FormularioPedido