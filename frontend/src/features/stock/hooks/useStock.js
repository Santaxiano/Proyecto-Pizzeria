import { useState, useEffect } from 'react';
import { obtenerDatosCompletos, guardarProductoAPI, eliminarProductoAPI } from '../services/ingredienteService';
import { useFetch } from '../../../shared/hooks/useFetch'; 

export function useStock() {
  const { datos, cargando, error } = useFetch(obtenerDatosCompletos);

  const [productos, setProductos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [relaciones, setRelaciones] = useState([]);

  useEffect(() => {
    if (datos) {
      setProductos(datos.productos);
      setIngredientes(datos.ingredientes);
      setRelaciones(datos.relaciones);
    }
  }, [datos]);

  async function actualizarTabla() {
    try {
      const datosFrescos = await obtenerDatosCompletos();
      setProductos(datosFrescos.productos);
    } catch (err) {
      console.error("Error al actualizar la tabla:", err);
    }
  }

  async function guardarProducto(datosProd, idEditar = null) {
    try {
      await guardarProductoAPI(datosProd, idEditar);
      await actualizarTabla(); 
    } catch (err) {
      alert("No se pudo guardar el producto: " + err.message);
    }
  }

  async function eliminarProducto(id) {
    try {
      await eliminarProductoAPI(id);
      await actualizarTabla(); 
    } catch (err) {
      alert("No se pudo eliminar el producto: " + err.message);
    }
  }

  async function toggleProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    const nuevoStock = producto.disponible ? 0 : 100;
    
    try {
      await guardarProductoAPI({ ...producto, stock: nuevoStock }, id);
      await actualizarTabla(); 
    } catch (err) {
      alert("No se pudo cambiar el estado: Verificá tu sesión.");
    }
  }

  function toggleIngrediente() {}
  function guardarIngrediente() {}
  function eliminarIngrediente() {}

  return {
    ingredientes,
    productos,
    relaciones,
    toggleIngrediente,
    toggleProducto,
    guardarProducto,
    eliminarProducto,
    guardarIngrediente,
    eliminarIngrediente,
    cargando,
    error
  };
}