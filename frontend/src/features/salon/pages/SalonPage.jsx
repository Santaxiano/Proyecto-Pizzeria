import '../../comandas/pages/salonComandas.css';
import mesas from '../../../../../backend/data/mesas.json';
import reservasIniciales from '../../../../../backend/data/reservas.json';
import { useEffect, useState } from 'react';

const estadoClase = {
  Libre: 'libre',
  Ocupada: 'ocupada',
  Reservada: 'reservada'
};

function aplicarReservasIniciales(mesasBase) {
  return mesasBase.map((mesa) => {
    const reserva = reservasIniciales.find((dato) => dato.mesasIds.includes(mesa.id));
    if (!reserva) return mesa;
    return {
      ...mesa,
      reservaId: reserva.id,
      estado: 'Reservada',
      cliente: reserva.cliente,
      contacto: reserva.contacto,
      fecha: reserva.fecha,
      lugarMotivo: reserva.lugarMotivo,
      comensales: reserva.comensales ?? mesa.comensales,
      desde: reserva.desde
    };
  });
}

function TarjetaMesa({ mesa, onCancelarReserva, onQuitar }) {
  const estadoCss = estadoClase[mesa.estado];

  return (
    <article className="col">
      <div className={`card h-100 mesa-item mesa-${estadoCss}`}>
        <div className="card-body">
          <div className="mesa-cabecera d-flex align-items-center justify-content-between">
            <span className="mesa-icono" aria-hidden="true">{String(mesa.id).padStart(2, '0')}</span>
            <span className={`badge etiqueta-estado ${estadoCss}`}>{mesa.estado}</span>
          </div>
          <h2 className="h5 mt-3 mb-1">Mesa {mesa.id}</h2>
          <p className="mesa-dato mb-1">
            {mesa.comensales ? `${mesa.comensales} comensales` : `Hasta ${mesa.capacidad} personas`}
          </p>
          <p className="mesa-hora mb-0">
            {mesa.estado === 'Ocupada' ? `Desde ${mesa.desde}` : mesa.estado === 'Reservada' ? `Reserva ${mesa.desde}` : 'Disponible'}
          </p>
          {mesa.estado === 'Reservada' && mesa.cliente && <p className="mesa-dato mb-0">A nombre de {mesa.cliente}</p>}
          {mesa.estado === 'Reservada' && mesa.fecha && <p className="mesa-dato mb-0">Fecha: {mesa.fecha}</p>}
          {mesa.estado === 'Reservada' && mesa.contacto && <p className="mesa-dato mb-0">Contacto: {mesa.contacto}</p>}
          {mesa.estado === 'Reservada' && mesa.lugarMotivo && <p className="mesa-dato mb-0">Lugar / motivo: {mesa.lugarMotivo}</p>}
          {mesa.estado === 'Libre' && (
            <div className="acciones-mesa mt-3">
              <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => onQuitar(mesa.id)} aria-label={`Quitar mesa ${mesa.id}`}>
                Quitar
              </button>
            </div>
          )}
          {mesa.estado === 'Reservada' && (
            <button className="btn btn-sm btn-outline-secondary mt-3" type="button" onClick={() => onCancelarReserva(mesa.id)}>
              Cancelar reserva
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function SalonPage() {
  const [mesasActuales, setMesasActuales] = useState(() => {
    try {
      const guardadas = localStorage.getItem('salon-mesas');
      return aplicarReservasIniciales(guardadas ? JSON.parse(guardadas) : mesas);
    } catch {
      return aplicarReservasIniciales(mesas);
    }
  });
  const [capacidadNueva, setCapacidadNueva] = useState(4);
  const [formReservaAbierto, setFormReservaAbierto] = useState(false);
  const [reservasVisibles, setReservasVisibles] = useState(false);
  const [mesasReservaIds, setMesasReservaIds] = useState([]);
  const [errorReserva, setErrorReserva] = useState('');

  useEffect(() => {
    localStorage.setItem('salon-mesas', JSON.stringify(mesasActuales));
  }, [mesasActuales]);

  function agregarMesa(evento) {
    evento.preventDefault();
    const nuevoId = Math.max(0, ...mesasActuales.map((mesa) => mesa.id)) + 1;
    setMesasActuales([...mesasActuales, { id: nuevoId, estado: 'Libre', capacidad: Number(capacidadNueva) }]);
  }

  function guardarReserva(evento) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const idsSeleccionados = datos.getAll('mesaIds').map(Number);
    const mesasDisponiblesSeleccionadas = mesasLibres.filter((mesa) => idsSeleccionados.includes(mesa.id));

    if (idsSeleccionados.length === 0 || mesasDisponiblesSeleccionadas.length !== idsSeleccionados.length) {
      setErrorReserva('Selecciona al menos una mesa libre.');
      return;
    }

    const capacidadSeleccionada = mesasDisponiblesSeleccionadas.reduce((total, mesa) => total + mesa.capacidad, 0);
    const comensales = Number(datos.get('comensales'));
    if (comensales > capacidadSeleccionada) {
      setErrorReserva(`La capacidad de las mesas seleccionadas es de ${capacidadSeleccionada} personas.`);
      return;
    }

    const reservaId = `reserva-${[...idsSeleccionados].sort((a, b) => a - b).join('-')}`;
    const reserva = {
      reservaId,
      cliente: datos.get('cliente').trim(),
      contacto: datos.get('contacto').trim(),
      fecha: datos.get('fecha'),
      lugarMotivo: datos.get('lugarMotivo'),
      comensales,
      desde: datos.get('desde'),
      estado: 'Reservada'
    };
    setMesasActuales((actuales) => actuales.map((mesa) => (
      idsSeleccionados.includes(mesa.id) ? { ...mesa, ...reserva } : mesa
    )));
    evento.currentTarget.reset();
    setMesasReservaIds([]);
    setErrorReserva('');
    setFormReservaAbierto(false);
  }

  function cancelarReserva(id) {
    setMesasActuales((actuales) => {
      const mesaReservada = actuales.find((mesa) => mesa.id === id);
      if (!mesaReservada) return actuales;

      return actuales.map((mesa) => {
        const perteneceAReserva = mesaReservada.reservaId
          ? mesa.reservaId === mesaReservada.reservaId
          : mesa.id === id;
        if (!perteneceAReserva) return mesa;
        return { id: mesa.id, capacidad: mesa.capacidad, estado: 'Libre' };
      });
    });
  }

  function quitarMesa(id) {
    setMesasActuales((actuales) => actuales.filter((mesa) => mesa.id !== id));
  }

  const resumenActual = mesasActuales.reduce((conteo, mesa) => {
    conteo[mesa.estado] += 1;
    return conteo;
  }, { Libre: 0, Ocupada: 0, Reservada: 0 });
  const mesasLibres = mesasActuales.filter((mesa) => mesa.estado === 'Libre');
  const reservasActuales = mesasActuales.filter((mesa) => mesa.estado === 'Reservada');
  const reservasAgrupadas = reservasActuales.reduce((agrupadas, mesa) => {
    const clave = mesa.reservaId ?? `mesa-${mesa.id}`;
    const reserva = agrupadas.get(clave);
    if (reserva) {
      reserva.mesas.push(mesa.id);
    } else {
      agrupadas.set(clave, { ...mesa, mesas: [mesa.id] });
    }
    return agrupadas;
  }, new Map());
  const reservasLista = [...reservasAgrupadas.values()];
  const capacidadSeleccionada = mesasLibres
    .filter((mesa) => mesasReservaIds.includes(String(mesa.id)))
    .reduce((total, mesa) => total + mesa.capacidad, 0);

  return (
    <section className="salon-comandas container py-4">
      <header className="vista-encabezado d-flex flex-column flex-md-row align-items-start align-items-md-end justify-content-between gap-3 mb-4">
        <div>
          <p className="vista-ceja">OPERACIONES</p>
          <h1>Salón</h1>
          <p className="vista-descripcion">Distribución y disponibilidad de mesas</p>
        </div>
        <div className="acciones-reservas d-flex flex-wrap gap-2">
          <button className="btn btn-success" type="button" onClick={() => setFormReservaAbierto(!formReservaAbierto)} disabled={mesasLibres.length === 0}>
            {formReservaAbierto ? 'Cerrar formulario' : 'Nueva reserva'}
          </button>
          <button className="btn btn-outline-dark" type="button" onClick={() => setReservasVisibles(!reservasVisibles)}>
            {reservasVisibles ? 'Ocultar reservas' : `Ver reservas (${reservasLista.length})`}
          </button>
        </div>
      </header>

      {formReservaAbierto && (
        <form className="formulario-reserva mb-4" onSubmit={guardarReserva}>
          <h2 className="h5 mb-3">Nueva reserva</h2>
          <div className="row g-3">
            <fieldset className="col-12 border-0 p-0 m-0">
              <legend className="form-label">Mesas (puedes elegir varias)</legend>
              <div className="lista-mesas-reserva d-flex flex-wrap gap-2">
                {mesasLibres.map((mesa) => (
                  <label className="opcion-mesa-reserva" key={mesa.id}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="mesaIds"
                      value={mesa.id}
                      checked={mesasReservaIds.includes(String(mesa.id))}
                      onChange={(evento) => {
                        setMesasReservaIds((actuales) => evento.target.checked
                          ? [...actuales, evento.target.value]
                          : actuales.filter((id) => id !== evento.target.value));
                        setErrorReserva('');
                      }}
                    />
                    <span>Mesa {mesa.id} · hasta {mesa.capacidad} personas</span>
                  </label>
                ))}
              </div>
              {errorReserva && <p className="text-danger mt-2 mb-0" role="alert">{errorReserva}</p>}
            </fieldset>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="nombre-reserva">Nombre</label>
              <input className="form-control" id="nombre-reserva" name="cliente" required maxLength="60" />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="contacto-reserva">Contacto</label>
              <input className="form-control" id="contacto-reserva" name="contacto" type="tel" required maxLength="30" />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label" htmlFor="fecha-reserva">Fecha</label>
              <input className="form-control" id="fecha-reserva" name="fecha" type="date" required />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label" htmlFor="hora-reserva">Horario</label>
              <input className="form-control" id="hora-reserva" name="desde" type="time" required />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label" htmlFor="personas-reserva">Personas</label>
              <input className="form-control" id="personas-reserva" name="comensales" type="number" min="1" max={capacidadSeleccionada || 20} defaultValue="2" required />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label" htmlFor="motivo-reserva">Lugar / motivo</label>
              <select className="form-select" id="motivo-reserva" name="lugarMotivo" defaultValue="" required>
                <option value="" disabled>Seleccionar opción</option>
                <option value="Festejo de cumpleaños">Festejo de cumpleaños</option>
                <option value="Reunión">Reunión</option>
                <option value="Barra subsuelo">Barra subsuelo</option>
                <option value="Salón principal">Salón principal</option>
              </select>
            </div>
          </div>
          <button className="btn btn-dark mt-3" type="submit">Guardar reserva</button>
        </form>
      )}

      {reservasVisibles && (
        <section className="reservas-listado mb-4" aria-labelledby="titulo-reservas">
          <h2 className="h5 mb-3" id="titulo-reservas">Reservas activas</h2>
          {reservasActuales.length === 0 ? (
            <p className="mb-0">No hay reservas cargadas.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Hora</th>
                    <th scope="col">Mesa</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Contacto</th>
                    <th scope="col">Personas</th>
                    <th scope="col">Lugar / motivo</th>
                    <th scope="col"><span className="visually-hidden">Acciones</span></th>
                  </tr>
                </thead>
                <tbody>
                  {reservasLista.map((reserva) => (
                    <tr key={reserva.reservaId ?? reserva.id}>
                      <td>{reserva.fecha || '—'}</td>
                      <td>{reserva.desde || '—'}</td>
                      <td>{reserva.mesas.map((id) => `Mesa ${id}`).join(', ')}</td>
                      <td>{reserva.cliente || '—'}</td>
                      <td>{reserva.contacto || '—'}</td>
                      <td>{reserva.comensales || '—'}</td>
                      <td>{reserva.lugarMotivo || '—'}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => cancelarReserva(reserva.id)}>
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 py-3 my-3 border-top border-bottom">
        <div className="resumen-mesas d-flex flex-wrap gap-4" aria-label="Resumen de mesas">
          <span className="d-inline-flex align-items-center gap-2"><i className="punto-estado libre" /> Libres <strong>{resumenActual.Libre}</strong></span>
          <span className="d-inline-flex align-items-center gap-2"><i className="punto-estado ocupada" /> Ocupadas <strong>{resumenActual.Ocupada}</strong></span>
          <span className="d-inline-flex align-items-center gap-2"><i className="punto-estado reservada" /> Reservadas <strong>{resumenActual.Reservada}</strong></span>
        </div>

        <form className="agregar-mesa d-flex flex-nowrap align-items-end gap-2 mb-0" onSubmit={agregarMesa}>
          <div>
            <label className="form-label mb-1" htmlFor="capacidad-mesa">Capacidad de la nueva mesa</label>
            <input className="form-control" id="capacidad-mesa" type="number" min="1" max="20" value={capacidadNueva} onChange={(evento) => setCapacidadNueva(evento.target.value)} required />
          </div>
          <button className="btn btn-dark" type="submit">Agregar mesa</button>
        </form>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3">
        {mesasActuales.map((mesa) => (
          <TarjetaMesa key={mesa.id} mesa={mesa} onCancelarReserva={cancelarReserva} onQuitar={quitarMesa} />
        ))}
      </div>
    </section>
  );
}