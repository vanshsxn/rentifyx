import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons (Leaflet expects assets in /node_modules path)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const emergencyIcon = L.divIcon({
  className: "",
  html: `<div style="background:#ef4444;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,.3)">⚡</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export interface MapMarkerData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  rent?: number;
  isEmergency?: boolean;
  onClick?: () => void;
  detailHref?: string;
}

interface PropertyMapProps {
  markers: MapMarkerData[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  userLocation?: { lat: number; lng: number } | null;
}

const FitBounds = ({ markers, userLocation }: { markers: MapMarkerData[]; userLocation?: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = markers.map((m) => [m.lat, m.lng]);
    if (userLocation) points.push([userLocation.lat, userLocation.lng]);
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(points as L.LatLngBoundsExpression, { padding: [40, 40] });
    }
  }, [markers, userLocation, map]);
  return null;
};

const PropertyMap = ({ markers, center, zoom = 12, height = "400px", className = "", userLocation }: PropertyMapProps) => {
  const defaultCenter: [number, number] = center || (markers[0] ? [markers[0].lat, markers[0].lng] : [28.6139, 77.209]); // Delhi

  return (
    <div className={`rounded-2xl overflow-hidden border border-border ${className}`} style={{ height }}>
      <MapContainer center={defaultCenter} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={m.isEmergency ? emergencyIcon : defaultIcon}
            eventHandlers={{ click: () => m.onClick?.() }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-bold">{m.title}</p>
                {m.rent !== undefined && <p className="text-primary font-bold">₹{m.rent.toLocaleString()}/mo</p>}
                {m.isEmergency && <p className="text-red-500 font-bold mt-1">⚡ Emergency Booking</p>}
                {m.detailHref && (
                  <a
                    href={m.detailHref}
                    style={{
                      display: "inline-block",
                      marginTop: 6,
                      padding: "4px 10px",
                      background: "#3b82f6",
                      color: "white",
                      borderRadius: 6,
                      fontWeight: 800,
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      textDecoration: "none",
                    }}
                  >
                    View listing →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: "",
              html: `<div style="background:#3b82f6;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,.3)"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            })}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}
        <FitBounds markers={markers} userLocation={userLocation} />
      </MapContainer>
    </div>
  );
};

// Picker variant: lets landlord click on map to set coordinates
const ClickHandler = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const LocationPicker = ({
  lat,
  lng,
  onChange,
  height = "300px",
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
  height?: string;
}) => {
  const center: [number, number] = lat && lng ? [lat, lng] : [28.6139, 77.209];
  const mapRef = useRef<L.Map | null>(null);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      onChange(pos.coords.latitude, pos.coords.longitude);
      mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 15);
    });
  };

  return (
    <div className="space-y-2">
      <div className="rounded-2xl overflow-hidden border border-border" style={{ height }}>
        <MapContainer
          center={center}
          zoom={lat && lng ? 14 : 11}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
          ref={(m) => { if (m) mapRef.current = m; }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
          <ClickHandler onPick={onChange} />
          {lat && lng && <Marker position={[lat, lng]} icon={defaultIcon} />}
        </MapContainer>
      </div>
      <div className="flex items-center justify-between text-[10px] font-bold uppercase">
        <span className="text-muted-foreground">
          {lat && lng ? `📍 ${lat.toFixed(5)}, ${lng.toFixed(5)}` : "Click on map to set location"}
        </span>
        <button type="button" onClick={useMyLocation} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider">
          Use My Location
        </button>
      </div>
    </div>
  );
};

export default PropertyMap;