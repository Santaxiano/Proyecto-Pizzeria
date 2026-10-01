import productosData from '../../../../../backend/data/productos.json';
import ingredientesData from '../../../../../backend/data/ingrediente.json';
import relacionesData from '../../../../../backend/data/producto_ingrediente.json';

// Fetch múltiple simulando peticiones asíncronas a 3 endpoints distintos
export async function obtenerDatosCompletos() {
  const [productos, ingredientes, relaciones] = await Promise.all([
    Promise.resolve(productosData),
    Promise.resolve(ingredientesData),
    Promise.resolve(relacionesData)
  ]);

  // Validamos que los productos traigan un booleano de disponibilidad
  const productosMapeados = productos.map(p => ({
    ...p,
    disponible: p.disponible ?? (p.stock > 0)
  }));

  return { productos: productosMapeados, ingredientes, relaciones };
}
