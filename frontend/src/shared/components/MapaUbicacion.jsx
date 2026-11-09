import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Con Vite el ícono por defecto de Leaflet aparece roto: se arma con las imágenes del paquete
import iconoPin from 'leaflet/dist/images/marker-icon.png';
import iconoPin2x from 'leaflet/dist/images/marker-icon-2x.png';
import sombraPin from 'leaflet/dist/images/marker-shadow.png';
import { UBICACION_LOCAL, RADIO_ENTREGA_KM, distanciaAlLocal } from '../utils/pedidosUtils';
import { buscarDireccion } from '../services/geocodingService';

const ICONO_CLIENTE = L.icon({
  iconUrl: iconoPin,
  iconRetinaUrl: iconoPin2x,
  shadowUrl: sombraPin,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

const ICONO_PIZZERIA = L.divIcon({
  html: '<span style="font-size:26px;line-height:1">🍕</span>',
  className: '', // sin el recuadro blanco por defecto de divIcon
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const CENTRO_SAN_LUIS = [UBICACION_LOCAL.lat, UBICACION_LOCAL.lng];
const formatoKm = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

// Cada clic en el mapa coloca (o mueve) el pin del cliente
function CapturarClic({ onElegir }) {
  useMapEvents({
    click: (e) => onElegir({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

// Cuando la ubicación llega por GPS o por el buscador, el mapa se mueve hasta ese punto
function CentrarEn({ punto }) {
  const mapa = useMap();
  useEffect(() => {
    if (punto) mapa.flyTo([punto.lat, punto.lng], Math.max(mapa.getZoom(), 16), { duration: 0.8 });
  }, [punto, mapa]);
  return null;
}

// Mapa para marcar un domicilio de entrega. Lo usan el carrito (cliente) y las comandas (gestor).
// - mostrarGps: botón "Usar mi ubicación" (en el gestor no sirve: daría la ubicación del local)
// - mostrarBuscador: campo para buscar una dirección y poner el pin solo
// - textoInicialBusqueda: precarga el buscador (ej. con "Calle y número" del carrito)
//   mientras la persona no escriba algo distinto en el buscador
export default function MapaUbicacion({
  ubicacion,
  onCambiarUbicacion,
  titulo = 'Marcá tu domicilio en el mapa *',
  mostrarGps = true,
  mostrarBuscador = false,
  textoInicialBusqueda = '',
}) {
  const [puntoEnfocar, setPuntoEnfocar] = useState(null);
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [errorGps, setErrorGps] = useState('');

  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [busquedaEditada, setBusquedaEditada] = useState(false);
  // Mientras no escriba en el buscador, se usa la dirección que viene del formulario
  const textoMostrado = busquedaEditada ? textoBusqueda : textoInicialBusqueda;
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mensajeBusqueda, setMensajeBusqueda] = useState('');

  const distancia = ubicacion ? distanciaAlLocal(ubicacion.lat, ubicacion.lng) : null;
  const dentro = distancia !== null && distancia <= RADIO_ENTREGA_KM;

  // Coloca el pin y mueve el mapa hasta ese punto
  const elegirPunto = (punto) => {
    setPuntoEnfocar(punto);
    onCambiarUbicacion(punto);
  };

  const usarMiUbicacion = () => {
    if (!('geolocation' in navigator)) {
      setErrorGps('Tu navegador no permite obtener la ubicación. Marcala tocando el mapa.');
      return;
    }
    setBuscandoGps(true);
    setErrorGps('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        elegirPunto({ lat: coords.latitude, lng: coords.longitude });
        setBuscandoGps(false);
      },
      (error) => {
        setErrorGps(error.code === error.PERMISSION_DENIED
          ? 'No diste permiso para usar tu ubicación. Marcala tocando el mapa.'
          : 'No pudimos obtener tu ubicación. Marcala tocando el mapa.');
        setBuscandoGps(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  const buscar = async () => {
    if (textoMostrado.trim().length < 3) {
      setMensajeBusqueda('Escribí al menos 3 letras (ej: Pringles 500).');
      return;
    }
    setBuscando(true);
    setMensajeBusqueda('');
    setResultados([]);
    try {
      const encontrados = await buscarDireccion(textoMostrado);
      if (encontrados.length === 0) {
        setMensajeBusqueda('No encontramos esa dirección en San Luis. Probá con otra forma o marcala en el mapa.');
      } else if (encontrados.length === 1) {
        elegirPunto({ lat: encontrados[0].lat, lng: encontrados[0].lng });
      } else {
        setResultados(encontrados); // varias opciones: que elija la correcta
      }
    } catch (error) {
      setMensajeBusqueda(error.message);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="card border shadow-sm">
      <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span className="fw-semibold small">📍 {titulo}</span>
        <div className="d-flex align-items-center gap-2">
          {distancia !== null && (
            <span className={`badge ${dentro ? 'text-bg-success' : 'text-bg-danger'}`}>
              {formatoKm.format(distancia)} km
            </span>
          )}
          {mostrarGps && (
            <button type="button" className="btn btn-outline-dark btn-sm" onClick={usarMiUbicacion} disabled={buscandoGps}>
              {buscandoGps ? (
                <><span className="spinner-border spinner-border-sm me-1" aria-hidden="true" />Buscando...</>
              ) : '🎯 Usar mi ubicación'}
            </button>
          )}
        </div>
      </div>

      {mostrarBuscador && (
        <div className="card-body border-bottom py-2">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white">🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar dirección (ej: Pringles 500)"
              aria-label="Buscar dirección"
              value={textoMostrado}
              onChange={(e) => {
                setTextoBusqueda(e.target.value);
                setBusquedaEditada(true);
              }}
              // Enter busca la dirección en vez de enviar el formulario del pedido
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  buscar();
                }
              }}
            />
            <button type="button" className="btn btn-dark" onClick={buscar} disabled={buscando}>
              {buscando ? <span className="spinner-border spinner-border-sm" aria-label="Buscando" /> : 'Buscar'}
            </button>
          </div>

          {mensajeBusqueda && <div className="small text-danger mt-1">{mensajeBusqueda}</div>}

          {resultados.length > 0 && (
            <div className="list-group list-group-flush mt-2 border rounded small">
              <div className="list-group-item bg-light fw-semibold py-1">Elegí la dirección correcta:</div>
              {resultados.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="list-group-item list-group-item-action py-1"
                  onClick={() => {
                    elegirPunto({ lat: r.lat, lng: r.lng });
                    setResultados([]);
                  }}
                >
                  {r.nombre}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* isolation: las capas de Leaflet no tapan el resto de la página (ej. el resumen del carrito) */}
      <div style={{ height: 300, isolation: 'isolate' }}>
        <MapContainer
          center={CENTRO_SAN_LUIS}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle
            center={CENTRO_SAN_LUIS}
            radius={RADIO_ENTREGA_KM * 1000}
            pathOptions={{ color: '#dc3545', fillColor: '#dc3545', fillOpacity: 0.12, weight: 2 }}
            interactive={false}
          />
          <Marker position={CENTRO_SAN_LUIS} icon={ICONO_PIZZERIA} interactive>
            <Tooltip direction="top" offset={[0, -12]}>+PIZZA · Pringles 1091</Tooltip>
          </Marker>
          {ubicacion && (
            <Marker position={[ubicacion.lat, ubicacion.lng]} icon={ICONO_CLIENTE}>
              <Tooltip direction="top" offset={[0, -36]}>Domicilio de entrega</Tooltip>
            </Marker>
          )}
          <CapturarClic onElegir={onCambiarUbicacion} />
          <CentrarEn punto={puntoEnfocar} />
        </MapContainer>
      </div>

      <div className="card-footer bg-white small text-muted">
        Tocá el mapa donde está el domicilio (podés tocar de nuevo para corregir). El círculo rojo es la zona de entrega de {RADIO_ENTREGA_KM} km.
        {errorGps && <div className="text-danger mt-1">{errorGps}</div>}
      </div>
    </div>
  );
}
