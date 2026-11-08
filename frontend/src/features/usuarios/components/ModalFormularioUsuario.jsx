import { useState, useEffect } from 'react';

export default function ModalFormularioUsuario({ usuarioAEditar, onGuardar, onCancelar }) {
  const [valores, setValores] = useState({
    nombre: '',
    email: '',
    rol: 'empleado'
  });

  useEffect(() => {
    if (usuarioAEditar) {
      setValores({
        nombre: usuarioAEditar.nombre || '',
        email: usuarioAEditar.email || '',
        rol: usuarioAEditar.rol || 'empleado'
      });
    }
  }, [usuarioAEditar]);

  const handleChange = (e) => setValores({ ...valores, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(valores);
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title fw-bold">Modificar Usuario</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onCancelar}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body py-4">
              <div className="mb-3">
                <label className="form-label fw-bold small">Nombre *</label>
                <input type="text" className="form-control" name="nombre" value={valores.nombre} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold small">Email *</label>
                <input type="email" className="form-control" name="email" value={valores.email} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold small">Rol *</label>
                <select className="form-select" name="rol" value={valores.rol} onChange={handleChange}>
                  <option value="empleado">Empleado</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-outline-secondary fw-bold" onClick={onCancelar}>Cancelar</button>
              <button type="submit" className="btn btn-success fw-bold">Guardar Cambios</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}