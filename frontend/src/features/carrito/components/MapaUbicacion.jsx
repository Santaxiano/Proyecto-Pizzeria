import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Con Vite el ícono por defecto de Leaflet aparece roto: se arma con las imágenes del paquete
import iconoPin from 'leaflet/dist/images/marker-icon.png';
import iconoPin2x from 'leaflet/dist/images/marker-icon-2x.png';
import sombraPin from 'leaflet/dist/images/marker-shadow.png';
import { UBICACION_LOCAL, RADIO_ENTREGA_KM, distanciaAlLocal } from '../../../shared/utils/pedidosUtils';

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

// Cuando la ubicación llega por GPS, el mapa se mueve hasta ese punto
function CentrarEn({ punto }) {
  const mapa = useMap();
  useEffect(() => {
    if (punto) mapa.flyTo([punto.lat, punto.lng], Math.max(mapa.getZoom(), 15), { duration: 0.8 });
  }, [punto, mapa]);
  return null;
}

export default function MapaUbicacion({ ubicacion, onCambiarUbicacion }) {
  const [puntoGps, setPuntoGps] = useState(null);
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [errorGps, setErrorGps] = useState('');

  const distancia = ubicacion ? distanciaAlLocal(ubicacion.lat, ubicacion.lng) : null;
  const dentro = distancia !== null && distancia <= RADIO_ENTREGA_KM;

  const usarMiUbicacion = () => {
    if (!('geolocation' in navigator)) {
      setErrorGps('Tu navegador no permite obtener la ubicación. Marcala tocando el mapa.');
      return;
    }
    setBuscandoGps(true);
    setErrorGps('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const punto = { lat: coords.latitude, lng: coords.longitude };
        setPuntoGps(punto);
        onCambiarUbicacion(punto);
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

  return (
    <div className="card border shadow-sm">
      <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span className="fw-semibold small">📍 Marcá tu domicilio en el mapa *</span>
        <div className="d-flex align-items-center gap-2">
          {distancia !== null && (
            <span className={`badge ${dentro ? 'text-bg-success' : 'text-bg-danger'}`}>
              {formatoKm.format(distancia)} km
            </span>
          )}
          <button type="button" className="btn btn-outline-dark btn-sm" onClick={usarMiUbicacion} disabled={buscandoGps}>
            {buscandoGps ? (
              <><span className="spinner-border spinner-border-sm me-1" aria-hidden="true" />Buscando...</>
            ) : '🎯 Usar mi ubicación'}
          </button>
        </div>
      </div>

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
              <Tooltip direction="top" offset={[0, -36]}>Tu domicilio</Tooltip>
            </Marker>
          )}
          <CapturarClic onElegir={onCambiarUbicacion} />
          <CentrarEn punto={puntoGps} />
        </MapContainer>
      </div>

      <div className="card-footer bg-white small text-muted">
        Tocá el mapa donde está tu casa (podés tocar de nuevo para corregir). El círculo rojo es nuestra zona de entrega de {RADIO_ENTREGA_KM} km.
        {errorGps && <div className="text-danger mt-1">{errorGps}</div>}
      </div>
    </div>
  );
}
