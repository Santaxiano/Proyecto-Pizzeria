import { useState, useEffect } from 'react';
import { obtenerUsuariosAPI, actualizarUsuarioAPI, eliminarUsuarioAPI } from '../service/usuarioService.js';
import { useFetch } from '../../../shared/hooks/useFetch';

export function useUsuarios() {
  const { datos, cargando, error } = useFetch(obtenerUsuariosAPI);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    if (datos) {
      setUsuarios(datos);
    }
  }, [datos]);

  async function recargarUsuarios() {
    try {
      const datosFrescos = await obtenerUsuariosAPI();
      setUsuarios(datosFrescos);
    } catch (err) {
      console.error("Error al recargar usuarios:", err);
    }
  }

  async function editarUsuario(datosUsuario, id) {
    try {
      await actualizarUsuarioAPI(datosUsuario, id);
      await recargarUsuarios();
    } catch (err) {
      alert("No se pudo editar el usuario: " + err.message);
    }
  }

  async function eliminarUsuario(id) {
    try {
      await eliminarUsuarioAPI(id);
      await recargarUsuarios();
    } catch (err) {
      alert("No se pudo eliminar el usuario: " + err.message);
    }
  }

  return {
    usuarios,
    cargando,
    error,
    editarUsuario,
    eliminarUsuario
  };
}