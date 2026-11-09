import { useState, useMemo } from 'react';
import { fechaLocalHoy } from '../../../shared/utils/fecha';
import { obtenerProductos } from '../../carta/services/catalogoService';
import { useFetch } from '../../../shared/hooks/useFetch';

// Misma regla de envío que aplica el backend al crear el pedido
const ENVIO_GRATIS_DESDE = 15000;
const COSTO_ENVIO = 1500;
// Mismas reglas de precio por tamaño que la carta y el backend (pedidos.controller.js)
const MULTIPLICADOR_TAMANO = { '4 porciones': 0.6 };
const TAMANO_MITAD_Y_MITAD = '8 porciones';

export default function FormularioComanda({ onGuardar, onCancelar }) {
  const { datos: productosBackend, cargando: cargandoProductos } = useFetch(obtenerProductos);
  const productos = productosBackend || [];

  const [valores, setValores] = useState({
    cliente: '',
    telefono: '',
    tipo: 'delivery',
    direccionMesa: '',
    // Agregamos los campos para manejar la lógica de horarios
    modalidadHorario: 'inmediato',
    fechaProgramada: fechaLocalHoy(),
    horaProgramada: '' 
  });

  const [items, setItems] = useState([]);
  const [prodSeleccionado, setProdSeleccionado] = useState('');
  const [tamanoSeleccionado, setTamanoSeleccionado] = useState('');
  const [segundoSaborSeleccionado, setSegundoSaborSeleccionado] = useState('');
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);

  // --- LÓGICA DINÁMICA DE HORARIOS ---
  const horariosDisponibles = useMemo(() => {
    if (!valores.fechaProgramada) return [];
    
    const [anio, mes, dia] = valores.fechaProgramada.split('-');
    const fechaObj = new Date(anio, mes - 1, dia);
    const esDomingo = fechaObj.getDay() === 0;

    let horarios = [];
    
    // Rango Mediodía (Lunes a Sábado). 
    if (!esDomingo) {
      horarios.push('12:00', '12:30', '13:00', '13:30', '14:00', '14:30');
    }
    // Rango Noche (Todos los días). 
    horarios.push('19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30');

    const hoy = new Date();
    const esHoy = hoy.getFullYear() === fechaObj.getFullYear() &&
                  hoy.getMonth() === fechaObj.getMonth() &&
                  hoy.getDate() === fechaObj.getDate();

    if (esHoy) {
      const horaActual = hoy.getHours() * 60 + hoy.getMinutes();
      horarios = horarios.filter(h => {
        const [hh, mm] = h.split(':').map(Number);
        return (hh * 60 + mm) > (horaActual + 30); 
      });
    }

    return horarios;
  }, [valores.fechaProgramada]);

  // Si cambia la fecha y la hora guardada ya no es válida, la reseteamos
  if (valores.horaProgramada && !horariosDisponibles.includes(valores.horaProgramada)) {
    setValores(prev => ({ ...prev, horaProgramada: '' }));
  }
  // ------------------------------------

  const handleChange = (e) => {
    setValores({ ...valores, [e.target.name]: e.target.value });
  };

  // --- Tamaño y mitad y mitad (mismas reglas que la carta y el backend) ---
  const productoActual = productos.find(p => p.id === Number(prodSeleccionado));
  const tamanosProducto = productoActual?.tamanos ?? [];
  const puedeMitad = productoActual?.categoria === 'pizzas'
    && productoActual?.permitemitad
    && tamanoSeleccionado === TAMANO_MITAD_Y_MITAD;
  const opcionesSegundoSabor = productos.filter(p => (
    p.categoria === 'pizzas' && p.permitemitad && p.disponible && p.id !== productoActual?.id
  ));

  const elegirProducto = (id) => {
    setProdSeleccionado(id);
    setSegundoSaborSeleccionado('');
    const producto = productos.find(p => p.id === Number(id));
    const tamanos = producto?.tamanos ?? [];
    // Por defecto el tamaño más grande (en pizzas, 8 porciones)
    setTamanoSeleccionado(tamanos.length > 0 ? tamanos[tamanos.length - 1] : '');
  };

  const agregarProductoAlPedido = () => {
    if (!productoActual || !productoActual.disponible) return;
    if (tamanosProducto.length > 0 && !tamanoSeleccionado) return;

    const tamano = tamanosProducto.length > 0 ? tamanoSeleccionado : null;
    const segundo = puedeMitad && segundoSaborSeleccionado
      ? productos.find(p => p.id === Number(segundoSaborSeleccionado))
      : null;
    // Mitad y mitad: la mitad de cada pizza sumadas (misma regla que el backend)
    const multiplicador = MULTIPLICADOR_TAMANO[tamano] ?? 1;
    const precio = segundo
      ? Math.round((productoActual.precio * multiplicador) / 2 + (segundo.precio * multiplicador) / 2)
      : Math.round(productoActual.precio * multiplicador);
    const clave = `${productoActual.id}|${tamano}|${segundo?.id ?? ''}`;
    const nombre = `${productoActual.nombre}${segundo ? ` / ${segundo.nombre}` : ''}${tamano ? ` (${tamano})` : ''}`;

    const itemExistente = items.find(i => i.clave === clave);
    if (itemExistente) {
      setItems(items.map(i => i.clave === clave
        ? { ...i, cantidad: i.cantidad + cantidadSeleccionada, subtotal: i.precio * (i.cantidad + cantidadSeleccionada) }
        : i
      ));
    } else {
      setItems([...items, {
        clave,
        id: productoActual.id,
        nombre,
        tamano,
        segundoSaborId: segundo?.id ?? null,
        precio,
        cantidad: cantidadSeleccionada,
        subtotal: precio * cantidadSeleccionada,
      }]);
    }

    setProdSeleccionado('');
    setTamanoSeleccionado('');
    setSegundoSaborSeleccionado('');
    setCantidadSeleccionada(1);
  };

  const actualizarCantidad = (claveItem, modificador) => {
    setItems(items.map(item => {
      if (item.clave === claveItem) {
        const nuevaCantidad = item.cantidad + modificador;
        if (nuevaCantidad < 1) return item; 
        
        return { 
          ...item, 
          cantidad: nuevaCantidad, 
          subtotal: item.precio * nuevaCantidad 
        };
      }
      return item;
    }));
  };

  const eliminarItem = (claveAEliminar) => {
    setItems(items.filter(i => i.clave !== claveAEliminar));
  };

  const subtotalProductos = items.reduce((acc, item) => acc + item.subtotal, 0);
  const aplicaEnvio = valores.tipo === 'delivery';
  const costoEnvioActual = aplicaEnvio && subtotalProductos < ENVIO_GRATIS_DESDE ? COSTO_ENVIO : 0;
  const totalFinal = subtotalProductos + costoEnvioActual;
  const detalleGenerado = items.map(i => `${i.cantidad}x ${i.nombre}`).join(', ');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Debes agregar al menos un producto al pedido para poder guardarlo.");
      return;
    }

    if (valores.modalidadHorario === 'programado' && (!valores.fechaProgramada || !valores.horaProgramada)) {
      alert("Seleccioná la fecha y la hora programada.");
      return;
    }

    // Armamos el string de horario tal como espera el backend y el cliente
    const horarioFinal = valores.modalidadHorario === 'inmediato' 
      ? 'Lo antes posible' 
      : `${valores.fechaProgramada} a las ${valores.horaProgramada} hs`;

    // Pasamos el horarioFinal a onGuardar
    onGuardar({ ...valores, horario: horarioFinal, items });
  };

  return (
    <div className="card shadow-sm mb-4 border-0">
      <div className="card-header bg-dark text-white">
        <h3 className="h5 mb-0">Nuevo Pedido</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label fw-bold small text-muted">Tipo de Pedido</label>
              <select className="form-select border-dark" name="tipo" value={valores.tipo} onChange={handleChange}>
                <option value="delivery">Delivery / Envío</option>
                <option value="mesa">Pedido a la Mesa</option>
                <option value="retiro">Retiro en local</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold small text-muted">Nombre del Cliente</label>
              <input type="text" className="form-control" name="cliente" value={valores.cliente} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold small text-muted">Teléfono (WhatsApp)</label>
              <input type="tel" className="form-control" name="telefono" placeholder="Ej: 5492664..." value={valores.telefono} onChange={handleChange} required />
            </div>
            
            <div className="col-md-8">
              <label className="form-label fw-bold small text-muted">Dirección / N° Mesa</label>
              <input type="text" className="form-control" name="direccionMesa" value={valores.direccionMesa} onChange={handleChange} required={valores.tipo !== 'retiro'} />
            </div>

            {aplicaEnvio && (
              <div className="col-md-4">
                <label className="form-label fw-bold small text-danger">Costo Envío ($)</label>
                <input type="text" className="form-control bg-light border-danger" value={`$ ${costoEnvioActual}`} readOnly />
                <span className="small text-muted d-block mt-1">Gratis desde ${ENVIO_GRATIS_DESDE}</span>
              </div>
            )}
          </div>

          <hr className="text-muted" />

          {/* --- BLOQUE DE HORARIO --- */}
          <div className="mb-4 bg-light p-3 rounded border">
            <label className="form-label fw-bold small text-uppercase">Horario del Pedido</label>
            <div className="d-flex flex-column flex-md-row gap-3 mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="modalidadHorario"
                  id="gestorHorarioInmediato"
                  value="inmediato"
                  checked={valores.modalidadHorario === 'inmediato'}
                  onChange={handleChange}
                />
                <label className="form-check-label small fw-semibold" htmlFor="gestorHorarioInmediato">
                  Lo antes posible
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="modalidadHorario"
                  id="gestorHorarioProgramado"
                  value="programado"
                  checked={valores.modalidadHorario === 'programado'}
                  onChange={handleChange}
                />
                <label className="form-check-label small fw-semibold" htmlFor="gestorHorarioProgramado">
                  Programar horario / otro día
                </label>
              </div>
            </div>

            {valores.modalidadHorario === 'programado' && (
              <div className="row g-2">
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold mb-1">Fecha</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    name="fechaProgramada"
                    min={fechaLocalHoy()}
                    value={valores.fechaProgramada}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label small fw-semibold mb-1">Horario</label>
                  {horariosDisponibles.length > 0 ? (
                    <select
                      className="form-select form-select-sm"
                      name="horaProgramada"
                      value={valores.horaProgramada}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccioná...</option>
                      {horariosDisponibles.map((hora) => (
                        <option key={hora} value={hora}>{hora} hs</option>
                      ))}
                    </select>
                  ) : (
                    <select className="form-select form-select-sm" disabled>
                      <option>Sin horarios disponibles</option>
                    </select>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* ------------------------- */}

          <div className="row g-2 align-items-end mb-4 bg-light p-3 rounded border">
            <div className="col-12 mb-2">
              <label className="form-label fw-bold text-dark mb-0">Agregar Productos</label>
            </div>
            
            <div className="col-md-7">
              <select className="form-select" value={prodSeleccionado} onChange={(e) => elegirProducto(e.target.value)} disabled={cargandoProductos}>
                <option value="">{cargandoProductos ? 'Cargando menú...' : 'Seleccionar producto...'}</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id} disabled={!p.disponible}>
                    {p.nombre} - ${p.precio}{!p.disponible ? ' (sin stock)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {tamanosProducto.length > 0 && (
              <div className={puedeMitad ? 'col-md-4' : 'col-md-7'}>
                <select className="form-select" value={tamanoSeleccionado} onChange={(e) => { setTamanoSeleccionado(e.target.value); setSegundoSaborSeleccionado(''); }} aria-label="Tamaño">
                  {tamanosProducto.map(t => (
                    <option key={t} value={t}>
                      {t} - ${Math.round(productoActual.precio * (MULTIPLICADOR_TAMANO[t] ?? 1))}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {puedeMitad && (
              <div className="col-md-3">
                <select className="form-select" value={segundoSaborSeleccionado} onChange={(e) => setSegundoSaborSeleccionado(e.target.value)} aria-label="Segunda mitad">
                  <option value="">Entera (sin mitad)</option>
                  {opcionesSegundoSabor.map(p => (
                    <option key={p.id} value={p.id}>
                      Mitad: {p.nombre} - ${Math.round(productoActual.precio / 2 + p.precio / 2)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-md-2 col-4">
              <input type="number" className="form-control" min="1" value={cantidadSeleccionada} onChange={(e) => setCantidadSeleccionada(Number(e.target.value))} />
            </div>
            <div className="col-md-3 col-8">
              <button type="button" className="btn btn-outline-danger w-100 fw-bold" onClick={agregarProductoAlPedido} disabled={!prodSeleccionado}>
                + Añadir
              </button>
            </div>

            {items.length > 0 && (
              <div className="col-12 mt-3">
                <table className="table table-sm bg-white mb-0 border">
                  <thead>
                    <tr className="table-secondary">
                      <th>Producto</th>
                      <th className="text-end">Subtotal</th>
                      <th style={{ width: '110px' }} className="text-center">Cant.</th>
                      <th className="text-center" style={{ width: '60px' }}>Quitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.clave} className="align-middle">
                        <td className="fw-semibold">{item.nombre}</td>
                        <td className="text-end text-muted">${item.subtotal}</td>
                        <td>
                          <div className="d-flex align-items-center justify-content-between border rounded px-1 bg-light">
                            <button 
                              type="button" 
                              className="btn btn-sm btn-link text-dark text-decoration-none px-2 py-0" 
                              onClick={() => actualizarCantidad(item.clave, -1)}
                              disabled={item.cantidad <= 1}
                            >
                              -
                            </button>
                            <span className="fw-bold">{item.cantidad}</span>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-link text-dark text-decoration-none px-2 py-0" 
                              onClick={() => actualizarCantidad(item.clave, 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-center">
                          <button type="button" className="btn btn-sm btn-outline-danger border-0" onClick={() => eliminarItem(item.clave)}>
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label fw-bold text-secondary">Detalle (Generado automáticamente)</label>
              <textarea className="form-control bg-light text-muted" rows="2" value={detalleGenerado} readOnly placeholder="Los productos aparecerán acá..." />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-bold text-success">Total a Cobrar ($)</label>
              <input type="text" className="form-control bg-light fw-bold text-success fs-5" value={`$ ${totalFinal}`} readOnly />
              {aplicaEnvio && <span className="small text-muted d-block mt-1">Incluye ${costoEnvioActual} de envío</span>}
            </div>
          </div>

          <div className="mt-4 d-flex justify-content-end gap-2 border-top pt-3">
            <button type="button" className="btn btn-outline-secondary fw-bold" onClick={onCancelar}>Cancelar</button>
            <button type="submit" className="btn btn-success fw-bold">Guardar Pedido</button>
          </div>
        </form>
      </div>
    </div>
  );
}