import { obtenerComandas } from '../../comandas/services/comandasService';

const URL_BASE = 'http://localhost:3000/api';

function obtenerToken() {
  const auth = sessionStorage.getItem('pizzeria:sesion');
  if (!auth) return null;
  try { return JSON.parse(auth).token; } catch { return null; }
}

// Estadísticas del período (fechas AAAA-MM-DD, ambas inclusive).
// Las cuentas las hace el backend con SQL; acá solo se piden.
export async function obtenerEstadisticas(desde, hasta) {
  const parametros = new URLSearchParams({ desde, hasta });
  const respuesta = await fetch(`${URL_BASE}/estadisticas?${parametros}`, {
    headers: { Authorization: `Bearer ${obtenerToken()}` },
  });

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}));
    throw new Error(errorData.error || 'No se pudieron obtener las estadísticas');
  }
  return respuesta.json();
}

function ordenarComandasRecientes(a, b) {
  const fechaA = a.creado_en ? new Date(a.creado_en).getTime() : 0;
  const fechaB = b.creado_en ? new Date(b.creado_en).getTime() : 0;

  if (fechaA !== fechaB) return fechaB - fechaA;
  return Number(b.id) - Number(a.id);
}

export async function obtenerPedidosRecientes(cantidad = 5) {
  const comandas = await obtenerComandas();
  return [...comandas].sort(ordenarComandasRecientes).slice(0, cantidad);
}
