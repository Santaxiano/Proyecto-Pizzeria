import { useState, useEffect } from 'react';
import { obtenerComandas } from '../services/comandasService';
import { useFetch } from '../../../shared/hooks/useFetch';

export function useComandas() {
  const { datos, cargando, error } = useFetch(obtenerComandas);
  
  const [comandas, setComandas] = useState(() => {
    const guardadas = localStorage.getItem('gestor-pedidos');
    return guardadas ? JSON.parse(guardadas) : [];
  });

  useEffect(() => {
    if (datos && !localStorage.getItem('gestor-pedidos')) {
      setComandas(datos);
    }
  }, [datos]);

  useEffect(() => {
    localStorage.setItem('gestor-pedidos', JSON.stringify(comandas));
  }, [comandas]);

  const agregarComanda = (nuevoPedido) => {
    const comandaConId = { 
      ...nuevoPedido, 
      id: `cmd-${Date.now()}`,
      estado: 'Pendiente'
    };
    setComandas([comandaConId, ...comandas]);
  };

  const modificarComanda = (id, datosActualizados) => {
    setComandas((actuales) =>
      actuales.map((c) => (c.id === id ? { ...c, ...datosActualizados } : c))
    );
  };

  // 👇 Ahora elimina directamente sin el window.confirm nativo
  const eliminarComanda = (id) => {
    setComandas((actuales) => actuales.filter((c) => c.id !== id));
  };

  const cambiarEstado = (id, nuevoEstado) => {
    setComandas((actuales) =>
      actuales.map((c) => (c.id === id ? { ...c, estado: nuevoEstado } : c))
    );
  };

  return { comandas, cargando, error, agregarComanda, modificarComanda, eliminarComanda, cambiarEstado };
}