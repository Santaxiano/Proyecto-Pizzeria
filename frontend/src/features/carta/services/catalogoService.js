const URL_BASE = 'http://localhost:3000/api';

export async function obtenerProductos() {
  const respuesta = await fetch(`${URL_BASE}/productos`);
  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}));
    throw new Error(errorData.error || 'No se pudieron obtener los productos');
  }
  return respuesta.json();
}

export async function obtenerProductoPorId(id) {
  const respuesta = await fetch(`${URL_BASE}/productos/${id}`);
  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}));
    throw new Error(errorData.error || 'El producto que buscás no existe o fue retirado');
  }
  return respuesta.json();
}

export async function obtenerDestacados() {
  const productos = await obtenerProductos();
  return productos.filter((p) => p.destacado);
}