import { Link, useParams, useSearchParams } from 'react-router';

// Sin webhook público no podemos confirmar el pago en el backend: el pedido
// queda "Pendiente" y el cajero lo valida manualmente desde las comandas.
const RESULTADOS = {
  exitoso: {
    icono: '✓',
    claseIcono: 'text-success',
    titulo: 'Pago informado con éxito',
    subtitulo: 'Mercado Pago nos informó que la operación se completó.',
    alerta: 'success',
    mensaje: 'Tu pedido quedó registrado con estado Pendiente. El local va a validar el pago manualmente antes de prepararlo.',
  },
  fallido: {
    icono: '✕',
    claseIcono: 'text-danger',
    titulo: 'El pago no se completó',
    subtitulo: 'La operación fue cancelada o rechazada. No se realizó ningún cobro.',
    alerta: 'warning',
    mensaje: 'Tu pedido sigue registrado con estado Pendiente. Podés abonarlo en efectivo al recibirlo o coordinar el pago con el local.',
  },
  pendiente: {
    icono: '⏳',
    claseIcono: 'text-warning',
    titulo: 'Pago pendiente de acreditación',
    subtitulo: 'Mercado Pago todavía no confirmó la operación.',
    alerta: 'info',
    mensaje: 'Tu pedido quedó registrado con estado Pendiente. Cuando el pago se acredite, el local lo va a validar manualmente.',
  },
};

export default function PagoResultadoPage({ resultado = 'pendiente' }) {
  const { pedidoId } = useParams();
  const [searchParams] = useSearchParams();
  const config = RESULTADOS[resultado] ?? RESULTADOS.pendiente;

  // El número puede venir en la ruta (/pago-exitoso/12) o en los parámetros
  // que agrega Mercado Pago al volver (external_reference / pedido).
  const numeroPedido = pedidoId
    || searchParams.get('pedido')
    || searchParams.get('external_reference');
  const pedidoValido = numeroPedido && /^\d+$/.test(numeroPedido) ? numeroPedido : null;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-7 col-xl-6">
          <div className="card border-0 shadow-sm text-center">
            <div className="card-body p-4 p-md-5">
              <div className={`display-4 fw-bold mb-2 ${config.claseIcono}`} aria-hidden="true">
                {config.icono}
              </div>

              <h1 className="h3 fw-bold mb-2">{config.titulo}</h1>
              <p className="text-secondary mb-3">{config.subtitulo}</p>

              {pedidoValido && (
                <p className="fs-5 mb-3">
                  Pedido <strong>#{pedidoValido}</strong>
                </p>
              )}

              <div className={`alert alert-${config.alerta} text-start small mb-4`} role="alert">
                {config.mensaje}
              </div>

              <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                <Link to="/menu" className="btn btn-danger fw-bold">
                  Volver a la carta
                </Link>
                <Link to="/contacto" className="btn btn-outline-dark">
                  Contactar al local
                </Link>
              </div>

              {resultado === 'fallido' && (
                <p className="small text-muted mt-4 mb-0">
                  Si querés reintentar el pago online, contactá al local con tu número de pedido para evitar duplicados.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
