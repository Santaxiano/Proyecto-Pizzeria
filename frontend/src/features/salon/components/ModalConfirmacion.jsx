export default function ModalConfirmacion({
  titulo,
  mensaje,
  error,
  procesando = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title fw-bold">⚠️ Atención</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onCancelar}></button>
          </div>
          <div className="modal-body py-4">
            <h4 className="h5 fw-bold mb-2">{titulo}</h4>
            <p className="text-secondary mb-0">{mensaje}</p>
            {error && <div className="alert alert-danger mt-3 mb-0" role="alert">{error}</div>}
          </div>
          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-outline-secondary fw-bold" onClick={onCancelar} disabled={procesando}>
              Cancelar
            </button>
            <button type="button" className="btn btn-danger fw-bold" onClick={onConfirmar} disabled={procesando}>
              {procesando ? 'Procesando...' : 'Sí, confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}