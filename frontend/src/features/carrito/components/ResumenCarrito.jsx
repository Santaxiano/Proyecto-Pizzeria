import { formatearPrecio } from '../../../shared/utils/formato'
import { useFetch } from '../../../shared/hooks/useFetch'
import { obtenerConfigEnvio } from '../../../shared/services/configuracionService'
import { calcularEnvio, hayEnvioGratis } from '../../../shared/utils/envio'

// El costo de envío y el mínimo para envío gratis se configuran desde el gestor.
// Misma regla que aplica el backend al guardar el pedido.
// Sin tasa de servicio: el total que ve el cliente es el mismo que se guarda en el pedido.
function ResumenCarrito({ cantidadTotal, subtotal, tipoEntrega, onVaciar }) {
  const { datos: configEnvio } = useFetch(obtenerConfigEnvio);

  const envio = calcularEnvio(tipoEntrega, subtotal, configEnvio);
  const total = subtotal + envio;
  const faltaParaEnvioGratis = hayEnvioGratis(configEnvio) ? configEnvio.envioGratisDesde - subtotal : 0;
  const cargandoEnvio = tipoEntrega === 'delivery' && !configEnvio;

  return (
    <div 
  className="card border shadow-sm p-4 bg-white sticky-top" style={{ top: '90px', zIndex: 4 }}>
      <div className="card-body">
        <h2 className="h5 mb-3">Mi pedido</h2>

        <dl className="row mb-0">
          <dt className="col-7 fw-normal">Subtotal ({cantidadTotal})</dt>
          <dd className="col-5 text-end">{formatearPrecio(subtotal)}</dd>


          {tipoEntrega === 'delivery' && (
             <>
               <dt className="col-7 fw-normal">Envío</dt>
               <dd className="col-5 text-end">
                 {cargandoEnvio ? '…' : envio === 0 ? 'Gratis' : formatearPrecio(envio)}
               </dd>
             </>
          )}

          <dt className="col-7 border-top pt-2">Total</dt>
          <dd className="col-5 text-end border-top pt-2 fw-bold text-danger fs-5">
            {cargandoEnvio ? '…' : formatearPrecio(total)}
          </dd>
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