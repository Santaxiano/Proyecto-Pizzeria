import { useState, useEffect } from 'react';
import { obtenerProductos } from '../../carta/services/catalogoService';
import { useFetch } from '../../../shared/hooks/useFetch';

export default function FormularioComanda({ comandaAEditar, onGuardar, onCancelar }) {
  const { datos: productosBackend, cargando: cargandoProductos } = useFetch(obtenerProductos);
  const productos = productosBackend || [];

  const [valores, setValores] = useState({
    cliente: '',
    telefono: '',
    tipo: 'delivery',
    direccionMesa: '',
    costoEnvio: 1500
  });

  const [items, setItems] = useState([]);
  const [prodSeleccionado, setProdSeleccionado] = useState('');
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);

  useEffect(() => {
    if (comandaAEditar) {
      setValores({
        cliente: comandaAEditar.cliente,
        telefono: comandaAEditar.telefono,
        tipo: comandaAEditar.tipo,
        direccionMesa: comandaAEditar.direccionMesa,
        costoEnvio: comandaAEditar.costoEnvio || 1500
      });
      if (comandaAEditar.items) {
        setItems(comandaAEditar.items);
      }
    }
  }, [comandaAEditar]);

  const handleChange = (e) => {
    setValores({ ...valores, [e.target.name]: e.target.value });
  };

  const agregarProductoAlPedido = () => {
    if (!prodSeleccionado) return;
    const producto = productos.find(p => p.id === Number(prodSeleccionado));
    if (!producto) return;

    const subtotal = producto.precio * cantidadSeleccionada;
    
    const itemExistente = items.find(i => i.id === producto.id);
    if (itemExistente) {
      setItems(items.map(i => i.id === producto.id 
        ? { ...i, cantidad: i.cantidad + cantidadSeleccionada, subtotal: i.subtotal + subtotal } 
        : i
      ));
    } else {
      setItems([...items, { 
        id: producto.id, 
        nombre: producto.nombre, 
        precio: producto.precio, 
        cantidad: cantidadSeleccionada, 
        subtotal 
      }]);
    }

    setProdSeleccionado('');
    setCantidadSeleccionada(1);
  };

  const actualizarCantidad = (idItem, modificador) => {
    setItems(items.map(item => {
      if (item.id === idItem) {
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

  const eliminarItem = (idAEliminar) => {
    setItems(items.filter(i => i.id !== idAEliminar));
  };

  const subtotalProductos = items.reduce((acc, item) => acc + item.subtotal, 0);
  const aplicaEnvio = valores.tipo === 'delivery';
  const costoEnvioActual = aplicaEnvio ? Number(valores.costoEnvio) : 0;
  const totalFinal = subtotalProductos + costoEnvioActual;
  const detalleGenerado = items.map(i => `${i.cantidad}x ${i.nombre}`).join(', ');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Debes agregar al menos un producto al pedido para poder guardarlo.");
      return;
    }

    onGuardar({
      ...valores,
      items,
      detalle: detalleGenerado,
      total: totalFinal
    });
  };

  return (
    <div className="card shadow-sm mb-4 border-0">
      <div className="card-header bg-dark text-white">
        <h3 className="h5 mb-0">{comandaAEditar ? 'Editar Pedido' : 'Nuevo Pedido'}</h3>
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
              <input type="text" className="form-control" name="direccionMesa" value={valores.direccionMesa} onChange={handleChange} required />
            </div>

            {aplicaEnvio && (
              <div className="col-md-4">
                <label className="form-label fw-bold small text-danger">Costo Envío ($)</label>
                <input type="number" className="form-control border-danger" name="costoEnvio" value={valores.costoEnvio} onChange={handleChange} min="0" required />
              </div>
            )}
          </div>

          <hr className="text-muted" />

          <div className="row g-2 align-items-end mb-4 bg-light p-3 rounded border">
            <div className="col-12 mb-2">
              <label className="form-label fw-bold text-dark mb-0">Agregar Productos</label>
            </div>
            
            <div className="col-md-7">
              <select className="form-select" value={prodSeleccionado} onChange={(e) => setProdSeleccionado(e.target.value)} disabled={cargandoProductos}>
                <option value="">{cargandoProductos ? 'Cargando menú...' : 'Seleccionar producto...'}</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} - ${p.precio}</option>
                ))}
              </select>
            </div>
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
                      <tr key={item.id} className="align-middle">
                       
                        <td className="fw-semibold">{item.nombre}</td>
                        <td className="text-end text-muted">${item.subtotal}</td>
                        <td>
                          <div className="d-flex align-items-center justify-content-between border rounded px-1 bg-light">
                            <button 
                              type="button" 
                              className="btn btn-sm btn-link text-dark text-decoration-none px-2 py-0" 
                              onClick={() => actualizarCantidad(item.id, -1)}
                              disabled={item.cantidad <= 1}
                            >
                              -
                            </button>
                            <span className="fw-bold">{item.cantidad}</span>
                            <button 
                              type="button" 
                              className="btn btn-sm btn-link text-dark text-decoration-none px-2 py-0" 
                              onClick={() => actualizarCantidad(item.id, 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-center">
                          <button type="button" className="btn btn-sm btn-outline-danger border-0" onClick={() => eliminarItem(item.id)}>
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