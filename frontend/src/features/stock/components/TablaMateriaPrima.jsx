export default function TablaMateriaPrima({ ingredientes, onToggle, onEditar, onEliminar }) {
  return (
    <div className="table-responsive shadow-sm bg-white rounded">
      <table className="table table-striped table-hover align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th scope="col" className="px-3">#</th>
            <th scope="col">Ingrediente / Insumo</th>
            <th scope="col">Estado en Cocina</th>
            <th scope="col" className="text-end px-3">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {ingredientes.map((ing) => (
            <tr key={ing.id}>
              <th scope="row" className="px-3">{ing.id}</th>
              
              <td className="fw-semibold">{ing.nombre}</td>

              <td>
                {ing.activo ? (
                  <span className="badge bg-success">Hay Stock</span>
                ) : (
                  <span className="badge bg-danger">Sin Stock</span>
                )}
              </td>

              <td className="text-end px-3">
                <div className="d-flex gap-2 justify-content-end align-items-center">
                  <button
                    className={`btn btn-sm ${ing.activo ? 'btn-outline-danger' : 'btn-dark'}`}
                    onClick={() => onToggle(ing.id)}
                  >
                    {ing.activo ? 'Sin Stock' : 'Reponer'}
                  </button>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => onEditar(ing)} title="Editar">
                    ✏️
                  </button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(ing.id)} title="Eliminar">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}