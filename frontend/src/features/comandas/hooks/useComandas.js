import { useState, useEffect } from 'react';
import {
  obtenerComandas,
  crearComanda,
  cambiarEstadoComanda,
  eliminarComanda as eliminarComandaAPI,
} from '../services/comandasService';
import { useFetch } from '../../../shared/hooks/useFetch';

const INTERVALO_REFRESCO_MS = 30_000;

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

  // Los pedidos que hacen los clientes desde la web aparecen solos, sin recargar la página
  useEffect(() => {
    const intervalo = setInterval(() => {
      obtenerComandas().then(setComandas).catch(() => {}); // si falla, se reintenta en el próximo ciclo
    }, INTERVALO_REFRESCO_MS);
    return () => clearInterval(intervalo);
  }, []);

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
