import { useEffect } from 'react';
import { Link } from 'react-router';
import { formatearPrecio } from '../../../shared/utils/formato';
import { fechaLocalHoy } from '../../../shared/utils/fecha';

const formatoFechaLarga = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long' });
const formatoFechaCorta = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit' });
const formatoHora = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function fechaLegible(fecha) {
  if (!fecha) return '';
  return formatoFechaLarga.format(new Date(`${fecha}T00:00:00`));
}

function fechaReservaCorta(fecha) {
  if (!fecha) return '';
  return formatoFechaCorta.format(new Date(`${fecha}T00:00:00`));
}

function PanelNotificaciones({
  abierto,
  onCerrar,
  fecha,
  onCambiarFecha,
  notificaciones,
  cargando,
  error,
  onRecargar,
  leidas,
  onMarcarTodasLeidas,
  sonidoActivo,
  onAlternarSonido,
  ultimaActualizacion,
}) {
  useEffect(() => {
    if (!abierto) return undefined;

    const alPresionarTecla = (evento) => {
      if (evento.key === 'Escape') onCerrar();
    };

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', alPresionarTecla);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener('keydown', alPresionarTecla);
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const sinLeer = notificaciones.reduce(
    (total, notificacion) => total + (leidas[notificacion.id] ? 0 : 1),
    0
  );
  const horaActualizacion = ultimaActualizacion ? formatoHora.format(ultimaActualizacion) : null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onCerrar} />

      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tituloNotificaciones"
        onClick={onCerrar}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
          onClick={(evento) => evento.stopPropagation()}
        >
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-dark text-white border-0">
              <div>
                <h2 id="tituloNotificaciones" className="modal-title h5 mb-0">🔔 Notificaciones</h2>
                <small className="text-white-50">Pedidos y reservas recibidos</small>
              </div>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onCerrar}
                aria-label="Cerrar notificaciones"
              />
            </div>

            <div className="modal-body">
              <div className="row g-2 align-items-end">
                <div className="col-12 col-sm-6">
                  <label htmlFor="fechaNotificaciones" className="form-label small fw-semibold mb-1">
                    Fecha de recepción
                  </label>
                  <input
                    id="fechaNotificaciones"
                    type="date"
                    className="form-control"
                    value={fecha}
                    max={fechaLocalHoy()}
                    onChange={(evento) => onCambiarFecha(evento.target.value || fechaLocalHoy())}
                  />
                </div>
                <div className="col-6 col-sm-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={() => onCambiarFecha(fechaLocalHoy())}
                  >
                    Hoy
                  </button>
                </div>
                <div className="col-6 col-sm-3">
                  <button
                    type="button"
                    className={`btn w-100 ${sonidoActivo ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                    onClick={onAlternarSonido}
                    aria-pressed={sonidoActivo}
                    title={sonidoActivo ? 'Desactivar sonido de aviso' : 'Activar sonido de aviso'}
                  >
                    {sonidoActivo ? '🔔 Sonido' : '🔕 Sonido'}
                  </button>
                </div>
              </div>

              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 pb-2 border-bottom">
                <p className="small text-secondary mb-0">
                  {cargando
                    ? 'Cargando notificaciones...'
                    : `${notificaciones.length} ${notificaciones.length === 1 ? 'novedad' : 'novedades'} del ${fechaLegible(fecha)} · ${sinLeer} sin leer`}
                </p>
                <button
                  type="button"
                  className="btn btn-sm btn-tomate"
                  onClick={onMarcarTodasLeidas}
                  disabled={cargando || sinLeer === 0}
                >
                  ✓ Marcar todas como leídas
                </button>
              </div>

              {error && (
                <div className="alert alert-warning d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 mb-0">
                  <span>{error}</span>
                  <button type="button" className="btn btn-sm btn-outline-dark" onClick={onRecargar}>
                    Reintentar
                  </button>
                </div>
              )}

              {cargando && (
                <div className="text-center py-5" role="status">
                  <div className="spinner-border text-danger" aria-hidden="true" />
                  <p className="text-secondary small mt-2 mb-0">Buscando notificaciones...</p>
                </div>
              )}

              {!cargando && !error && notificaciones.length === 0 && (
                <div className="text-center py-5 text-secondary">
                  <div className="display-5 mb-2" aria-hidden="true">🔔</div>
                  <p className="mb-0">No hay pedidos ni reservas recibidos el {fechaLegible(fecha)}.</p>
                </div>
              )}

              {!cargando && notificaciones.length > 0 && (
                <ul className="list-group list-group-flush lista-notificaciones mt-1">
                  {notificaciones.map((notificacion) => {
                    const esPedido = notificacion.tipo === 'pedido';
                    const leida = Boolean(leidas[notificacion.id]);

                    return (
                      <li
                        key={notificacion.id}
                        className={`list-group-item px-0 py-3 ${leida ? '' : 'notificacion-no-leida'}`}
                      >
                        <div className="d-flex gap-3">
                          <span className="fs-4 lh-1" aria-hidden="true">
                            {esPedido ? '🍕' : '📅'}
                          </span>

                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="d-flex flex-wrap justify-content-between align-items-center gap-1">
                              <div className="fw-semibold">
                                {esPedido ? 'Pedido' : 'Reserva'} de {notificacion.cliente}
                                {!leida && <span className="badge text-bg-danger ms-2">Nueva</span>}
                              </div>
                              <span className="badge text-bg-light border">
                                <span aria-hidden="true">🕒</span> {notificacion.hora}
                              </span>
                            </div>

                            <p className="small text-secondary mb-1">{notificacion.detalle}</p>

                            <div className="d-flex flex-wrap align-items-center gap-2 small text-secondary">
                              {esPedido ? (
                                <>
                                  <span className="text-capitalize">{notificacion.tipoPedido}</span>
                                  <span aria-hidden="true">·</span>
                                  <span>{formatearPrecio(notificacion.total)}</span>
                                  <span aria-hidden="true">·</span>
                                  <span>{notificacion.estado}</span>
                                </>
                              ) : (
                                <>
                                  <span>
                                    Para el {fechaReservaCorta(notificacion.fechaReserva)} a las{' '}
                                    {notificacion.horaReserva} hs
                                  </span>
                                  <span aria-hidden="true">·</span>
                                  <span>{notificacion.estado}</span>
                                </>
                              )}

                              <Link
                                to={esPedido ? '/gestor/comandas' : '/gestor/salon'}
                                className="btn btn-sm btn-link p-0 ms-auto text-decoration-none"
                                onClick={onCerrar}
                              >
                                Abrir {esPedido ? 'comandas' : 'salón'}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="modal-footer justify-content-between flex-wrap gap-2">
              <span className="small text-secondary">
                Se actualiza cada 15 s
                {horaActualizacion ? ` · Última actualización ${horaActualizacion}` : ''}
              </span>
              <div className="d-flex gap-2">
                <Link to="/gestor/comandas" className="btn btn-sm btn-outline-dark" onClick={onCerrar}>
                  Ir a comandas
                </Link>
                <Link to="/gestor/salon" className="btn btn-sm btn-outline-dark" onClick={onCerrar}>
                  Ir al salón
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PanelNotificaciones;
