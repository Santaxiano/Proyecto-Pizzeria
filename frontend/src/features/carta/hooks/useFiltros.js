import { useState } from 'react';

// Función para normalizar: quitar acentos y transformar a minúsculas
const normalizarTexto = (texto) => {
  if (!texto) return '';
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export function useFiltros(productos) {
  const [categoria, setCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  const lista = productos ?? [];
  const categorias = [...new Set(lista.map((p) => p.categoria))];
  
  // Normalizamos el texto ingresado por el usuario
  const textoBuscado = normalizarTexto(busqueda.trim());

  const productosFiltrados = lista.filter((p) => {
    const coincideCategoria = categoria === 'todas' || p.categoria === categoria;
    
    // Normalizamos el nombre y descripción del producto antes de buscar
    const nombreNormalizado = normalizarTexto(p.nombre);
    const descripcionNormalizada = normalizarTexto(p.descripcion);

    const coincideBusqueda = nombreNormalizado.includes(textoBuscado) ||
                             descripcionNormalizada.includes(textoBuscado);
                             
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