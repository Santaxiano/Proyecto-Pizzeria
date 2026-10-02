const URL_BASE = '/backend/data';

export async function obtenerDatosSalon() {
  const [respMesas, respReservas] = await Promise.all([
    fetch(`${URL_BASE}/mesas.json`),
    fetch(`${URL_BASE}/reservas.json`)
  ]);

  if (!respMesas.ok || !respReservas.ok) {
    throw new Error('Error al cargar la base de datos del salón');
  }

  const mesas = await respMesas.json();
  const reservas = await respReservas.json();

  return { mesas, reservas };
}