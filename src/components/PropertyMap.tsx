import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import { toast } from "sonner";
import { Search, Loader2, LocateFixed } from "lucide-react";

/**
 * FIX: Leaflet Default Icon 
 * Vite/Webpack often lose the paths to these images in production.
 */
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Apply default icon globally
L.Marker.prototype.options.icon = defaultIcon;

/**
 * Custom Icon for Emergency Listings
 */
const emergencyIcon = L.divIcon({
  className: "custom-emergency-icon",
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

/**
 * Internal Helper: Automatically adjusts map zoom to show all markers
 */
const FitBounds = ({ markers, userLocation }: { markers: MapMarkerData[]; userLocation?: { lat: number; lng: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (!markers || markers.length === 0) return;

    const points: [number, number][] = markers
      .filter(m => m.lat && m.lng)
      .map((m) => [m.lat, m.lng]);

    if (userLocation?.lat && userLocation?.lng) {
      points.push([userLocation.lat, userLocation.lng]);
    }

    if (points.length === 0) return;

    try {
      if (points.length === 1) {
        map.setView(points[0], 14);
      } else {
        map.fitBounds(points as L.LatLngBoundsExpression, { padding: [40, 40] });
      }
    } catch (e) {
      console.error("Map Bounds Error:", e);
    }
  }, [markers, userLocation, map]);
  return null;
};

/**
 * Main Map Component
 */
const PropertyMap = ({ 
  markers = [], 
  center, 
  zoom = 12, 
  height = "400px", 
  className = "", 
  userLocation 
}: PropertyMapProps) => {
  
  const defaultCenter: [number, number] = center || 
    (markers.length > 0 && markers[0].lat ? [markers[0].lat, markers[0].lng] : [28.6139, 77.209]);

  return (
    <div className={`rounded-2xl overflow-hidden border border-border shadow-sm ${className}`} style={{ height }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%" }} 
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Use optional chaining and check markers before rendering Cluster */}
        {markers?.length > 0 && (
          <MarkerClusterGroup chunkedLoading maxClusterRadius={50} showCoverageOnHover={false}>
            {markers.map((m) => (
              <Marker
                key={m.id}
                position={[m.lat, m.lng]}
                icon={m.isEmergency ? emergencyIcon : defaultIcon}
                eventHandlers={{ click: () => m.onClick?.() }}
              >
                <Popup>
                  <div className="text-xs min-w-[120px]">
                    <p className="font-bold text-sm leading-tight mb-1">{m.title}</p>
                    {m.rent !== undefined && (
                      <p className="text-blue-600 font-black text-xs">₹{m.rent.toLocaleString()}/mo</p>
                    )}
                    {m.isEmergency && (
                      <p className="text-red-500 font-bold mt-1 text-[10px] uppercase">⚡ Emergency</p>
                    )}
                    {m.detailHref && (
                      <a
                        href={m.detailHref}
                        className="mt-2 block w-full text-center py-1.5 bg-blue-600 text-white rounded font-black text-[9px] uppercase tracking-tighter no-underline"
                      >
                        View Details
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        )}

        {userLocation?.lat && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: "user-pos",
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

/**
 * Picker Variant for Admins/Landlords
 */
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
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 15);
        setLocating(false);
        toast.success("Location set");
      },
      () => {
        setLocating(false);
        toast.error("Could not find you. Click map manually.");
      }
    );
  };

  const searchLocation = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json?.[0]) {
        const { lat: l0, lon: n0 } = json[0];
        onChange(parseFloat(l0), parseFloat(n0));
        mapRef.current?.setView([parseFloat(l0), parseFloat(n0)], 15);
      } else {
        toast.error("No results found");
      }
    } catch {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={searchLocation} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-secondary border border-border text-xs font-bold"
          />
        </div>
        <button type="submit" disabled={searching} className="px-4 py-2 bg-foreground text-background rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
          {searching ? <Loader2 className="animate-spin w-3 h-3" /> : <Search className="w-3 h-3" />}
          Search
        </button>
      </form>

      <div className="rounded-xl overflow-hidden border border-border" style={{ height }}>
        <MapContainer
          center={center}
          zoom={lat ? 15 : 11}
          style={{ height: "100%", width: "100%" }}
          ref={(m) => { if (m) mapRef.current = m; }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onPick={onChange} />
          {lat && lng && <Marker position={[lat, lng]} icon={defaultIcon} />}
        </MapContainer>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-[10px] font-mono text-muted-foreground uppercase">
          {lat ? `COORD: ${lat.toFixed(4)}, ${lng?.toFixed(4)}` : "Click map to pin"}
        </p>
        <button onClick={useMyLocation} disabled={locating} className="flex items-center gap-2 text-[10px] font-black bg-primary text-primary-foreground px-3 py-2 rounded-lg uppercase">
          {locating ? <Loader2 className="animate-spin w-3 h-3" /> : <LocateFixed className="w-3 h-3" />}
          {locating ? "Locating..." : "Use GPS"}
        </button>
      </div>
    </div>
  );
};

export default PropertyMap;