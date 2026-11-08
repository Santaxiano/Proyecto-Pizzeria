// src/features/comandas/services/comandasService.js
const URL_BASE = 'http://localhost:3000/api';

function obtenerToken() {
  const auth = sessionStorage.getItem('pizzeria:sesion');
  if (!auth) return null;
  try { return JSON.parse(auth).token; } catch { return null; }
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

// La base devuelve "direccionmesa" y "forma_pago"; la pantalla usa camelCase.
function adaptarComanda(pedido) {
  const { direccionmesa, forma_pago, ...resto } = pedido;
  return { ...resto, direccionMesa: direccionmesa ?? '', formaPago: forma_pago ?? 'efectivo' };
}

// Más nuevas primero
export async function obtenerComandas() {
  const respuesta = await fetch(`${URL_BASE}/pedidos`, { headers: headersConToken() });
  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'No se pudieron obtener las comandas');

  const pedidos = await respuesta.json();
  return pedidos.map(adaptarComanda).sort((a, b) => b.id - a.id);
}

// Solo se manda productoId y cantidad: el total, el envío y el detalle los calcula el backend.
export async function crearComanda(datos) {
  const respuesta = await fetch(`${URL_BASE}/pedidos`, {
    method: 'POST',
    headers: headersConToken(true),
    body: JSON.stringify({
      cliente: datos.cliente,
      telefono: datos.telefono,
      tipo: datos.tipo,
      direccionMesa: datos.direccionMesa,
      items: datos.items.map((item) => ({ productoId: item.id, cantidad: item.cantidad })),
    }),
  });

  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'No se pudo crear el pedido');
  return adaptarComanda(await respuesta.json());
}

export async function cambiarEstadoComanda(id, estado) {
  const respuesta = await fetch(`${URL_BASE}/pedidos/${id}`, {
    method: 'PUT',
    headers: headersConToken(true),
    body: JSON.stringify({ estado }),
  });

  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'No se pudo cambiar el estado del pedido');
  return adaptarComanda(await respuesta.json());
}

export async function eliminarComanda(id) {
  const respuesta = await fetch(`${URL_BASE}/pedidos/${id}`, {
    method: 'DELETE',
    headers: headersConToken(),
  });

  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'No se pudo eliminar el pedido');
  return true;
}
