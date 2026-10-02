import { useState, useEffect } from 'react';
import { obtenerDatosCompletos } from '../services/ingredienteService';
import { useFetch } from '../../../shared/hooks/useFetch'; 

export function useStock() {
  const { datos, cargando, error } = useFetch(obtenerDatosCompletos);

  const [ingredientes, setIngredientes] = useState(() => {
    const g = localStorage.getItem('stock-ingredientes');
    return g ? JSON.parse(g) : [];
  });

  const [productos, setProductos] = useState(() => {
    const g = localStorage.getItem('stock-productos');
    return g ? JSON.parse(g) : [];
  });

  const [relaciones, setRelaciones] = useState(() => {
    const g = localStorage.getItem('stock-relaciones');
    return g ? JSON.parse(g) : [];
  });

  useEffect(() => {
    if (datos && !localStorage.getItem('stock-productos')) {
      setProductos(datos.productos);
      setIngredientes(datos.ingredientes);
      setRelaciones(datos.relaciones);
    }
  }, [datos]);

  useEffect(() => {
    if (productos.length > 0) localStorage.setItem('stock-productos', JSON.stringify(productos));
    if (ingredientes.length > 0) localStorage.setItem('stock-ingredientes', JSON.stringify(ingredientes));
    if (relaciones.length > 0) localStorage.setItem('stock-relaciones', JSON.stringify(relaciones));
  }, [productos, ingredientes, relaciones]);

  // --- EFECTO DOMINÓ E INVENTARIO ---
  function toggleIngrediente(id) {
    const nuevosIngredientes = ingredientes.map((ing) =>
      ing.id === id ? { ...ing, activo: !ing.activo } : ing
    );
    setIngredientes(nuevosIngredientes);

    const ingredienteModificado = nuevosIngredientes.find((i) => i.id === id);
    const idsProductosAfectados = relaciones
      .filter((r) => r.ingrediente_id === id)
      .map((r) => r.producto_id);

    setProductos((listaProductos) =>
      listaProductos.map((prod) => {
        if (!idsProductosAfectados.includes(prod.id)) return prod;

        if (!ingredienteModificado.activo) {
          return { ...prod, disponible: false };
        } else {
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

  function toggleProducto(id) {
    setProductos((listaProductos) =>
      listaProductos.map((prod) =>
        prod.id === id ? { ...prod, disponible: !prod.disponible } : prod
      )
    );
  }

  // --- CRUD PRODUCTOS ---
  function guardarProducto(datosProd, idEditar = null) {
    if (idEditar) {
      setProductos(productos.map(p => p.id === idEditar ? { ...p, ...datosProd } : p));
      // Actualizamos relaciones filtrando las viejas y agregando las nuevas
      const nuevasRel = relaciones.filter(r => r.producto_id !== idEditar);
      const relAgregadas = datosProd.ingredientesIds.map(ingId => ({ producto_id: idEditar, ingrediente_id: Number(ingId) }));
      setRelaciones([...nuevasRel, ...relAgregadas]);
    } else {
      const nuevoId = productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
      const nuevoProducto = {
        id: nuevoId,
        nombre: datosProd.nombre,
        descripcion: datosProd.descripcion,
        precio: Number(datosProd.precio),
        categoria: datosProd.categoria,
        disponible: true
      };
      setProductos([...productos, nuevoProducto]);
      const relAgregadas = datosProd.ingredientesIds.map(ingId => ({ producto_id: nuevoId, ingrediente_id: Number(ingId) }));
      setRelaciones([...relaciones, ...relAgregadas]);
    }
  }

  function eliminarProducto(id) {
    setProductos(productos.filter(p => p.id !== id));
    setRelaciones(relaciones.filter(r => r.producto_id !== id));
  }

  // --- CRUD INGREDIENTES ---
  function guardarIngrediente(datosIng, idEditar = null) {
    if (idEditar) {
      setIngredientes(ingredientes.map(i => i.id === idEditar ? { ...i, nombre: datosIng.nombre } : i));
    } else {
      const nuevoId = ingredientes.length > 0 ? Math.max(...ingredientes.map(i => i.id)) + 1 : 1;
      const nuevoIng = { id: nuevoId, nombre: datosIng.nombre, activo: true };
      setIngredientes([...ingredientes, nuevoIng]);
    }
  }

  function eliminarIngrediente(id) {
    setIngredientes(ingredientes.filter(i => i.id !== id));
    setRelaciones(relaciones.filter(r => r.ingrediente_id !== id));
  }

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