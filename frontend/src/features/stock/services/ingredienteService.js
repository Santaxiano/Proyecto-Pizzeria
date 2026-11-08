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

// Cada producto ya trae del backend sus "ingredientes" y "disponible" (efecto dominó incluido).
export async function obtenerDatosCompletos() {
  const [respProductos, respIngredientes] = await Promise.all([
    fetch(`${URL_BASE}/productos`),
    fetch(`${URL_BASE}/ingredientes`, { headers: headersConToken() }),
  ]);

  if (!respProductos.ok) {
    await lanzarErrorDeRespuesta(respProductos, 'Error al cargar los productos desde la base de datos');
  }
  if (!respIngredientes.ok) {
    await lanzarErrorDeRespuesta(respIngredientes, 'Error al cargar los ingredientes desde la base de datos');
  }

  return {
    productos: await respProductos.json(),
    ingredientes: await respIngredientes.json(),
  };
}

// "producto" puede ser uno existente (trae sus valores reales) o uno nuevo desde el formulario.
// Los valores por defecto se usan solo cuando el producto no los tiene.
export async function guardarProductoAPI(producto, idEditar = null) {
  const esPizza = producto.categoria === 'pizzas';

  const body = {
    nombre: producto.nombre,
    precio: Number(producto.precio),
    categoria: producto.categoria,
    tamanos: producto.tamanos ?? (esPizza ? ['4 porciones', '8 porciones'] : null),
    permiteMitad: producto.permitemitad ?? producto.permiteMitad ?? esPizza,
    stock: producto.stock !== undefined ? producto.stock : 100,
    destacado: producto.destacado !== undefined ? producto.destacado : true,
    imagen: producto.imagen ?? null,
    descripcion: producto.descripcion ?? null,
  };

  // Solo se manda la receta si viene del formulario; si no, el backend la deja como está.
  if (Array.isArray(producto.ingredientesIds)) {
    body.ingredientesIds = producto.ingredientesIds;
  }

  const respuesta = await fetch(idEditar ? `${URL_BASE}/productos/${idEditar}` : `${URL_BASE}/productos`, {
    method: idEditar ? 'PUT' : 'POST',
    headers: headersConToken(true),
    body: JSON.stringify(body),
  });

  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'Error en el servidor');
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

  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'Error en el servidor');
  return respuesta.json();
}

// Si el ingrediente lo usa algún producto, el backend responde 409 con un mensaje que nombra esos productos.
export async function eliminarIngredienteAPI(id) {
  const respuesta = await fetch(`${URL_BASE}/ingredientes/${id}`, {
    method: 'DELETE',
    headers: headersConToken(),
  });

  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'Error en el servidor');
  return true;
}

export async function obtenerProductosDeIngrediente(id) {
  const respuesta = await fetch(`${URL_BASE}/ingredientes/${id}/productos`, {
    headers: headersConToken(),
  });

  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'No se pudieron obtener los productos del ingrediente');
  return respuesta.json();
}
