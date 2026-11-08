export default function TablaUsuarios({ usuarios, onEditar, onEliminar, usuarioLogueado }) {
  return (
    <div className="table-responsive shadow-sm bg-white rounded">
      <table className="table table-striped table-hover align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th scope="col" className="px-3">#</th>
            <th scope="col">Nombre</th>
            <th scope="col">Email</th>
            <th scope="col">Rol</th>
            <th scope="col" className="text-end px-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((user) => {
            // Comparamos si el usuario de esta fila es el que está usando el sistema
            const esMismoUsuario = usuarioLogueado && 
              (user.id === usuarioLogueado.id || user.email === usuarioLogueado.email);

            return (
              <tr key={user.id}>
                <th scope="row" className="px-3">{user.id}</th>
                <td className="fw-bold">{user.nombre}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.rol === 'administrador' ? 'bg-danger' : 'bg-primary'}`}>
                    {user.rol}
                  </span>
                </td>
                <td className="text-end px-3">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEditar(user)} title="Editar">
                    ✏️
                  </button>
                  {/* Ocultamos el botón de eliminar si es el usuario actual */}
                  {!esMismoUsuario && (
                    <button className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(user.id)} title="Eliminar">
                      🗑️
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {usuarios.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center py-4 text-muted">No hay usuarios registrados.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}