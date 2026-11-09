// Pizzería: Pringles 1091, San Luis. Mismos valores que el backend (pedidos.controller.js).
export const UBICACION_LOCAL = { lat: -33.3021, lng: -66.3368 };
export const RADIO_ENTREGA_KM = 5;

export function verificarDisponibilidadInmediata() {
  const ahora = new Date();
  const dia = ahora.getDay();
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();

  if (dia === 0) {
    const abiertoDesde = 19 * 60;
    const cortePedidos = 24 * 60;
    return minutosActuales >= abiertoDesde && minutosActuales <= cortePedidos;
  } else {
    const mediodiaInicio = 12 * 60;
    const mediodiaFin = 14 * 60 + 30;
    const nocheInicio = 19 * 60;
    const nocheFin = 23 * 60 + 30;

    const enMediodia = minutosActuales >= mediodiaInicio && minutosActuales <= mediodiaFin;
    const enNoche = minutosActuales >= nocheInicio && minutosActuales <= nocheFin;

    return enMediodia || enNoche;
  }
}

// Distancia real en km entre dos puntos de la Tierra (fórmula de Haversine)
export function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // radio de la Tierra en km
  const aRadianes = (grados) => grados * (Math.PI / 180);
  const dLat = aRadianes(lat2 - lat1);
  const dLon = aRadianes(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Distancia desde la pizzería hasta el punto del cliente
export function distanciaAlLocal(lat, lng) {
  return calcularDistancia(UBICACION_LOCAL.lat, UBICACION_LOCAL.lng, lat, lng);
}

// true si el punto está dentro del radio de entrega (<= 5 km)
export function estaEnZonaDeEnvio(lat, lng) {
  return distanciaAlLocal(lat, lng) <= RADIO_ENTREGA_KM;
}
