export default function TablaProductos({ productos, onToggle }) {
  return (
    <div className="table-responsive shadow-sm bg-white rounded">
      <table className="table table-striped table-hover align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th scope="col" className="px-3">#</th>
            <th scope="col">Producto</th>
            <th scope="col">Categoría</th>
            <th scope="col">Estado en Menú</th>
            <th scope="col" className="text-end px-3">Acción</th>
          </tr>
        </thead>

        <tbody>
          {productos.map((prod) => (
            <tr key={prod.id}>
              <th scope="row" className="px-3">{prod.id}</th>

              <td>
                <div className="fw-bold">{prod.nombre}</div>
                <small className="text-muted d-block text-truncate" style={{ maxWidth: '300px' }}>
                  {prod.descripcion}
                </small>
              </td>

              <td>
                <span
                  className={`badge ${prod.categoria === 'pizzas'
                      ? 'bg-danger'
                      : prod.categoria === 'bebidas'
                        ? 'bg-info text-dark'
                        : 'bg-secondary'
                    }`}
                >
                  {prod.categoria}
                </span>
              </td>

              <td>
                {prod.disponible ? (
                  <span className="badge bg-success">Disponible</span>
                ) : (
                  <span className="badge bg-danger">Pausado</span>
                )}
              </td>

              <td className="text-end px-3">
                <button
                  className={`btn btn-sm ${prod.disponible ? 'btn-outline-danger' : 'btn-dark'
                    }`}
                  onClick={() => onToggle(prod.id)}
                >
                  {prod.disponible ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
