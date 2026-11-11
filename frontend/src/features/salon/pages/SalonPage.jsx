import { useState } from 'react';
import { useSalon } from '../hooks/useSalon';
import TarjetaMesa from '../components/TarjetaMesa';
import FormularioReserva from '../components/FormularioReserva';
import AgendaReservas from '../components/AgendaReservas';
import ModalConfirmacion from '../components/ModalConfirmacion';

export default function SalonPage() {
  const { 
    mesas, reservas, cargando, error, 
    agregarMesa, quitarMesa, ocuparMesa, liberarMesa, 
    agregarReserva, editarReserva, eliminarReserva, asignarReservaAMesa
  } = useSalon();
  // Reserva que se está editando; null = el formulario crea una nueva
  const [reservaEditando, setReservaEditando] = useState(null);

  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const [fechaFiltro, setFechaFiltro] = useState(hoyStr);
  
  const [capacidadNueva, setCapacidadNueva] = useState(4);
  const [formReservaAbierto, setFormReservaAbierto] = useState(false);
  const [alertaAccion, setAlertaAccion] = useState(null); 
  const [errorAccion, setErrorAccion] = useState('');
  const [procesandoAccion, setProcesandoAccion] = useState(false);
  const [errorMesas, setErrorMesas] = useState('');
  const [mesaEnProceso, setMesaEnProceso] = useState(null);
  const [creandoMesa, setCreandoMesa] = useState(false);

  // El mismo formulario crea o edita. Si falla, el error lo muestra el formulario.
  const handleReservaConfirmada = async (datosReserva) => {
    if (reservaEditando) {
      await editarReserva(reservaEditando, datosReserva);
    } else {
      await agregarReserva(datosReserva);
    }
    cerrarFormularioReserva();
  };

  const cerrarFormularioReserva = () => {
    setFormReservaAbierto(false);
    setReservaEditando(null);
  };

  const abrirEdicionReserva = (reserva) => {
    setReservaEditando(reserva);
    setFormReservaAbierto(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmarAccion = async () => {
    setProcesandoAccion(true);
    setErrorAccion('');
    try {
      if (alertaAccion.tipo === 'mesa') {
        await quitarMesa(alertaAccion.id);
      } else {
        await eliminarReserva(alertaAccion.id);
      }
      setAlertaAccion(null);
    } catch (error) {
      setErrorAccion(error.message || 'No se pudo completar la acción.');
    } finally {
      setProcesandoAccion(false);
    }
  };

  const ejecutarAccionMesa = async (accion, id) => {
    setMesaEnProceso(id);
    setErrorMesas('');
    try {
      await accion(id);
    } catch (error) {
      setErrorMesas(error.message || 'No se pudo actualizar la mesa.');
    } finally {
      setMesaEnProceso(null);
    }
  };

  const handleAgregarMesa = async (event) => {
    event.preventDefault();
    setCreandoMesa(true);
    setErrorMesas('');
    try {
      await agregarMesa(capacidadNueva);
    } catch (error) {
      setErrorMesas(error.message || 'No se pudo crear la mesa.');
    } finally {
      setCreandoMesa(false);
    }
  };

  if (cargando) return <div className="text-center py-5"><div className="spinner-border text-success" /></div>;
  if (error) return <div className="alert alert-danger m-4 text-center">{error.message}</div>;

  const mesasLibres = mesas.filter(m => m.estado === 'Libre');
  const reservasDelDia = reservas.filter(r => (r.fecha) === fechaFiltro);
  const fechasProximas = [...new Set(
    reservas
      .map((reserva) => reserva.fecha)
      .filter((fecha) => fecha >= hoyStr)
  )].sort();

  return (
    <div className="container-fluid py-4 px-xl-5">
      
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 border-bottom pb-3">
        <div>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--color-negro)' }}>Gestión de Salón</h1>
          <p className="text-muted mb-0">Controlá las mesas y asigná las reservas del día.</p>
        </div>
        <button
          className="btn btn-dark fw-bold mt-3 mt-md-0"
          onClick={() => (formReservaAbierto ? cerrarFormularioReserva() : setFormReservaAbierto(true))}
        >
          {formReservaAbierto ? 'Cerrar formulario' : '+ Nueva Reserva'}
        </button>
      </header>

      {/* FORMULARIO DE RESERVA */}
      {formReservaAbierto && (
        <div className="card p-4 shadow-sm mb-4 border-dark bg-white mx-auto" style={{ maxWidth: '650px' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="m-0 fw-bold">
              {reservaEditando ? `Editar reserva de ${reservaEditando.cliente}` : 'Crear Nueva Reserva'}
            </h5>
            <button type="button" className="btn-close" onClick={cerrarFormularioReserva}></button>
          </div>
          <FormularioReserva
            // key: al pasar de una reserva a otra el formulario arranca con los datos nuevos
            key={reservaEditando?.id ?? 'nueva'}
            reservaInicial={reservaEditando}
            onReservaConfirmada={handleReservaConfirmada}
          />
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {alertaAccion && (
        <ModalConfirmacion 
          titulo={alertaAccion.titulo}
          mensaje={alertaAccion.mensaje}
          error={errorAccion}
          procesando={procesandoAccion}
          onCancelar={() => {
            setErrorAccion('');
            setAlertaAccion(null);
          }}
          onConfirmar={confirmarAccion}
        />
      )}

      <div className="row g-4">
        
        {/* PLANO DE MESAS */}
        <div className="col-12 col-lg-8">
          {errorMesas && <div className="alert alert-danger" role="alert">{errorMesas}</div>}
          <div className="d-flex justify-content-between align-items-center mb-3 bg-light p-2 rounded border">
            <div className="d-flex gap-3">
              <span className="badge bg-success fs-6">Libres: {mesasLibres.length}</span>
              <span className="badge bg-danger fs-6">Ocupadas: {mesas.filter(m=>m.estado==='Ocupada').length}</span>
              <span className="badge bg-secondary fs-6">Reservadas: {mesas.filter(m=>m.estado==='Reservada').length}</span>
            </div>
            <form className="d-flex align-items-center gap-2 m-0" onSubmit={handleAgregarMesa}>
              <input className="form-control form-control-sm" type="number" style={{width: '70px'}} min="1" value={capacidadNueva} onChange={(e) => setCapacidadNueva(e.target.value)} required />
              <button className="btn btn-outline-dark btn-sm fw-bold" type="submit" disabled={creandoMesa}>
                {creandoMesa ? 'Guardando...' : '+ Agregar Mesa'}
              </button>
            </form>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
            {mesas.map((mesa) => (
              <TarjetaMesa 
                key={mesa.id} 
                mesa={mesa} 
                procesando={mesaEnProceso === mesa.id}
                onOcupar={(id) => ejecutarAccionMesa(ocuparMesa, id)}
                onLiberar={(id) => ejecutarAccionMesa(liberarMesa, id)}
                onQuitar={() => {
                  setErrorMesas('');
                  setErrorAccion('');
                  setAlertaAccion({
                    tipo: 'mesa',
                    id: mesa.id,
                    titulo: `¿Eliminar Mesa ${mesa.id}?`,
                    mensaje: 'Esta acción quitará la mesa del plano físico de forma permanente.'
                  });
                }}
              />
            ))}
          </div>
        </div>

        {/* AGENDA LATERAL AISLADA EN COMPONENTE */}
        <div className="col-12 col-lg-4">
          <AgendaReservas 
            reservasDelDia={reservasDelDia}
            reservas={reservas}
            fechasProximas={fechasProximas}
            mesas={mesas}
            fechaFiltro={fechaFiltro}
            setFechaFiltro={setFechaFiltro}
            onAsignarReserva={asignarReservaAMesa}
            onEditarReserva={abrirEdicionReserva}
            onCancelarReserva={(idReserva, nombreCliente) => {
              setErrorAccion('');
              setAlertaAccion({
                tipo: 'reserva',
                id: idReserva,
                titulo: `¿Cancelar reserva de ${nombreCliente}?`,
                mensaje: 'Se eliminará la reserva de la agenda y se liberarán las mesas asociadas.'
              });
            }}
          />
        </div>

      </div>
    </div>
  );
}