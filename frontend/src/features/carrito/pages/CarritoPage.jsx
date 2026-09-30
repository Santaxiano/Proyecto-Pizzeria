import { useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import ItemCarrito from '../components/ItemCarrito';
import ResumenCarrito from '../components/ResumenCarrito';
import FormularioPedido from '../components/FormularioPedido';
import { verificarDisponibilidadInmediata, estaEnZonaDeEnvio } from '../../../shared/utils/pedidosUtils';

function CarritoPage() {
  // 1. Lectura SEGURA del contexto (evita que la página explote)
  const contexto = useOutletContext() || {};
  const items = contexto.items || [];
  const cantidadTotal = contexto.cantidadTotal || 0;
  const subtotal = contexto.subtotal || 0;
  const cambiarCantidad = contexto.cambiarCantidad || (() => {});
  const quitarProducto = contexto.quitarProducto || (() => {});
  const vaciarCarrito = contexto.vaciarCarrito || (() => {});

  const sePuedeInmediato = verificarDisponibilidadInmediata();
  const [compraConfirmada, setCompraConfirmada] = useState(null);
  
  const [tipoEntrega, setTipoEntrega] = useState('delivery');
  const [modalidadHorario, setModalidadHorario] = useState(sePuedeInmediato ? 'inmediato' : 'programado');
  const [fechaProgramada, setFechaProgramada] = useState('');
  const [horaProgramada, setHoraProgramada] = useState('20:30');
  const [datosCliente, setDatosCliente] = useState({
    nombre: '',
    telefono: '',
    calleNumero: '',
    pisoDepto: '',
    indicaciones: '',
    formaPago: 'efectivo',
  });
  
  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosCliente((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: null }));
  };

  const handleSimularGeolocalizacion = () => {
    const latSimulada = -33.3000;
    const lngSimulada = -66.3360;

    if (!estaEnZonaDeEnvio(latSimulada, lngSimulada)) {
      setErrores((prev) => ({ 
        ...prev, 
        direccion: 'Lo sentimos, la dirección está fuera de nuestro radio de entrega (5 km).',
        direccionExito: null
      }));
    } else {
      setErrores((prev) => ({ 
        ...prev, 
        direccion: null,
        direccionExito: '¡Dirección dentro del radio de entrega confirmada!'
      }));
    }
  };

  function handleFinalizar(e) {
    e.preventDefault();
    const nuevosErrores = {};

    if (!datosCliente.nombre.trim()) nuevosErrores.nombre = 'Ingresá tu nombre y apellido.';
    if (!datosCliente.telefono.trim() || datosCliente.telefono.length < 8) {
      nuevosErrores.telefono = 'Ingresá un teléfono válido.';
    }
    if (tipoEntrega === 'delivery' && !datosCliente.calleNumero.trim()) {
      nuevosErrores.calleNumero = 'Ingresá la calle y número para el envío.';
    }
    if (modalidadHorario === 'programado' && !fechaProgramada) {
      nuevosErrores.fechaProgramada = 'Seleccioná una fecha.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    const pedidoFinal = {
      tipoEntrega,
      horario: modalidadHorario === 'inmediato' ? 'Lo antes posible' : `${fechaProgramada} a las ${horaProgramada} hs`,
      cliente: datosCliente,
    };

    vaciarCarrito();
    setCompraConfirmada(pedidoFinal);
  }

  if (compraConfirmada) {
    return (
      <div className="container py-5 text-center">
        <div className="display-4 text-success mb-3">✓</div>
        <h2 className="h4 fw-bold">¡Pedido tomado con éxito!</h2>
        <p className="text-secondary mt-2 mb-4">
          Hemos recibido el pedido de <strong>{compraConfirmada.cliente.nombre}</strong> para <strong>{compraConfirmada.horario}</strong>.
        </p>
        <Link to="/menu" className="btn btn-dark">
          Volver a la carta
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h2 className="h4 fw-bold mb-3">Tu pedido está vacío</h2>
        <p className="text-secondary mb-4">Agregá productos desde nuestra carta.</p>
        <Link to="/menu" className="btn btn-danger">
          Ir a la carta
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1 className="h3 fw-bold mb-4">Completá tu pedido</h1>
      <div className="row g-4">
        <div className="col-lg-8">
          
          <FormularioPedido 
            tipoEntrega={tipoEntrega}
            setTipoEntrega={setTipoEntrega}
            sePuedeInmediato={sePuedeInmediato}
            modalidadHorario={modalidadHorario}
            setModalidadHorario={setModalidadHorario}
            fechaProgramada={fechaProgramada}
            setFechaProgramada={setFechaProgramada}
            horaProgramada={horaProgramada}
            setHoraProgramada={setHoraProgramada}
            datosCliente={datosCliente}
            handleChange={handleChange}
            errores={errores}
            onSimularGeolocalizacion={handleSimularGeolocalizacion}
            onSubmit={handleFinalizar}
          />

          <h2 className="h5 fw-bold mt-4 mb-3">Productos seleccionados</h2>
          <ul className="list-group shadow-sm">
            {items.map((item) => (
              <ItemCarrito
                key={item.idVariante}
                item={item}
                onCambiarCantidad={cambiarCantidad}
                onQuitar={quitarProducto}
              />
            ))}
          </ul>

        </div>
        <div className="col-lg-4">
          <ResumenCarrito
            cantidadTotal={cantidadTotal}
            subtotal={subtotal}
            tipoEntrega={tipoEntrega}
            onVaciar={vaciarCarrito}
          />
        </div>
      </div>
    </div>
  );
}

export default CarritoPage;