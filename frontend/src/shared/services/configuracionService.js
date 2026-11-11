import { API_URL } from './api';

function obtenerToken() {
  try {
    return JSON.parse(sessionStorage.getItem('pizzeria:sesion'))?.token ?? null;
  } catch {
    return null;
  }
}

// Público: lo usan el carrito (sin login) y las comandas del gestor.
// Devuelve { costoEnvio, envioGratisDesde }. envioGratisDesde = 0 significa sin envío gratis.
export async function obtenerConfigEnvio() {
  const respuesta = await fetch(`${API_URL}/configuracion/envio`);
  if (!respuesta.ok) throw new Error('No se pudo obtener el costo de envío');
  return respuesta.json();
}

// Solo empleados y administradores (el backend lo exige)
export async function actualizarConfigEnvio({ costoEnvio, envioGratisDesde }) {
  const respuesta = await fetch(`${API_URL}/configuracion/envio`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify({ costoEnvio, envioGratisDesde }),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo guardar el costo de envío');
  }
  return respuesta.json();
}
