import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Star } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.4, easeLinearity: 0.22 });
    }
  }, [center, zoom, map]);
  return null;
}

const defaultCenter = [13.0827, 80.2707];

export default function MapView({ restaurants, selectedRestaurant, setSelectedRestaurant }) {
  const center = selectedRestaurant?.lat && selectedRestaurant?.lng
    ? [selectedRestaurant.lat, selectedRestaurant.lng]
    : defaultCenter;

  const validRestaurants = restaurants.filter((r) => r.lat && r.lng);

  return (
    <div className="surface canvas-shell h-full min-h-[400px] w-full overflow-hidden rounded-[1.4rem] p-1 lg:min-h-[600px]">
      <div className="relative z-0 h-full min-h-[392px] overflow-hidden rounded-[1.1rem]">
        <div className="map-ambient" aria-hidden="true" />
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />

          <MapUpdater center={center} zoom={selectedRestaurant ? 15 : 12} />

          {validRestaurants.map((r) => (
            <Marker
              key={r._id}
              position={[r.lat, r.lng]}
              eventHandlers={{ click: () => setSelectedRestaurant(r) }}
            >
              <Popup onClose={() => setSelectedRestaurant(null)}>
                <div className="min-w-[160px] p-1">
                  <h3 className="mb-1 text-sm font-black text-[rgb(var(--text))]">{r.name}</h3>
                  <p className="mb-1 flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                    {r.rating}
                  </p>
                  <p className="text-xs text-[rgb(var(--muted))]">{r.address || r.location}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
