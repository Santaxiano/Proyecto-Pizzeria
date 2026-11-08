import { Link, useOutletContext } from 'react-router';
import BarraCategorias from '../components/BarraCategorias';
import GrillaProductos from '../components/GrillaProductos';
import ResumenPedidoLateral from '../../carrito/components/ResumenPedidoLateral';
import { useFiltros } from '../hooks/useFiltros';
import { obtenerProductos } from '../services/catalogoService';
import { useFetch } from '../../../shared/hooks/useFetch'; 

function MenuPage() {
  const { datos: productosBackend, error, cargando } = useFetch(obtenerProductos);

  const productos = productosBackend || [];

  const contexto = useOutletContext() || {};
  const itemsCarrito = contexto.items || [];
  const subtotal = contexto.subtotal || 0;
  const cantidadTotal = contexto.cantidadTotal || 0;
  const cambiarCantidad = contexto.cambiarCantidad || (() => {});
  const quitarProducto = contexto.quitarProducto || (() => {});

  // Sin tasa de servicio: el total coincide con el que guarda el backend (el envío se suma en el checkout)
  const total = subtotal;

  const filtros = useFiltros(productos);

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status"></div>
        <p className="mt-2 text-secondary">Cargando nuestra carta...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger my-5 text-center" role="alert">
        {error.message || 'Error al cargar los productos'}
      </div>
    );
  }

  return (
    <>
      <section className="bg-dark text-white py-4 mb-2 text-center">
        <div className="container">
          <h1 className="display-5 fw-bold mb-1 texto-rojo-tomate">
            Nuestra Carta
          </h1>
        </div>
      </section>

      <BarraCategorias
        categorias={filtros.categorias}
        seleccionada={filtros.categoria}
        onSeleccionar={filtros.setCategoria}
      />

      <div className="container mb-5 espacio-inferior-menu">
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-md-6">
            <input
              type="search"
              className="form-control form-control-lg rounded-pill px-4 shadow-sm"
              placeholder="Buscar por nombre..." 
              value={filtros.busqueda}
              onChange={(e) => filtros.setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-8">
            {filtros.productosFiltrados.length > 0 ? (
              <GrillaProductos productos={filtros.productosFiltrados} />
            ) : (
              <div className="text-center py-5">
                <h4>No encontramos productos con ese nombre.</h4>
                <button className="btn btn-outline-danger mt-2" onClick={filtros.limpiarFiltros}>
                  Ver toda la carta
                </button>
              </div>
            )}
          </div>

          <div className="col-12 col-lg-4 d-none d-lg-block">
            <ResumenPedidoLateral
              items={itemsCarrito}
              onModificarCantidad={cambiarCantidad}
              onEliminar={quitarProducto}
            />
          </div>
        </div>
      </div>

      {itemsCarrito.length > 0 && (
        <div className="fixed-bottom p-3 d-flex justify-content-center contenedor-boton-flotante">
          <Link 
            to="/carrito" 
            className="btn w-100 fw-bold py-3 fs-5 d-flex justify-content-between align-items-center shadow-lg boton-flotante-pedido"
          >
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-white fs-6 rounded-pill shadow-sm texto-rojo-tomate">
                {cantidadTotal}
              </span>
              <span>Ver Pedido</span>
            </div>
            <span>${total.toLocaleString('es-AR')} ➔</span>
          </Link>
        </div>
      )}
    </>
  );
}

export default MenuPage;