import { useState } from 'react';

// Función para normalizar: quitar acentos y transformar a minúsculas
const normalizarTexto = (texto) => {
  if (!texto) return '';
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

// Genera un token estricto (sin NINGÚN espacio) para comparaciones a prueba de balas
const crearTokenEstricto = (texto) => {
  return normalizarTexto(texto).replace(/\s+/g, "");
};

export function useFiltros(productos) {
  const [categoria, setCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');

  const lista = productos ?? [];
  const categorias = [...new Set(lista.map((p) => p.categoria))];
  
  // Convertimos la búsqueda del usuario a un token sin espacios
  const textoBuscado = crearTokenEstricto(busqueda);

  const productosFiltrados = lista.filter((p) => {
    const coincideCategoria = categoria === 'todas' || p.categoria === categoria;
    
    // Convertimos el nombre del producto a un token sin espacios
    const nombreEstricto = crearTokenEstricto(p.nombre);

    // Verificamos coincidencia ÚNICAMENTE en el nombre, ignorando acentos, mayúsculas y espacios
    const coincideBusqueda = nombreEstricto.includes(textoBuscado);
                             
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