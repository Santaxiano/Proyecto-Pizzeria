import { useState, useEffect } from 'react';
import { useUsuarios } from '../hooks/useUsuarios.js';
import TablaUsuarios from '../components/TablaUsuarios.jsx';
import ModalFormularioUsuario from '../components/ModalFormularioUsuario.jsx';
import ModalConfirmacion from '../../../shared/components/ModalConfirmacion.jsx'; 
import { obtenerSesion } from '../../login/service/inicioservice.js';

export default function UsuariosPage() {
  const { usuarios, cargando, error, editarUsuario, eliminarUsuario } = useUsuarios();
  const [modalEditAbierto, setModalEditAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [alertaEliminar, setAlertaEliminar] = useState(null);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  useEffect(() => {
    setUsuarioLogueado(obtenerSesion());
  }, []);

  if (cargando) return <div className="text-center py-5"><div className="spinner-border text-danger" /></div>;
  if (error) return <div className="alert alert-danger m-4 text-center">{error.message}</div>;

  const abrirEdicion = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalEditAbierto(true);
  };

  const confirmarEliminacion = (id) => {
    eliminarUsuario(id);
    setAlertaEliminar(null);
  };

  return (
    <div className="container py-4">
      <header className="mb-4 border-bottom pb-3">
        <h1 className="h3 fw-bold text-dark">Gestión de Personal</h1>
        <p className="text-muted mb-0">Administrá los roles y accesos al sistema.</p>
      </header>

      {modalEditAbierto && (
        <ModalFormularioUsuario 
          usuarioAEditar={usuarioSeleccionado}
          onGuardar={(valores) => {
            editarUsuario(valores, usuarioSeleccionado.id);
            setModalEditAbierto(false);
          }}
          onCancelar={() => setModalEditAbierto(false)}
        />
      )}

      {alertaEliminar && (
        <ModalConfirmacion
          titulo="¿Eliminar usuario?"
          mensaje="Esta acción quitará el acceso de esta persona al sistema de forma permanente."
          onCancelar={() => setAlertaEliminar(null)}
          onConfirmar={() => confirmarEliminacion(alertaEliminar)}
        />
      )}

      <TablaUsuarios 
        usuarios={usuarios} 
        onEditar={abrirEdicion}
        onEliminar={(id) => setAlertaEliminar(id)}
        usuarioLogueado={usuarioLogueado}
      />
    </div>
  );
}