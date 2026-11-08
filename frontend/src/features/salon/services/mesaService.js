const URL_BASE = 'http://localhost:3000/api/mesas';

function obtenerToken() {
  try {
    return JSON.parse(sessionStorage.getItem('pizzeria:sesion'))?.token;
  } catch {
    return null;
  }
}

function headersAPI(conBody = false) {
  const token = obtenerToken();
  if (!token) throw new Error('Iniciá sesión para gestionar las mesas');

  const headers = { Authorization: `Bearer ${token}` };
  if (conBody) headers['Content-Type'] = 'application/json';
  return headers;
}

async function solicitar(url, opciones, mensajeError) {
  const respuesta = await fetch(url, opciones);

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || mensajeError);
  }

  if (respuesta.status === 204) return null;
  return respuesta.json();
}

function adaptarMesa(mesa) {
  return {
    ...mesa,
    id: Number(mesa.id),
    capacidad: Number(mesa.capacidad),
  };
}

export async function listarMesas() {
  const mesas = await solicitar(URL_BASE, {
    headers: headersAPI(),
  }, 'No se pudieron cargar las mesas');

  return mesas.map(adaptarMesa);
}

export async function crearMesa(capacidad) {
  const mesa = await solicitar(URL_BASE, {
    method: 'POST',
    headers: headersAPI(true),
    body: JSON.stringify({ capacidad: Number(capacidad), estado: 'Libre' }),
  }, 'No se pudo crear la mesa');

  return adaptarMesa(mesa);
}

export async function actualizarMesa(mesa, estado) {
  const mesaActualizada = await solicitar(`${URL_BASE}/${mesa.id}`, {
    method: 'PUT',
    headers: headersAPI(true),
    body: JSON.stringify({ capacidad: mesa.capacidad, estado }),
  }, 'No se pudo actualizar la mesa');

  return adaptarMesa(mesaActualizada);
}

export async function eliminarMesa(id) {
  await solicitar(`${URL_BASE}/${id}`, {
    method: 'DELETE',
    headers: headersAPI(),
  }, 'No se pudo eliminar la mesa');
}
