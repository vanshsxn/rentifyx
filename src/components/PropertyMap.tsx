import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// ✅ Fix icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ✅ Icons
const userIcon = L.divIcon({
  html: `<div style="background:#4f46e5;width:18px;height:18px;border-radius:50%;border:3px solid white;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const propIcon = L.divIcon({
  html: `<div style="background:white;width:30px;height:30px;border-radius:50%;border:2px solid #4f46e5;display:flex;align-items:center;justify-content:center;">📍</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// ✅ Recenter component
const Recenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center);
    }
  }, [center, map]);
  return null;
};

const PropertyMap = ({
  properties = [],
  userLocation = null,
  height = "100%",
  onMarkerClick,
}: any) => {

  // ✅ SAFE FILTER
  const valid = (properties || []).filter(
    (p: any) =>
      p &&
      typeof p.latitude === "number" &&
      typeof p.longitude === "number"
  );

  // ✅ SAFE CENTER
  const defaultCenter: [number, number] =
    userLocation && userLocation.lat && userLocation.lng
      ? [userLocation.lat, userLocation.lng]
      : valid.length > 0
      ? [valid[0].latitude, valid[0].longitude]
      : [28.6139, 77.209]; // fallback

  return (
    <div style={{ height }} className="w-full rounded-xl overflow-hidden">

      {/* 🚨 IMPORTANT: key fixes crash */}
      <MapContainer
        key={defaultCenter.join(",")}
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* USER LOCATION */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <>
            <Recenter center={[userLocation.lat, userLocation.lng]} />
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={userIcon}
            >
              <Popup>You are here</Popup>
            </Marker>
          </>
        )}

        {/* PROPERTIES */}
        {valid.map((p: any) => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={propIcon}
            eventHandlers={{
              click: () => {
                if (onMarkerClick && typeof onMarkerClick === "function") {
                  onMarkerClick(p.id);
                }
              },
            }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-bold">{p.title || "No Title"}</p>
                <p>{p.area || "Unknown"}</p>
                <p className="text-indigo-600 font-bold">
                  ₹{p.rent || 0}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;