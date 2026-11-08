export default function TablaProductos({ productos, onToggle, onEditar, onEliminar }) {
  return (
    <div className="table-responsive shadow-sm bg-white rounded">
      <table className="table table-striped table-hover align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th scope="col" className="px-3">#</th>
            <th scope="col">Producto</th>
            <th scope="col">Categoría</th>
            <th scope="col">Estado en Menú</th>
            <th scope="col" className="text-end px-3">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {productos.map((prod) => {
            // Efecto dominó: ingredientes inactivos que dejan al producto pausado
            const faltantes = (prod.ingredientes || []).filter((ing) => !ing.activo);

            return (
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
                {faltantes.length > 0 && (
                  <small className="text-danger d-block mt-1">
                    Falta: {faltantes.map((ing) => ing.nombre).join(', ')}
                  </small>
                )}
              </td>

              <td className="text-end px-3">
                <div className="d-flex gap-2 justify-content-end align-items-center">
                  <button
                    className={`btn btn-sm ${prod.disponible ? 'btn-outline-danger' : 'btn-dark'}`}
                    onClick={() => onToggle(prod.id)}
                  >
                    {prod.disponible ? 'Desactivar' : 'Activar'}
                  </button>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => onEditar(prod)} title="Editar">
                    ✏️
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(prod.id)} title="Eliminar">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}