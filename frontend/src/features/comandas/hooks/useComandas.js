import { useState, useEffect } from 'react';
import {
  obtenerComandas,
  crearComanda,
  cambiarEstadoComanda,
  eliminarComanda as eliminarComandaAPI,
} from '../services/comandasService';
import { useFetch } from '../../../shared/hooks/useFetch';

// Las comandas viven en la base (tabla pedidos): cada acción llama al backend
// y después recarga la lista, así todos ven lo mismo.
export function useComandas() {
  const { datos, cargando, error } = useFetch(obtenerComandas);
  const [comandas, setComandas] = useState([]);

  useEffect(() => {
    if (datos) setComandas(datos);
  }, [datos]);

  async function recargar() {
    try {
      setComandas(await obtenerComandas());
    } catch (err) {
      console.error('Error al recargar las comandas:', err);
    }
  }

  // Devuelve true si se guardó, para que la pantalla cierre el formulario solo en ese caso.
  const agregarComanda = async (nuevoPedido) => {
    try {
      await crearComanda(nuevoPedido);
      await recargar();
      return true;
    } catch (err) {
      alert('No se pudo guardar el pedido: ' + err.message);
      return false;
    }
  };

  const eliminarComanda = async (id) => {
    try {
      await eliminarComandaAPI(id);
      await recargar();
    } catch (err) {
      alert('No se pudo eliminar el pedido: ' + err.message);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await cambiarEstadoComanda(id, nuevoEstado);
      await recargar();
    } catch (err) {
      alert('No se pudo cambiar el estado: ' + err.message);
    }
  };

  return { comandas, cargando, error, agregarComanda, eliminarComanda, cambiarEstado };
}
