import { useState, useEffect } from 'react';
import {
  obtenerDatosCompletos,
  guardarProductoAPI,
  eliminarProductoAPI,
  guardarIngredienteAPI,
  eliminarIngredienteAPI,
  obtenerProductosDeIngrediente,
} from '../services/ingredienteService';
import { useFetch } from '../../../shared/hooks/useFetch';

export function useStock() {
  const { datos, cargando, error } = useFetch(obtenerDatosCompletos);

  const [productos, setProductos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);

  useEffect(() => {
    if (datos) {
      setProductos(datos.productos);
      setIngredientes(datos.ingredientes);
    }
  }, [datos]);

  // Recarga productos E ingredientes: un cambio en un ingrediente
  // cambia la disponibilidad de los productos que lo usan (efecto dominó).
  async function actualizarTabla() {
    try {
      const datosFrescos = await obtenerDatosCompletos();
      setProductos(datosFrescos.productos);
      setIngredientes(datosFrescos.ingredientes);
    } catch (err) {
      console.error("Error al actualizar la tabla:", err);
    }
  }

  // ---------- Productos ----------

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

  // Este botón controla solo el stock. Si el producto está pausado por un
  // ingrediente inactivo, se resuelve reponiendo ese ingrediente.
  async function toggleProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    const nuevoStock = producto.stock > 0 ? 0 : 100;

    try {
      await guardarProductoAPI({ ...producto, stock: nuevoStock }, id);
      await actualizarTabla();
    } catch (err) {
      alert("No se pudo cambiar el estado: " + err.message);
    }
  }

  // ---------- Ingredientes ----------

  async function guardarIngrediente(valores, idEditar = null) {
    const existente = ingredientes.find(i => i.id === idEditar);

    try {
      await guardarIngredienteAPI(
        { nombre: valores.nombre, activo: existente ? existente.activo : true },
        idEditar
      );
      await actualizarTabla();
    } catch (err) {
      alert("No se pudo guardar el ingrediente: " + err.message);
    }
  }

  async function toggleIngrediente(id) {
    const ingrediente = ingredientes.find(i => i.id === id);
    if (!ingrediente) return;

    try {
      await guardarIngredienteAPI({ nombre: ingrediente.nombre, activo: !ingrediente.activo }, id);
      await actualizarTabla();
    } catch (err) {
      alert("No se pudo cambiar el estado del ingrediente: " + err.message);
    }
  }

  // El backend responde 409 si algún producto lo usa; el mensaje dice cuáles.
  async function eliminarIngrediente(id) {
    try {
      await eliminarIngredienteAPI(id);
      await actualizarTabla();
    } catch (err) {
      alert(err.message);
    }
  }

  // Productos que usan el ingrediente. Devuelve null si no se pudo consultar.
  async function productosAfectados(id) {
    try {
      return await obtenerProductosDeIngrediente(id);
    } catch (err) {
      alert("No se pudo consultar qué productos usan este ingrediente: " + err.message);
      return null;
    }
  }

  return {
    ingredientes,
    productos,
    toggleIngrediente,
    toggleProducto,
    guardarProducto,
    eliminarProducto,
    guardarIngrediente,
    eliminarIngrediente,
    productosAfectados,
    cargando,
    error
  };
}
