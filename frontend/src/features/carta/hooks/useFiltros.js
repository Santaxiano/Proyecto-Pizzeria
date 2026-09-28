import { useState } from 'react';

export function useFiltros(productos) {
  const [categoria, setCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  const lista = productos ?? [];
  const categorias = [...new Set(lista.map((p) => p.categoria))];
  const textoBuscado = busqueda.trim().toLowerCase();

  const productosFiltrados = lista.filter((p) => {
    const coincideCategoria = categoria === 'todas' || p.categoria === categoria;
    const coincideBusqueda = p.nombre.toLowerCase().includes(textoBuscado) ||
                             p.descripcion.toLowerCase().includes(textoBuscado);
    return coincideCategoria && coincideBusqueda;
  });

  const hayFiltrosActivos = categoria !== 'todas' || textoBuscado !== '';

  function limpiarFiltros() {
    setCategoria('todas');
    setBusqueda('');
  }

  return {
    categoria,
    setCategoria,
    busqueda,
    setBusqueda,
    categorias,
    productosFiltrados,
    hayFiltrosActivos,
    limpiarFiltros
  };
}