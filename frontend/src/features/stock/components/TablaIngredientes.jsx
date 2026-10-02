// TablaIngredientes.jsx — Componente presentacional (solo renderizado, sin lógica)
// Recibe los datos y las acciones como props; no sabe de dónde vienen.

// Props esperadas:
//   productos  → arreglo de objetos con { id, nombre, descripcion, categoria, disponible }
//   onToggle   → función que recibe un id y cambia el estado disponible del producto

export default function TablaIngredientes({ productos, onToggle }) {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle">
        {/* Encabezado de la tabla */}
        <thead className="table-dark">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Nombre</th>
            <th scope="col">Descripción</th>
            <th scope="col">Categoría</th>
            <th scope="col">Estado</th>
            <th scope="col">Acción</th>
          </tr>
        </thead>

        <tbody>
          {/* .map() itera el arreglo y genera una fila por cada producto */}
          {productos.map((producto) => (
            <tr key={producto.id}>
              <th scope="row">{producto.id}</th>
              <td>{producto.nombre}</td>
              <td>{producto.descripcion}</td>

              {/* Categoría con badge de Bootstrap para diferenciación visual */}
              <td>
                <span
                  className={`badge ${producto.categoria === 'ingrediente'
                      ? 'bg-secondary'
                      : producto.categoria === 'bebida'
                        ? 'bg-info text-dark'
                        : 'bg-warning text-dark'
                    }`}
                >
                  {producto.categoria}
                </span>
              </td>

              {/* Indicador visual del estado actual del producto */}
              <td>
                {producto.disponible ? (
                  <span className="badge bg-success">Disponible</span>
                ) : (
                  <span className="badge bg-danger">No disponible</span>
                )}
              </td>

              {/* Botón de acción: su texto y estilo cambian según el estado.
                  Al hacer clic llama a onToggle con el id del producto,
                  delegando la lógica al hook padre (StockPage → useStock). */}
              <td>
                <button
                  className={`btn btn-sm ${producto.disponible ? 'btn-danger' : 'btn-dark'
                    }`}
                  onClick={() => onToggle(producto.id)}
                >
                  {producto.disponible ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
