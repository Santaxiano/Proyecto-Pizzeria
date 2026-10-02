// src/features/comandas/services/comandasService.js
const URL_BASE = '/backend/data';

export async function obtenerComandas() {
  const respuesta = await fetch(`${URL_BASE}/pedidos.json`);
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener las comandas');
  }
  return respuesta.json();
}
