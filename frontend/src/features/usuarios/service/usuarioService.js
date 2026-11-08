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

export async function obtenerUsuariosAPI() {
  const respuesta = await fetch(`${URL_BASE}/usuarios`, {
    headers: headersConToken(),
  });
  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'Error al cargar los usuarios');
  return respuesta.json();
}

export async function actualizarUsuarioAPI(usuario, id) {
  const respuesta = await fetch(`${URL_BASE}/usuarios/${id}`, {
    method: 'PUT',
    headers: headersConToken(true),
    body: JSON.stringify({
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol
    }),
  });
  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'Error al actualizar el usuario');
  return respuesta.json();
}

export async function eliminarUsuarioAPI(id) {
  const respuesta = await fetch(`${URL_BASE}/usuarios/${id}`, {
    method: 'DELETE',
    headers: headersConToken(),
  });
  if (!respuesta.ok) await lanzarErrorDeRespuesta(respuesta, 'Error al eliminar el usuario');
  return true;
}