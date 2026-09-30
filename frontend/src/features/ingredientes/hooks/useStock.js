// src/features/ingredientes/hooks/useStock.js
// Custom Hook de lógica pura y modelo relacional
import { useState, useEffect } from 'react';
import { obtenerDatosCompletos } from '../services/ingredienteService';

export function useStock() {
  // Mantenemos los estados separados según el modelo de datos
  const [ingredientes, setIngredientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [relaciones, setRelaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Al montarse, obtenemos los tres arreglos
  useEffect(() => {
    async function cargarDatos() {
      try {
        const { productos, ingredientes, relaciones } = await obtenerDatosCompletos();
        setProductos(productos);
        setIngredientes(ingredientes);
        setRelaciones(relaciones);
      } catch (error) {
        console.error("Error al cargar datos relacionales:", error);
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  // Apagar o encender un ingrediente detona el Efecto Dominó
  function toggleIngrediente(id) {
    // 1. Actualizamos el estado del ingrediente
    const nuevosIngredientes = ingredientes.map((ing) =>
      ing.id === id ? { ...ing, activo: !ing.activo } : ing
    );
    setIngredientes(nuevosIngredientes);

    const ingredienteModificado = nuevosIngredientes.find((i) => i.id === id);

    // 2. Filtrado Relacional (Efecto Dominó sobre productos)
    // Buscamos qué productos (Pizzas) dependen de este ingrediente a través de la tabla intermedia
    const idsProductosAfectados = relaciones
      .filter((r) => r.ingrediente_id === id)
      .map((r) => r.producto_id);

    setProductos((listaProductos) =>
      listaProductos.map((prod) => {
        // Si el producto no está relacionado con el ingrediente, no sufre cambios
        if (!idsProductosAfectados.includes(prod.id)) return prod;

        if (!ingredienteModificado.activo) {
          // Si el ingrediente se apagó (false), el producto se deshabilita automáticamente
          return { ...prod, disponible: false };
        } else {
          // Si se volvió a encender, verificamos si TODOS los demás ingredientes requeridos están activos
          const idsIngredientesRequeridos = relaciones
            .filter((r) => r.producto_id === prod.id)
            .map((r) => r.ingrediente_id);

          const todosActivos = idsIngredientesRequeridos.every((reqId) =>
            nuevosIngredientes.find((i) => i.id === reqId)?.activo
          );

          return { ...prod, disponible: todosActivos };
        }
      })
    );
  }

  // Apagar o encender un producto manualmente (ideal para bebidas o control manual)
  function toggleProducto(id) {
    setProductos((listaProductos) =>
      listaProductos.map((prod) =>
        prod.id === id ? { ...prod, disponible: !prod.disponible } : prod
      )
    );
  }

  return {
    ingredientes,
    productos,
    toggleIngrediente,
    toggleProducto,
    cargando
  };
}
