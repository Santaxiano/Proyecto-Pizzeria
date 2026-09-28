import { useState, useEffect } from 'react';
import BarraCategorias from '../components/BarraCategorias';
import GrillaProductos from '../components/GrillaProductos';
import { useFiltros } from '../hooks/useFiltros';
import { obtenerProductos } from '../services/catalogoService';

function MenuPage() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerProductos()
      .then((datos) => setProductos(datos))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

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
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Encabezado */}
      <section className="bg-dark text-white py-4 mb-2 text-center">
        <div className="container">
          <h1 className="display-5 fw-bold mb-1" style={{ color: 'var(--color-rojo-tomate)' }}>
            Nuestra Carta
          </h1>
        </div>
      </section>

      {/* Barra de navegación de categorías fija */}
      <BarraCategorias
        categorias={filtros.categorias}
        seleccionada={filtros.categoria}
        onSeleccionar={filtros.setCategoria}
      />

      <div className="container mb-5">
        {/* Buscador */}
        <div className="row justify-content-center mb-4">
          <div className="col-12 col-md-6">
            <input
              type="search"
              className="form-control form-control-lg rounded-pill px-4 shadow-sm"
              placeholder="Buscar por nombre o ingrediente..."
              value={filtros.busqueda}
              onChange={(e) => filtros.setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Grilla de productos filtrados */}
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
    </>
  );
}

export default MenuPage;