import productosData from '../../../../../backend/data/productos.json';

export async function obtenerProductos() {
  return productosData;
}

export async function obtenerProductoPorId(id) {
  const productos = await obtenerProductos();
  const producto = productos.find((p) => p.id === Number(id));
  if (!producto) {
    throw new Error('El producto solicitado no existe');
  }
  return producto;
}

export async function obtenerDestacados() {
  const productos = await obtenerProductos();
  return productos.filter((p) => p.destacado);
}