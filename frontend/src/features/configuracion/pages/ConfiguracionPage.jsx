import { useState } from 'react';
import { useFetch } from '../../../shared/hooks/useFetch';
import { obtenerConfigEnvio, actualizarConfigEnvio } from '../../../shared/services/configuracionService';
import { formatearPrecio } from '../../../shared/utils/formato';

// Formulario de envío. Se monta recién cuando llegan los valores guardados,
// así el estado inicial ya los tiene (sin useEffect para copiarlos).
function FormularioEnvio({ configInicial }) {
  const [valores, setValores] = useState({
    costoEnvio: String(configInicial.costoEnvio),
    envioGratisDesde: String(configInicial.envioGratisDesde),
  });
  const [guardado, setGuardado] = useState(configInicial);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: 'success' | 'danger', texto }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));
    setMensaje(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const costoEnvio = Number(valores.costoEnvio);
    const envioGratisDesde = Number(valores.envioGratisDesde);

    if (!Number.isInteger(costoEnvio) || costoEnvio < 0 || !Number.isInteger(envioGratisDesde) || envioGratisDesde < 0) {
      setMensaje({ tipo: 'danger', texto: 'Ingresá montos enteros, sin decimales, de 0 o más.' });
      return;
    }

    setGuardando(true);
    setMensaje(null);
    try {
      const nuevo = await actualizarConfigEnvio({ costoEnvio, envioGratisDesde });
      setGuardado(nuevo);
      setMensaje({ tipo: 'success', texto: 'Cambios guardados. Ya se aplican a los pedidos nuevos.' });
    } catch (err) {
      setMensaje({ tipo: 'danger', texto: err.message });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {mensaje && <div className={`alert alert-${mensaje.tipo} fw-semibold`} role="alert">{mensaje.texto}</div>}

      <div className="mb-3">
        <label htmlFor="costoEnvio" className="form-label fw-bold small">Costo de envío ($)</label>
        <input
          id="costoEnvio"
          name="costoEnvio"
          type="number"
          min="0"
          step="1"
          className="form-control"
          value={valores.costoEnvio}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="envioGratisDesde" className="form-label fw-bold small">Envío gratis desde ($)</label>
        <input
          id="envioGratisDesde"
          name="envioGratisDesde"
          type="number"
          min="0"
          step="1"
          className="form-control"
          value={valores.envioGratisDesde}
          onChange={handleChange}
          required
        />
        <div className="form-text">Poné 0 para no ofrecer envío gratis.</div>
      </div>

      <div className="bg-light border rounded p-2 small mb-3">
        <span className="fw-semibold">Regla actual: </span>
        {formatearPrecio(guardado.costoEnvio)} por envío
        {guardado.envioGratisDesde > 0
          ? `, gratis en pedidos desde ${formatearPrecio(guardado.envioGratisDesde)}.`
          : ', sin envío gratis.'}
      </div>

      <button type="submit" className="btn btn-success fw-bold w-100" disabled={guardando}>
        {guardando ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
}

export default function ConfiguracionPage() {
  const { datos: config, cargando, error } = useFetch(obtenerConfigEnvio);

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
        <h1 className="h3 mb-0 fw-bold">Configuración</h1>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-6">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
              <h5 className="mb-0 fw-bold" style={{ color: 'var(--color-rojo-tomate)' }}>
                Costo de envío
              </h5>
              <p className="text-muted small mt-1">
                Se aplica a los pedidos con delivery, tanto del carrito web como de las comandas.
              </p>
            </div>
            <div className="card-body p-4">
              {cargando && <div className="text-center py-3"><div className="spinner-border text-danger" /></div>}
              {error && <div className="alert alert-danger">{error.message}</div>}
              {config && <FormularioEnvio configInicial={config} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
