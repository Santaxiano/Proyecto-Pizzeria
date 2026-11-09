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

// El backend agrega al final de las notas "Ubicación: https://www.google.com/maps?q=lat,lng"
// (pedidos.controller.js, armarNotas). Solo se reconoce ese formato exacto con números,
// así un cliente no puede colar otro link escribiéndolo en las indicaciones.
const PATRON_UBICACION = /(?:\s·\s)?Ubicación: (https:\/\/www\.google\.com\/maps\?q=-?\d{1,3}\.\d+,-?\d{1,3}\.\d+)$/;

function separarUbicacion(notas) {
  const coincidencia = notas?.match(PATRON_UBICACION);
  if (!coincidencia) return { notas: notas ?? '', ubicacionUrl: null };
  return { notas: notas.slice(0, coincidencia.index).trim(), ubicacionUrl: coincidencia[1] };
}

// La base devuelve "direccionmesa" y "forma_pago"; la pantalla usa camelCase.
function adaptarComanda(pedido) {
  const { direccionmesa, forma_pago, notas, ...resto } = pedido;
  return {
    ...resto,
    ...separarUbicacion(notas),
    direccionMesa: direccionmesa ?? '',
    formaPago: forma_pago ?? 'efectivo',
  };
}

// Más nuevas primero
export async function obtenerComandas() {
  const respuesta = await fetch(`${URL_BASE}/pedidos`, { headers: headersConToken() });
  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'No se pudieron obtener las comandas');

  const pedidos = await respuesta.json();
  return pedidos.map(adaptarComanda).sort((a, b) => b.id - a.id);
}

// Se manda producto, cantidad, tamaño y segundo sabor: el total, el envío y el detalle los calcula el backend.
export async function crearComanda(datos) {
  const respuesta = await fetch(`${URL_BASE}/pedidos`, {
    method: 'POST',
    headers: headersConToken(true),
    body: JSON.stringify({
      cliente: datos.cliente,
      telefono: datos.telefono,
      tipo: datos.tipo,
      direccionMesa: datos.direccionMesa,
      horario: datos.horario || null,
      // Opcional en el gestor: si se marcó en el mapa, el backend valida la zona y guarda el link
      lat: datos.ubicacion?.lat ?? null,
      lng: datos.ubicacion?.lng ?? null,
      items: datos.items.map((item) => ({
        productoId: item.id,
        cantidad: item.cantidad,
        tamano: item.tamano || null,
        segundoSaborId: item.segundoSaborId ?? null,
      })),
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
