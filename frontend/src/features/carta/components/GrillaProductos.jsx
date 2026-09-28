import TarjetaProducto from './TarjetaProducto';

function GrillaProductos({ productos }) {
  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
      {productos.map((producto) => (
        <div className="col" key={producto.id}>
          <TarjetaProducto producto={producto} />
        </div>
      ))}
    </div>
  );
}

export default GrillaProductos;