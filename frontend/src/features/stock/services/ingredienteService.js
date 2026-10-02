const URL_BASE = '/backend/data';

export async function obtenerDatosCompletos() {
  const [respProductos, respIngredientes, respRelaciones] = await Promise.all([
    fetch(`${URL_BASE}/productos.json`),
    fetch(`${URL_BASE}/ingrediente.json`),
    fetch(`${URL_BASE}/producto_ingrediente.json`)
  ]);

  if (!respProductos.ok || !respIngredientes.ok || !respRelaciones.ok) {
    throw new Error('Error al cargar la base de datos del gestor de stock');
  }

  const productos = await respProductos.json();
  const ingredientes = await respIngredientes.json();
  const relaciones = await respRelaciones.json();

  const productosMapeados = productos.map(p => ({
    ...p,
    disponible: p.disponible ?? (p.stock > 0)
  }));

  return { productos: productosMapeados, ingredientes, relaciones };
}