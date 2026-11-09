import { useState, useMemo } from 'react';
import { fechaLocalHoy } from '../../../shared/utils/fecha';
import IndicadorPasos from './IndicadorPasos'; 
import { validarDatosReserva, MAX_COMENSALES } from '../services/reservaService';

function FormularioReserva({ onReservaConfirmada }) {
  const [paso, setPaso] = useState(1);
  const [reservaEnviada, setReservaEnviada] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');

  const [datos, setDatos] = useState({
    fecha: '',
    personas: 2,
    hora: '',
    nombre: '',
    whatsapp: '',
    motivo: 'Salón Principal',
    comentarios: ''
  });

  const [errores, setErrores] = useState({});

  // Generación dinámica de horarios
  const horariosDisponibles = useMemo(() => {
    if (!datos.fecha) return [];
    const [anio, mes, dia] = datos.fecha.split('-');
    const fechaObj = new Date(anio, mes - 1, dia);
    const esDomingo = fechaObj.getDay() === 0;

    let horarios = [];
    
    // De Lunes a Sábado habilitamos el mediodía
    if (!esDomingo) {
      horarios.push('12:00', '12:30', '13:00', '13:30', '14:00');
    }
    // Todos los días habilitamos la noche
    horarios.push('19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30');

    // Filtramos los horarios que ya pasaron si la reserva es para HOY
    const hoy = new Date();
    const esHoy = hoy.getFullYear() === fechaObj.getFullYear() &&
                  hoy.getMonth() === fechaObj.getMonth() &&
                  hoy.getDate() === fechaObj.getDate();

    if (esHoy) {
      const horaActual = hoy.getHours() * 60 + hoy.getMinutes();
      horarios = horarios.filter(h => {
        const [hh, mm] = h.split(':').map(Number);
        return (hh * 60 + mm) > horaActual; // Solo deja los horarios futuros
      });
    }

    return horarios;
  }, [datos.fecha]);

  const actualizarCampo = (campo, valor) => {
    setDatos((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: null }));
    }
  };

  const avanzarPaso1 = () => {
    if (!datos.fecha) {
      setErrores({ fecha: 'Por favor seleccioná el día de tu visita.' });
      return;
    }
    setErrores({});
    setPaso(2);
  };

  const avanzarPaso2 = () => {
    if (!datos.hora) {
      setErrores({ hora: 'Seleccioná el turno de tu reserva.' });
      return;
    }
    setErrores({});
    setPaso(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevosErrores = validarDatosReserva(datos);

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      if (nuevosErrores.fecha) setPaso(1);
      else if (nuevosErrores.hora || nuevosErrores.personas) setPaso(2);
      return;
    }

    setEnviando(true);
    setErrorEnvio('');
    try {
      await onReservaConfirmada?.(datos);
      setReservaEnviada(true);
    } catch (error) {
      if (error.campos) {
        setErrores(error.campos);
        setErrorEnvio('');
      } else {
        setErrorEnvio(error.message || 'No se pudo enviar la reserva. Intentá nuevamente.');
      }
    } finally {
      setEnviando(false);
    }
  };

  const reiniciar = () => {
    setDatos({
      fecha: '', personas: 2, hora: '', nombre: '', whatsapp: '',
      motivo: 'Salón Principal', comentarios: ''
    });
    setPaso(1);
    setReservaEnviada(false);
    setErrorEnvio('');
  };

  if (reservaEnviada) {
    return (
      <div className="text-center py-4">
        <div className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center mb-3 shadow" style={{ width: '70px', height: '70px', fontSize: '2rem' }}>✓</div>
        <p className="text-uppercase small fw-bold text-secondary mb-1">Todo listo</p>
        <h2 className="fw-bold mb-3">Reserva enviada</h2>
        <p className="text-secondary mb-4 px-md-3">
          Tu solicitud fue registrada. Son <strong>{datos.personas} personas</strong> el día <strong>{datos.fecha}</strong> a las <strong>{datos.hora} hs</strong>.
        </p>
        <div className="p-3 bg-light rounded-3 border mb-4 text-start small text-secondary">
          ℹ️ <strong>Estado: Pendiente de confirmación.</strong> Nuestro equipo revisará la disponibilidad de mesas y se comunicará vía WhatsApp al <strong>{datos.whatsapp}</strong> para confirmar.
        </div>
        <button type="button" className="btn btn-dark w-100 py-2 fw-bold" onClick={reiniciar}>
          Hacer otra reserva
        </button>
      </div>
    );
  }

  return (
    <div>
      <IndicadorPasos pasoActual={paso} totalPasos={3} />

      {paso === 1 && (
        <div>
          <span className="badge text-bg-danger text-uppercase mb-2">Paso 1 de 3</span>
          <h3 className="h4 fw-bold mb-2">¿Qué día quieren venir?</h3>
          <p className="text-secondary small mb-4">Seleccioná la fecha de tu visita.</p>

          <div className="mb-4">
            <label htmlFor="fechaInput" className="form-label fw-semibold">Fecha:</label>
            <input
              id="fechaInput"
              type="date"
              className={`form-control form-control-lg ${errores.fecha ? 'is-invalid' : ''}`}
              value={datos.fecha}
              min={fechaLocalHoy()}
              onChange={(e) => {
                actualizarCampo('fecha', e.target.value);
                actualizarCampo('hora', ''); // Resetea la hora si cambian el día
              }}
            />
            {errores.fecha && <div className="invalid-feedback">{errores.fecha}</div>}
          </div>

          <button type="button" className="btn btn-danger w-100 py-2 fw-bold" onClick={avanzarPaso1}>
            Continuar con esta fecha →
          </button>
        </div>
      )}

      {paso === 2 && (
        <div>
          <button type="button" className="btn btn-link text-secondary text-decoration-none p-0 mb-3 small" onClick={() => setPaso(1)}>
            ← Cambiar fecha ({datos.fecha})
          </button>

          <h3 className="h4 fw-bold mb-1">¿Cuántas personas y a qué hora?</h3>
          <p className="text-secondary small mb-4">Elegí la cantidad de comensales y el turno disponible.</p>

          <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center mb-4">
            <div>
              <span className="d-block small text-secondary text-uppercase fw-bold">Personas</span>
              <span className="fs-5 fw-bold">{datos.personas} comensales</span>
            </div>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-dark rounded-circle" style={{ width: '38px', height: '38px' }} disabled={datos.personas <= 1} onClick={() => actualizarCampo('personas', datos.personas - 1)}>-</button>
              <button type="button" className="btn btn-outline-dark rounded-circle" style={{ width: '38px', height: '38px' }} disabled={datos.personas >= MAX_COMENSALES} onClick={() => actualizarCampo('personas', datos.personas + 1)}>+</button>
            </div>
          </div>
          {errores.personas && <div className="text-danger small mb-3">{errores.personas}</div>}

          <div className="mb-4">
            <label className="form-label fw-semibold">Turnos disponibles para el {datos.fecha}:</label>
            {horariosDisponibles.length > 0 ? (
              <select
                className={`form-select form-select-lg ${errores.hora ? 'is-invalid' : ''}`}
                value={datos.hora}
                onChange={(e) => actualizarCampo('hora', e.target.value)}
              >
                <option value="">Seleccioná un horario...</option>
                {horariosDisponibles.map((hora) => (
                  <option key={hora} value={hora}>{hora} hs</option>
                ))}
              </select>
            ) : (
              <div className="alert alert-warning p-2 small m-0">
                No quedan turnos disponibles para la fecha seleccionada.
              </div>
            )}
            {errores.hora && <div className="invalid-feedback d-block mt-1">{errores.hora}</div>}
          </div>

          <button type="button" className="btn btn-danger w-100 py-2 fw-bold" disabled={horariosDisponibles.length === 0} onClick={avanzarPaso2}>
            Siguiente: Tus Datos →
          </button>
        </div>
      )}

      {paso === 3 && (
        <form onSubmit={handleSubmit} noValidate>
          <button type="button" className="btn btn-link text-secondary text-decoration-none p-0 mb-3 small" onClick={() => setPaso(2)}>
            ← Modificar horario o personas
          </button>

          <h3 className="h4 fw-bold mb-1">Completá tus datos</h3>
          <p className="text-secondary small mb-3">Para el <strong>{datos.fecha}</strong> a las <strong>{datos.hora} hs</strong> ({datos.personas} personas).</p>

          <div className="mb-3">
            <label htmlFor="nombreReserva" className="form-label small fw-bold">Nombre y apellido *</label>
            <input id="nombreReserva" type="text" placeholder="Ej: Sofía Gómez" maxLength={255} className={`form-control ${errores.nombre ? 'is-invalid' : ''}`} value={datos.nombre} onChange={(e) => actualizarCampo('nombre', e.target.value)} />
            {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="wppReserva" className="form-label small fw-bold">WhatsApp de contacto *</label>
            <input id="wppReserva" type="tel" placeholder="Ej: 2664123456" maxLength={255} className={`form-control ${errores.whatsapp ? 'is-invalid' : ''}`} value={datos.whatsapp} onChange={(e) => actualizarCampo('whatsapp', e.target.value)} />
            {errores.whatsapp && <div className="invalid-feedback">{errores.whatsapp}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="sectorSelect" className="form-label small fw-bold">Sector / Motivo</label>
            <select id="sectorSelect" className={`form-select ${errores.motivo ? 'is-invalid' : ''}`} value={datos.motivo} onChange={(e) => actualizarCampo('motivo', e.target.value)}>
              <option value="Salón Principal">Salón Principal</option>
              <option value="Subsuelo con Barra">Subsuelo con Barra (Grupos/Eventos)</option>
              <option value="Cumpleaños">Festejo de Cumpleaños</option>
              <option value="Reunión familiar/amigos">Reunión familiar o amigos</option>
            </select>
            {errores.motivo && <div className="invalid-feedback">{errores.motivo}</div>}
          </div>

          <div className="mb-4">
            <label htmlFor="comentariosReserva" className="form-label small fw-bold">Comentarios opcionales</label>
            <textarea id="comentariosReserva" rows="2" placeholder="Ej: silla para bebé..." className="form-control" value={datos.comentarios} onChange={(e) => actualizarCampo('comentarios', e.target.value)}></textarea>
          </div>

          {errorEnvio && <div className="alert alert-danger" role="alert">{errorEnvio}</div>}

          <button type="submit" className="btn btn-danger w-100 py-2 fw-bold" disabled={enviando}>
            {enviando ? 'Enviando reserva...' : 'Confirmar Reserva'}
          </button>
        </form>
      )}
    </div>
  );
}

export default FormularioReserva;