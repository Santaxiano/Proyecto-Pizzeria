import { formatearPrecio } from '../../../shared/utils/formato'

const ENVIO_GRATIS_DESDE = 15000;
const COSTO_ENVIO = 1500;
const TASA_SERVICIO = 0.02; // 2% de tasa de servicio

function ResumenCarrito({ cantidadTotal, subtotal, tipoEntrega, onVaciar }) {
  const tasaServicioCalculada = subtotal > 0 ? subtotal * TASA_SERVICIO : 0;
  
  let envio = 0;
  if (tipoEntrega === 'delivery') {
      envio = subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
  }

  const total = subtotal + tasaServicioCalculada + envio;
  const faltaParaEnvioGratis = ENVIO_GRATIS_DESDE - subtotal;

  return (
    <div 
  className="card border shadow-sm p-4 bg-white sticky-top" style={{ top: '90px', zIndex: 4 }}>
      <div className="card-body">
        <h2 className="h5 mb-3">Mi pedido</h2>

        <dl className="row mb-0">
          <dt className="col-7 fw-normal">Subtotal ({cantidadTotal})</dt>
          <dd className="col-5 text-end">{formatearPrecio(subtotal)}</dd>
          
          <dt className="col-7 fw-normal">Tasa de servicio</dt>
          <dd className="col-5 text-end">{formatearPrecio(tasaServicioCalculada)}</dd>

          {tipoEntrega === 'delivery' && (
             <>
               <dt className="col-7 fw-normal">Envío</dt>
               <dd className="col-5 text-end">{envio === 0 ? 'Gratis' : formatearPrecio(envio)}</dd>
             </>
          )}

          <dt className="col-7 border-top pt-2">Total</dt>
          <dd className="col-5 text-end border-top pt-2 fw-bold text-danger fs-5">{formatearPrecio(total)}</dd>
        </dl>

        {tipoEntrega === 'delivery' && faltaParaEnvioGratis > 0 && (
          <p className="small text-body-secondary mt-2">
            Te faltan {formatearPrecio(faltaParaEnvioGratis)} para el envío gratis.
          </p>
        )}

        <div className="d-grid mt-3">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onVaciar}>
            Vaciar carrito
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResumenCarrito