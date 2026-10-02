import { useState } from 'react';

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

  const actualizarCampo = (campo, valor) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevosErrores = {};

    if (!datos.fecha) nuevosErrores.fecha = 'Seleccioná la fecha.';
    if (!datos.hora) nuevosErrores.hora = 'Seleccioná un horario.';
    if (!datos.nombre.trim()) nuevosErrores.nombre = 'Ingresá el nombre completo.';
    if (!datos.whatsapp.trim() || datos.whatsapp.trim().length < 8) {
      nuevosErrores.whatsapp = 'Ingresá un WhatsApp válido.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    const reservaFinal = {
      ...datos,
      id: `res-${Date.now()}`,
      estado: 'pendiente'
    };

    if (onReservaConfirmada) {
      onReservaConfirmada(reservaFinal);
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
              className="form-control text-center fw-bold"
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
            className="form-select"
            value={datos.motivo}
            onChange={(e) => actualizarCampo('motivo', e.target.value)}
          >
            <option value="Salón Principal">Salón Principal</option>
            <option value="Subsuelo con Barra">Subsuelo con Barra (Grupos/Eventos)</option>
            <option value="Cumpleaños">Festejo de Cumpleaños</option>
            <option value="Reunión familiar/amigos">Reunión familiar o amigos</option>
          </select>
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

      <button type="submit" className="btn btn-success w-100 py-2 fw-bold mt-4">
        Guardar Reserva en la Agenda
      </button>
    </form>
  );
}