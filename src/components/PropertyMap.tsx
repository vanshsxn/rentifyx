import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userIcon = L.divIcon({
  className: "",
  html: `<div style="background:#4f46e5;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(79,70,229,0.3);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const propIcon = L.divIcon({
  className: "",
  html: `<div style="background:white;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #4f46e5;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);"><span style="transform:rotate(45deg);color:#4f46e5;font-weight:900;font-size:12px;">📍</span></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface Property {
  id: string;
  title: string;
  area: string;
  rent: number;
  latitude: number | null;
  longitude: number | null;
}

interface Props {
  properties: Property[];
  userLocation?: { lat: number; lng: number } | null;
  height?: string;
  onMarkerClick?: (id: string) => void;
}

const Recenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const PropertyMap = ({ properties, userLocation, height = "100%", onMarkerClick }: Props) => {
  const valid = properties.filter(p => p.latitude && p.longitude);
  // Default: India centroid, falls back to user location
  const defaultCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : valid[0]
    ? [valid[0].latitude!, valid[0].longitude!]
    : [28.6139, 77.209]; // New Delhi

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-200">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {userLocation && <Recenter center={[userLocation.lat, userLocation.lng]} />}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        {valid.map(p => (
          <Marker
            key={p.id}
            position={[p.latitude!, p.longitude!]}
            icon={propIcon}
            eventHandlers={{ click: () => onMarkerClick?.(p.id) }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-black text-slate-800">{p.title}</p>
                <p className="text-slate-500">{p.area}</p>
                <p className="text-indigo-600 font-bold mt-1">₹{p.rent.toLocaleString()}/mo</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
