const COORDENADAS_LOCAL = { lat: -33.2995, lng: -66.3356 };
const RADIO_MAXIMO_KM = 5.0;

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

export function calcularDistanciaKm(lat1, lon1, lat2 = COORDENADAS_LOCAL.lat, lon2 = COORDENADAS_LOCAL.lng) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function estaEnZonaDeEnvio(lat, lng) {
  return calcularDistanciaKm(lat, lng) <= RADIO_MAXIMO_KM;
}