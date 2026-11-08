import { useState } from 'react';
import { validarDatosReserva } from '../../reservas/services/reservaService';

const HORARIOS_DISPONIBLES = [
  '12:30', '13:30', '14:30',
  '20:00', '21:00', '22:00', '23:00'
];

export default function FormularioReserva({ onReservaConfirmada }) {
  const [datos, setDatos] = useState({
    fecha: new Date().toISOString().split('T')[0],
    personas: 2,
    hora: '20:00',
    nombre: '',
    whatsapp: '',
    motivo: 'Salón Principal',
    comentarios: ''
  });

  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  const actualizarCampo = (campo, valor) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevosErrores = validarDatosReserva(datos);

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setEnviando(true);
    setErrorEnvio('');
    try {
      await onReservaConfirmada?.(datos);
    } catch (error) {
      if (error.campos) {
        setErrores(error.campos);
        setErrorEnvio('');
      } else {
        setErrorEnvio(error.message || 'No se pudo guardar la reserva. Intentá nuevamente.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="row g-3">
        
        {/* Nombre y WhatsApp */}
        <div className="col-md-6">
          <label className="form-label small fw-bold">Nombre del cliente *</label>
          <input
            type="text"
            placeholder="Ej: Sofía Gómez"
            maxLength={255}
            className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
            value={datos.nombre}
            onChange={(e) => actualizarCampo('nombre', e.target.value)}
          />
          {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label small fw-bold">WhatsApp de contacto *</label>
          <input
            type="tel"
            placeholder="Ej: 2664123456"
            maxLength={255}
            className={`form-control ${errores.whatsapp ? 'is-invalid' : ''}`}
            value={datos.whatsapp}
            onChange={(e) => actualizarCampo('whatsapp', e.target.value)}
          />
          {errores.whatsapp && <div className="invalid-feedback">{errores.whatsapp}</div>}
        </div>

        {/* Fecha y Personas */}
        <div className="col-md-6">
          <label className="form-label small fw-bold">Fecha de la reserva *</label>
          <input
            type="date"
            className={`form-control ${errores.fecha ? 'is-invalid' : ''}`}
            value={datos.fecha}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => actualizarCampo('fecha', e.target.value)}
          />
          {errores.fecha && <div className="invalid-feedback">{errores.fecha}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label small fw-bold">Cantidad de personas *</label>
          <div className="input-group">
            <button 
              type="button" 
              className="btn btn-outline-dark" 
              disabled={datos.personas <= 1}
              onClick={() => actualizarCampo('personas', Math.max(1, datos.personas - 1))}
            >
              -
            </button>
            <input
              type="number"
              className={`form-control text-center fw-bold ${errores.personas ? 'is-invalid' : ''}`}
              value={datos.personas}
              onChange={(e) => actualizarCampo('personas', Number(e.target.value))}
              min="1"
              required
            />
            <button 
              type="button" 
              className="btn btn-outline-dark" 
              onClick={() => actualizarCampo('personas', datos.personas + 1)}
            >
              +
            </button>
          </div>
          {errores.personas && <div className="text-danger small mt-1">{errores.personas}</div>}
        </div>

        {/* Horarios Disponibles */}
        <div className="col-12">
          <label className="form-label small fw-bold">Turno / Horario *</label>
          <div className="d-flex flex-wrap gap-2">
            {HORARIOS_DISPONIBLES.map((hora) => {
              const activo = datos.hora === hora;
              return (
                <button
                  type="button"
                  key={hora}
                  className={`btn btn-sm ${activo ? 'btn-danger fw-bold' : 'btn-outline-secondary'}`}
                  onClick={() => actualizarCampo('hora', hora)}
                >
                  {hora} hs
                </button>
              );
            })}
          </div>
          {errores.hora && <div className="text-danger small mt-1">{errores.hora}</div>}
        </div>

        {/* Sector / Motivo */}
        <div className="col-md-6">
          <label className="form-label small fw-bold">Sector / Motivo</label>
          <select
            className={`form-select ${errores.motivo ? 'is-invalid' : ''}`}
            value={datos.motivo}
            onChange={(e) => actualizarCampo('motivo', e.target.value)}
          >
            <option value="Salón Principal">Salón Principal</option>
            <option value="Subsuelo con Barra">Subsuelo con Barra (Grupos/Eventos)</option>
            <option value="Cumpleaños">Festejo de Cumpleaños</option>
            <option value="Reunión familiar/amigos">Reunión familiar o amigos</option>
          </select>
          {errores.motivo && <div className="invalid-feedback">{errores.motivo}</div>}
        </div>

        {/* Comentarios */}
        <div className="col-md-6">
          <label className="form-label small fw-bold">Comentarios opcionales</label>
          <input
            type="text"
            placeholder="Ej: silla para bebé..."
            className="form-control"
            value={datos.comentarios}
            onChange={(e) => actualizarCampo('comentarios', e.target.value)}
          />
        </div>

      </div>

      {errorEnvio && <div className="alert alert-danger mt-3" role="alert">{errorEnvio}</div>}

      <button type="submit" className="btn btn-success w-100 py-2 fw-bold mt-4" disabled={enviando}>
        {enviando ? 'Guardando reserva...' : 'Guardar Reserva en la Agenda'}
      </button>
    </form>
  );
}