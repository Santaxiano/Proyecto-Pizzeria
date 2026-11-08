const URL_BASE = 'http://localhost:3000/api';

function obtenerToken() {
  const auth = sessionStorage.getItem('token') || sessionStorage.getItem('usuario') || sessionStorage.getItem('pizzeria:sesion');
  if (!auth) return null;
  try { return JSON.parse(auth).token || JSON.parse(auth); } catch { return auth; }
}

function headersConToken(conBody = false) {
  const headers = { 'Authorization': `Bearer ${obtenerToken()}` };
  if (conBody) headers['Content-Type'] = 'application/json';
  return headers;
}

async function lanzarErrorDeRespuesta(respuesta, mensajePorDefecto) {
  const errorData = await respuesta.json().catch(() => ({}));
  throw new Error(errorData.error || mensajePorDefecto);
}

export async function obtenerDatosCompletos() {
  const [respProductos, respIngredientes] = await Promise.all([
    fetch(`${URL_BASE}/productos`),
    fetch(`${URL_BASE}/ingredientes`, { headers: headersConToken() }),
  ]);

  if (!respProductos.ok) await lanzarErrorDeRespuesta(respProductos, 'Error al cargar los productos');
  if (!respIngredientes.ok) await lanzarErrorDeRespuesta(respIngredientes, 'Error al cargar los ingredientes');

  return {
    productos: await respProductos.json(),
    ingredientes: await respIngredientes.json(),
  };
}

// Sube la imagen al backend (backend/uploads/productos) y devuelve la URL para guardar en la base
export async function subirImagenProductoAPI(archivo) {
  const formData = new FormData();
  formData.append('imagen', archivo);

  // Sin Content-Type: el navegador lo arma solo con el boundary del multipart
  const respuesta = await fetch(`${URL_BASE}/productos/imagen`, {
    method: 'POST',
    headers: headersConToken(),
    body: formData,
  });

  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'Error al subir la imagen');
  const { ruta } = await respuesta.json();
  return ruta;
}

export async function guardarProductoAPI(producto, idEditar = null) {
  // Si viene un archivo nuevo, primero se sube y su ruta pasa a ser la imagen del producto
  if (producto.archivoImagen) {
    const ruta = await subirImagenProductoAPI(producto.archivoImagen);
    producto = { ...producto, imagen: ruta };
  }

  const esPizza = producto.categoria === 'pizzas';
  const esBebida = producto.categoria === 'bebidas';

  const body = {
    nombre: producto.nombre,
    precio: Number(producto.precio),
    categoria: producto.categoria,
    tamanos: producto.tamanos ?? (esPizza ? ['4 porciones', '8 porciones'] : null),
    permiteMitad: producto.permitemitad ?? producto.permiteMitad ?? esPizza,
    stock: producto.stock !== undefined ? producto.stock : 100,
    destacado: producto.destacado !== undefined ? producto.destacado : true,
    // Aseguramos la imagen por defecto por si falla algo en el frontend
    imagen: producto.imagen || '/noimagen.jpg', 
    descripcion: producto.descripcion ?? null,
  };

  if (esBebida) {
    body.ingredientesIds = [];
  } else if (Array.isArray(producto.ingredientesIds)) {
    body.ingredientesIds = producto.ingredientesIds;
  }

  const respuesta = await fetch(idEditar ? `${URL_BASE}/productos/${idEditar}` : `${URL_BASE}/productos`, {
    method: idEditar ? 'PUT' : 'POST',
    headers: headersConToken(true),
    body: JSON.stringify(body),
  });

  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'Error en el servidor al guardar el producto');
  return respuesta.json();
}

export async function eliminarProductoAPI(id) {
  const respuesta = await fetch(`${URL_BASE}/productos/${id}`, {
    method: 'DELETE',
    headers: headersConToken(),
  });
  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'Error en el servidor');
  return true;
}

export async function guardarIngredienteAPI(ingrediente, idEditar = null) {
  const respuesta = await fetch(idEditar ? `${URL_BASE}/ingredientes/${idEditar}` : `${URL_BASE}/ingredientes`, {
    method: idEditar ? 'PUT' : 'POST',
    headers: headersConToken(true),
    body: JSON.stringify({
      nombre: ingrediente.nombre,
      activo: ingrediente.activo,
    }),
  });
  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'Error en el servidor al guardar ingrediente');
  return respuesta.json();
}

export async function eliminarIngredienteAPI(id) {
  const respuesta = await fetch(`${URL_BASE}/ingredientes/${id}`, {
    method: 'DELETE',
    headers: headersConToken(),
  });
  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'Error en el servidor al eliminar ingrediente');
  return true;
}

export async function obtenerProductosDeIngrediente(id) {
  const respuesta = await fetch(`${URL_BASE}/ingredientes/${id}/productos`, { headers: headersConToken() });
  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'No se pudieron obtener los productos');
  return respuesta.json();
}