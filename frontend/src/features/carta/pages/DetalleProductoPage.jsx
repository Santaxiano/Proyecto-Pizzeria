import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import DetalleProducto from '../components/DetalleProducto';
import { obtenerProductos, obtenerProductoPorId } from '../services/catalogoService';

function DetalleProductoPage() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [listaPizzas, setListaPizzas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    Promise.all([obtenerProductoPorId(id), obtenerProductos()])
      .then(([prod, todos]) => {
        setProducto(prod);
        setListaPizzas(todos.filter((p) => p.categoria === 'pizzas'));
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="container py-5 text-center">
        <h3>Producto no encontrado</h3>
        <p className="text-secondary">{error}</p>
        <Link to="/menu" className="btn btn-danger">
          Volver a la Carta
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <DetalleProducto
        key={producto.id}
        producto={producto}
        todasLasPizzas={listaPizzas}
      />
    </div>
  );
}

export default DetalleProductoPage;