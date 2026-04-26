import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import PropertyMap, { MapMarkerData } from "@/components/PropertyMap";
import { useNavigate } from "react-router-dom";
import { MapPin, Navigation, Loader2, Star, Siren, Building2, CheckCircle2, ExternalLink } from "lucide-react";
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
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
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
    localStorage.setItem("nearme_filter", filter);
    localStorage.setItem("nearme_avail_only", availOnly ? "1" : "0");
  }, [radius, filter, availOnly]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: propData } = await supabase
          .from("properties")
          .select("id, title, address, area, rent, rating, image_url, latitude, longitude, is_emergency, availability_status");
        
        setProps((propData || []) as Prop[]);

        const { data: ratingRows } = await supabase.from("property_ratings").select("property_id, rating");
        const map: Record<string, { sum: number; count: number }> = {};
        
        (ratingRows || []).forEach((r: any) => {
          if (!map[r.property_id]) map[r.property_id] = { sum: 0, count: 0 };
          map[r.property_id].sum += Number(r.rating) || 0;
          map[r.property_id].count += 1;
        });

        const agg: Record<string, { avg: number; count: number }> = {};
        Object.entries(map).forEach(([k, v]) => {
          agg[k] = { avg: v.count > 0 ? v.sum / v.count : 0, count: v.count };
        });
        setRatings(agg);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    getLocation();
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    toast.loading("Getting your location…", { id: "geo" });
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success("Location found", { id: "geo" });
      },
      (err) => {
        toast.dismiss("geo");
        toast.error("Location access denied or unavailable.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const filtered = useMemo(() => {
    let base = props.filter((p) => p.latitude && p.longitude);
    if (filter === "emergency") base = base.filter((p) => p.is_emergency);
    else if (filter === "normal") base = base.filter((p) => !p.is_emergency);
    if (availOnly) base = base.filter((p) => (p.availability_status || "available") === "available");
    
    if (!userLoc) return base;

    return base
      .map((p) => ({ 
        ...p, 
        dist: distanceKm(userLoc, { lat: p.latitude!, lng: p.longitude! }) 
      }))
      .filter((p) => p.dist <= radius)
      .sort((a, b) => a.dist - b.dist);
  }, [props, userLoc, radius, filter, availOnly]);

  const markers: MapMarkerData[] = useMemo(() => filtered.map((p) => ({
    id: p.id,
    lat: p.latitude!,
    lng: p.longitude!,
    title: p.title,
    rent: p.rent,
    isEmergency: p.is_emergency,
    onClick: () => navigate(`/property/${p.id}`),
    detailHref: `/property/${p.id}`,
  })), [filtered, navigate]);

  const unmapped = useMemo(() => {
    let base = props.filter((p) => !p.latitude || !p.longitude);
    if (filter === "emergency") base = base.filter((p) => p.is_emergency);
    else if (filter === "normal") base = base.filter((p) => !p.is_emergency);
    if (availOnly) base = base.filter((p) => (p.availability_status || "available") === "available");
    return base;
  }, [props, filter, availOnly]);

  const mapsUrl = (p: Prop) => {
    const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      return userLoc
        ? `https://maps.apple.com/?saddr=${userLoc.lat},${userLoc.lng}&daddr=${p.latitude},${p.longitude}`
        : `https://maps.apple.com/?ll=${p.latitude},${p.longitude}&q=${encodeURIComponent(p.title)}`;
    }
    return userLoc
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${p.latitude},${p.longitude}&travelmode=driving`
      : `https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`;
  };

  const ratingFor = (p: Prop) => {
    const r = ratings[p.id];
    if (r && r.count > 0) return r.avg.toFixed(1);
    if (p.rating && p.rating > 0) return Number(p.rating).toFixed(1);
    return "—";
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Loading Properties...</p>
    </div>
  );

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic uppercase flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary" /> Near Me
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
            {filtered.length} listings {userLoc ? `within ${radius}km` : "available on map"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {userLoc && (
            <div className="flex items-center gap-3 bg-secondary/50 border border-border rounded-2xl px-4 py-2">
              <span className="text-[10px] font-black uppercase">Range:</span>
              <input 
                type="range" min={1} max={50} value={radius} 
                onChange={(e) => setRadius(+e.target.value)} 
                className="accent-primary w-24 h-1.5 rounded-lg appearance-none bg-border" 
              />
              <span className="text-xs font-black w-10">{radius}km</span>
            </div>
          )}
          <button 
            onClick={getLocation} 
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
          >
            <Navigation className="w-4 h-4" /> {userLoc ? "Refresh" : "Find Me"}
          </button>
        </div>
      </header>

      <section className="flex flex-wrap gap-2">
        {[
          { k: "all", l: "All", icon: MapPin },
          { k: "emergency", l: "Emergency", icon: Siren },
          { k: "normal", l: "Standard", icon: Building2 },
        ].map((opt) => (
          <button
            key={opt.k}
            onClick={() => setFilter(opt.k as any)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              filter === opt.k
                ? "bg-foreground text-background border-foreground shadow-lg"
                : "bg-card border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            <opt.icon className="w-4 h-4" /> {opt.l}
          </button>
        ))}
        <button
          onClick={() => setAvailOnly((v) => !v)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
            availOnly
              ? "bg-green-600 text-white border-green-600 shadow-lg"
              : "bg-card border-border text-muted-foreground hover:border-green-500/50"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Available Only
        </button>
      </section>

      <div className="rounded-[2.5rem] overflow-hidden border border-border shadow-2xl bg-card">
        <PropertyMap markers={markers} userLocation={userLoc} height="550px" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {filtered.map((p: any) => (
          <div 
            key={p.id} 
            onClick={() => navigate(`/property/${p.id}`)} 
            className="group cursor-pointer bg-card border border-border rounded-[2rem] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="aspect-[16/10] relative overflow-hidden">
              <img 
                src={p.image_url || "/placeholder.svg"} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt={p.title} 
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {p.is_emergency && <EmergencyBadge />}
              </div>
              <div className="absolute bottom-4 right-4">
                <AvailabilityPill status={p.availability_status} />
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-sm font-black uppercase tracking-tight leading-tight line-clamp-1">{p.title}</h3>
                <div className="flex items-center gap-1 bg-orange-500/10 text-orange-600 px-2 py-1 rounded-lg text-[10px] font-black">
                  <Star className="w-3 h-3 fill-current" /> {ratingFor(p)}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{p.area}</p>
                  <p className="text-lg font-black text-primary mt-0.5">₹{p.rent.toLocaleString()}<span className="text-[10px] text-muted-foreground font-bold">/mo</span></p>
                </div>
                {userLoc && p.dist !== undefined && (
                  <div className="text-right">
                    <span className="block text-[10px] font-black uppercase text-muted-foreground">Distance</span>
                    <span className="text-xs font-black">{p.dist.toFixed(1)} km away</span>
                  </div>
                )}
              </div>

              <a
                href={mapsUrl(p)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.15em] hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Navigation className="w-3.5 h-3.5" />
                Get Directions
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {unmapped.length > 0 && (
        <div className="mt-16 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border"></div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Nearby Offline Listings ({unmapped.length})</h2>
            </div>
            <div className="h-px flex-1 bg-border"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 opacity-75 grayscale-[0.5] hover:grayscale-0 transition-all">
            {unmapped.map((p) => (
              <button key={p.id} onClick={() => navigate(`/property/${p.id}`)} className="text-left bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all">
                <div className="aspect-video relative">
                  <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover" alt={p.title} />
                </div>
                <div className="p-3">
                  <h3 className="text-[10px] font-black uppercase truncate">{p.title}</h3>
                  <p className="text-xs font-black text-primary mt-1">₹{p.rent.toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NearMe;