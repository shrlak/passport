import { useNavigate } from 'react-router';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatDistance } from '../lib/geo';
import type { Place } from '../types';
import type { UnitSystem } from '../hooks/useUnits';

function pinIcon(collected: boolean): L.DivIcon {
  const color = collected ? '#34c759' : '#8e8e93';
  return L.divIcon({
    className: '',
    html: `<div style="width:20px;height:20px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.22)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -20],
  });
}

/** Lazy-loaded (see CategoryExplorePage) so the ~150 kB Leaflet bundle only
 * downloads for someone who actually opens map view. */
export default function CategoryMapView({
  places,
  center,
  zoom,
  units,
}: {
  places: { place: Place; distance: number | null }[];
  center: [number, number];
  zoom: number;
  units: UnitSystem;
}) {
  const navigate = useNavigate();
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map(({ place, distance }) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lng]}
          icon={pinIcon(place.stamp !== null)}
          eventHandlers={{ click: () => navigate(`/place/${place.id}`) }}
        >
          <Popup>
            <p className="font-display text-sm">{place.name}</p>
            <p className="text-xs text-ink-soft">{place.country}</p>
            {place.stamp ? (
              <p className="mt-1 text-xs font-medium text-mustard">Collected</p>
            ) : distance !== null ? (
              <p className="mt-1 text-xs text-ink-soft">{formatDistance(distance, units)} away</p>
            ) : null}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
