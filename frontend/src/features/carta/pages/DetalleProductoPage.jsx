import { useParams, Link, useOutletContext } from 'react-router';
import DetalleProducto from '../components/DetalleProducto';
import { obtenerProductos } from '../services/catalogoService';
// Importamos el hook de la profe
import { useFetch } from '../../../shared/hooks/useFetch'; 

function DetalleProductoPage() {
  const { id } = useParams();
  
  // 1. Extraemos la función para agregar al carrito
  const contexto = useOutletContext() || {};
  const agregarProducto = contexto.agregarProducto || (() => console.warn('Falta conectar useCarrito al Outlet'));

  // 2. Usamos el hook para traer TODOS los productos de una sola vez
  const { datos: productosBackend, error, cargando } = useFetch(obtenerProductos);

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" role="status"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <h3>Error al cargar</h3>
        <p className="text-secondary">{error.message}</p>
        <Link to="/menu" className="btn btn-danger">
          Volver a la Carta
        </Link>
      </div>
    );
  }

  // 3. Calculamos la información necesaria a partir de los datos que trajo el hook
  const productos = productosBackend || [];
  const producto = productos.find((p) => p.id === Number(id));
  const listaPizzas = productos.filter((p) => p.categoria === 'pizzas');

  // Si el usuario pone un ID en la URL que no existe
  if (!producto) {
    return (
      <div className="container py-5 text-center">
        <h3>Producto no encontrado</h3>
        <p className="text-secondary">El producto que buscás no existe o fue retirado.</p>
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
        onAgregar={agregarProducto}
      />
    </div>
  );
}

export default DetalleProductoPage;