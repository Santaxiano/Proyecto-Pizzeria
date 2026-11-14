import { API_URL } from '../../../shared/services/api';

const URL_BASE = `${API_URL}/notificaciones`;

function obtenerToken() {
  try {
    return JSON.parse(sessionStorage.getItem('pizzeria:sesion'))?.token;
  } catch {
    return null;
  }
}

// GET /api/notificaciones?fecha=AAAA-MM-DD
// Devuelve los pedidos y las reservas recibidos ese día en una sola lista.
export async function obtenerNotificaciones(fecha, { signal } = {}) {
  const token = obtenerToken();
  if (!token) throw new Error('Iniciá sesión para ver las notificaciones');

  const parametros = new URLSearchParams();
  if (fecha) parametros.set('fecha', fecha);

  const respuesta = await fetch(`${URL_BASE}?${parametros}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}));
    throw new Error(errorData.error || 'No se pudieron obtener las notificaciones');
  }

  return respuesta.json();
}
