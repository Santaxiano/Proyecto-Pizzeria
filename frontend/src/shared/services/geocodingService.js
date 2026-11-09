// Busca direcciones con Nominatim (el buscador gratis de OpenStreetMap, sin API key).
// Política de uso de Nominatim: como máximo 1 búsqueda por segundo y nada de autocompletar
// mientras se escribe, por eso solo se busca al tocar "Buscar" o Enter.
const URL_NOMINATIM = 'https://nominatim.openstreetmap.org/search';

// Recuadro alrededor de San Luis capital (oeste, norte, este, sur): los resultados se limitan a esta zona
const ZONA_SAN_LUIS = '-66.45,-33.22,-66.20,-33.40';

export async function buscarDireccion(texto) {
  const consulta = texto.trim();
  if (consulta.length < 3) return [];

  const parametros = new URLSearchParams({
    q: consulta,
    format: 'jsonv2',
    countrycodes: 'ar',
    viewbox: ZONA_SAN_LUIS,
    bounded: '1',
    limit: '5',
    'accept-language': 'es',
  });

  const respuesta = await fetch(`${URL_NOMINATIM}?${parametros}`);
  if (!respuesta.ok) throw new Error('El buscador de direcciones no está disponible en este momento');

  const resultados = await respuesta.json();
  return resultados.map((r) => ({
    id: r.place_id,
    nombre: r.display_name,
    lat: Number(r.lat),
    lng: Number(r.lon),
  }));
}
