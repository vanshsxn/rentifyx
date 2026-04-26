import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import PropertyMap, { MapMarkerData } from "@/components/PropertyMap";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation, Loader2, Star, Siren, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { EmergencyBadge, AvailabilityPill } from "@/components/StatusBadges";

interface Prop {
  id: string;
  title: string;
  address: string;
  area: string;
  rent: number;
  rating: number;
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  is_emergency: boolean;
  availability_status?: string | null;
}

const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const NearMe = () => {
  const navigate = useNavigate();
  const [props, setProps] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<number>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("nearme_radius") : null;
    const n = saved ? parseInt(saved) : 10;
    return isNaN(n) ? 10 : Math.min(50, Math.max(1, n));
  });
  const [filter, setFilter] = useState<"all" | "emergency" | "normal">(
    () => (typeof window !== "undefined" && (localStorage.getItem("nearme_filter") as any)) || "all"
  );
  const [availOnly, setAvailOnly] = useState<boolean>(
    () => typeof window !== "undefined" && localStorage.getItem("nearme_avail_only") === "1"
  );

  useEffect(() => {
    localStorage.setItem("nearme_radius", String(radius));
  }, [radius]);
  useEffect(() => { localStorage.setItem("nearme_filter", filter); }, [filter]);
  useEffect(() => { localStorage.setItem("nearme_avail_only", availOnly ? "1" : "0"); }, [availOnly]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("properties").select("id, title, address, area, rent, rating, image_url, latitude, longitude, is_emergency, availability_status");
      setProps((data || []).filter((p: any) => p.latitude && p.longitude));
      setLoading(false);
    })();
    getLocation();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => toast.error("Could not get your location — showing all properties on map")
    );
  };

  const filtered = useMemo(() => {
    let base = props;
    if (filter === "emergency") base = base.filter((p) => p.is_emergency);
    else if (filter === "normal") base = base.filter((p) => !p.is_emergency);
    if (availOnly) base = base.filter((p) => (p.availability_status || "available") === "available");
    if (!userLoc) return base;
    return base
      .map((p) => ({ ...p, dist: distanceKm(userLoc, { lat: p.latitude!, lng: p.longitude! }) }))
      .filter((p) => p.dist <= radius)
      .sort((a, b) => a.dist - b.dist);
  }, [props, userLoc, radius, filter, availOnly]);

  const markers: MapMarkerData[] = filtered.map((p) => ({
    id: p.id,
    lat: p.latitude!,
    lng: p.longitude!,
    title: p.title,
    rent: p.rent,
    isEmergency: p.is_emergency,
    onClick: () => navigate(`/property/${p.id}`),
  }));

  if (loading) return <div className="min-h-[400px] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tighter italic uppercase flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" /> Near Me
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {filtered.length} properties {userLoc ? `within ${radius}km` : "with map locations"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {userLoc && (
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
              <span className="text-[10px] font-black uppercase">Radius:</span>
              <input type="range" min={1} max={50} value={radius} onChange={(e) => setRadius(+e.target.value)} className="accent-primary" />
              <span className="text-xs font-black w-10">{radius}km</span>
            </div>
          )}
          <button onClick={getLocation} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest">
            <Navigation className="w-3.5 h-3.5" /> {userLoc ? "Refresh" : "Find Me"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { k: "all", l: "All", icon: MapPin },
          { k: "emergency", l: "Emergency Only", icon: Siren },
          { k: "normal", l: "Standard", icon: Building2 },
        ].map((opt) => (
          <button
            key={opt.k}
            onClick={() => setFilter(opt.k as any)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              filter === opt.k
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            <opt.icon className="w-3.5 h-3.5" /> {opt.l}
          </button>
        ))}
        <button
          onClick={() => setAvailOnly((v) => !v)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            availOnly
              ? "bg-green-500 text-white border-green-500"
              : "bg-card border-border text-muted-foreground hover:border-green-500/50"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Available Only
        </button>
      </div>

      <PropertyMap markers={markers} userLocation={userLoc} height="500px" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {filtered.map((p: any) => (
          <button key={p.id} onClick={() => navigate(`/property/${p.id}`)} className="text-left bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all">
            <div className="aspect-video relative">
              <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover" alt={p.title} />
              {p.is_emergency && <div className="absolute top-2 left-2"><EmergencyBadge /></div>}
              <div className="absolute bottom-2 right-2"><AvailabilityPill status={p.availability_status} /></div>
            </div>
            <div className="p-4 space-y-1">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-black uppercase truncate flex-1">{p.title}</h3>
                <div className="flex items-center gap-1 text-orange-500 text-[10px] font-bold"><Star className="w-3 h-3 fill-current" />{p.rating || 0}</div>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">{p.area}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-black text-primary">₹{p.rent.toLocaleString()}</span>
                {userLoc && p.dist !== undefined && <span className="text-[10px] font-black text-muted-foreground">{p.dist.toFixed(1)}km</span>}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NearMe;