import { formatearPrecio } from '../../../shared/utils/formato';

const formatoFechaCorta = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit' });

function fechaReservaCorta(fecha) {
  if (!fecha) return '';
  return formatoFechaCorta.format(new Date(`${fecha}T00:00:00`));
}

function ToastsNotificaciones({ toasts, onCerrar, onVer }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="toast-container position-fixed top-0 end-0 p-3 contenedor-toasts-notificacion"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((notificacion) => {
        const esPedido = notificacion.tipo === 'pedido';

        return (
          <div
            key={notificacion.toastId}
            className="toast show border-0 shadow-lg toast-notificacion"
            role="status"
          >
            <div className="toast-header bg-dark text-white border-0">
              <span className="me-2" aria-hidden="true">{esPedido ? '🍕' : '📅'}</span>
              <strong className="me-auto">{esPedido ? 'Nuevo pedido' : 'Nueva reserva'}</strong>
              <small className="text-white-50">{notificacion.hora}</small>
              <button
                type="button"
                className="btn-close btn-close-white ms-2"
                onClick={() => onCerrar(notificacion.toastId)}
                aria-label="Cerrar aviso"
              />
            </div>

            <div className="toast-body">
              <p className="fw-bold mb-1">
                ¡{esPedido ? 'Nuevo pedido' : 'Nueva reserva'} de {notificacion.cliente}!
              </p>
              {!esPedido && notificacion.fechaReserva && (
                <p className="small fw-semibold mb-1">
                  Para el {fechaReservaCorta(notificacion.fechaReserva)}
                </p>
              )}
              <p className="small text-secondary mb-2">{notificacion.detalle}</p>
              {esPedido && Number.isFinite(Number(notificacion.total)) && (
                <p className="small fw-semibold mb-2">Total: {formatearPrecio(notificacion.total)}</p>
              )}
              <button
                type="button"
                className="btn btn-sm btn-tomate"
                onClick={() => {
                  onCerrar(notificacion.toastId);
                  onVer?.();
                }}
              >
                Ver notificaciones
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ToastsNotificaciones;
