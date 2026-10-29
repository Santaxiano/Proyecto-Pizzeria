const URL_BASE = 'http://localhost:3000/api';

function obtenerToken() {
  const auth = sessionStorage.getItem('token') || sessionStorage.getItem('usuario') || sessionStorage.getItem('pizzeria:sesion');
  if (!auth) return null;
  try { return JSON.parse(auth).token || JSON.parse(auth); } catch { return auth; }
}

export async function obtenerDatosCompletos() {
  const respProductos = await fetch(`${URL_BASE}/productos`);
  if (!respProductos.ok) {
    const errorData = await respProductos.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al cargar los productos desde la base de datos');
  }
  const productos = await respProductos.json();
  
  // Como aún no tenemos backend para ingredientes, mandamos arrays vacíos para que no rompa el front
  return { 
    productos: productos.map(p => ({ ...p, disponible: p.stock > 0 })), 
    ingredientes: [], 
    relaciones: [] 
  };
}

export async function guardarProductoAPI(producto, idEditar = null) {
  const token = obtenerToken();
  const url = idEditar ? `${URL_BASE}/productos/${idEditar}` : `${URL_BASE}/productos`;
  
  const respuesta = await fetch(url, {
    method: idEditar ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      nombre: producto.nombre,
      precio: Number(producto.precio),
      categoria: producto.categoria,
      tamanos: producto.categoria === 'pizzas' ? ["4 porciones", "8 porciones"] : null,
      permiteMitad: producto.categoria === 'pizzas',
      stock: producto.stock !== undefined ? producto.stock : 100, 
      destacado: producto.destacado !== undefined ? producto.destacado : true,
      imagen: producto.imagen_url || null,
      descripcion: producto.descripcion
    })
  });

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error en el servidor');
  }
}

export async function eliminarProductoAPI(id) {
  const token = obtenerToken();
  const respuesta = await fetch(`${URL_BASE}/productos/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error en el servidor');
  }
  return true;
}