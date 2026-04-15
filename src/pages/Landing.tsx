import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Sparkles, Star, MapPin, Wallet, Home, Users,
  X, Zap, IndianRupee, LayoutDashboard, LogIn, Shield, MapPinned,
  GitCompareArrows, AlertTriangle, Phone, Search, Bell, Menu,
  Building2, Bed, Bath, Maximize, Navigation, Clock, Wifi, Wind,
  Tv, UtensilsCrossed, ChevronRight
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CubeLoader from "@/components/CubeLoader";
import ComparisonDrawer from "@/components/ComparisonDrawer";

interface DBProperty {
  id: string;
  title: string;
  address: string;
  area: string;
  rent: number;
  rating: number;
  image_url: string | null;
  tags: string[];
  features: string[] | null;
  has_vr: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  latitude: number | null;
  longitude: number | null;
  furnish_type: string | null;
  sharing_type: string | null;
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const Landing = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<DBProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [tempBudget, setTempBudget] = useState("");
  const [showEmergency, setShowEmergency] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState("Detecting...");

  const [ratingsMap, setRatingsMap] = useState<Record<string, { avg: number; count: number }>>({});
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [compareProperties, setCompareProperties] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
    getFeatured();
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationName("Your Location");
          // Try reverse geocoding
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
            .then(r => r.json())
            .then(d => {
              const city = d.address?.city || d.address?.town || d.address?.village || "";
              const country = d.address?.country || "";
              if (city) setLocationName(`${city}, ${country}`);
            })
            .catch(() => {});
        },
        () => setLocationName("Location unavailable")
      );
    }
  };

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle();
        setUserRole(roleData?.role || "tenant");
      }
    } catch { setIsLoggedIn(false); }
  };

  const getFeatured = async () => {
    let { data } = await supabase.from("properties").select("*").eq("is_featured", true).limit(8);
    if (!data || data.length === 0) {
      const { data: fallback } = await supabase.from("properties").select("*").order("rating", { ascending: false }).limit(8);
      data = fallback || [];
    }
    setList(data);
    if (data.length > 0) {
      const ids = data.map((p: any) => p.id);
      const { data: ratings } = await supabase.from("property_ratings").select("property_id, rating").in("property_id", ids);
      if (ratings && ratings.length > 0) {
        const map: Record<string, { total: number; count: number }> = {};
        ratings.forEach((r: any) => {
          if (!map[r.property_id]) map[r.property_id] = { total: 0, count: 0 };
          map[r.property_id].total += Number(r.rating);
          map[r.property_id].count += 1;
        });
        const avgMap: Record<string, { avg: number; count: number }> = {};
        Object.entries(map).forEach(([id, v]) => { avgMap[id] = { avg: v.total / v.count, count: v.count }; });
        setRatingsMap(avgMap);
      }
    }
    setLoading(false);
  };

  const getDistance = useCallback((p: DBProperty) => {
    if (!userLocation || !p.latitude || !p.longitude) return null;
    return haversineDistance(userLocation.lat, userLocation.lng, p.latitude, p.longitude);
  }, [userLocation]);

  const sortedByDistance = [...list].sort((a, b) => {
    const da = getDistance(a);
    const db = getDistance(b);
    if (da === null && db === null) return 0;
    if (da === null) return 1;
    if (db === null) return -1;
    return da - db;
  });

  const handleBudgetOptimization = () => {
    if (!tempBudget) return toast.error("Enter a budget!");
    setShowBudgetModal(false);
    navigate(`/tenant?maxRent=${tempBudget}&optimize=true`);
  };

  const handleDashboardRedirect = () => {
    if (!isLoggedIn) { navigate("/auth"); return; }
    if (userRole === "admin") navigate("/admin");
    else if (userRole === "landlord") navigate("/landlord");
    else navigate("/tenant");
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) { toast.info("Max 2 properties to compare"); return prev; }
      return [...prev, id];
    });
  };

  useEffect(() => {
    if (compareIds.length === 2) {
      const props = compareIds.map(cid => list.find(p => p.id === cid)).filter(Boolean);
      setCompareProperties(props);
      setShowCompare(true);
    }
  }, [compareIds, list]);

  const filteredList = searchQuery
    ? list.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.area.toLowerCase().includes(searchQuery.toLowerCase()))
    : sortedByDistance;

  const filters = [
    { icon: Wallet, label: "BUDGET PGs", desc: "₹ 5,000 - ₹ 15,000", action: () => setShowBudgetModal(true), color: "from-blue-500/10 to-blue-600/5", extra: (
      <div className="mt-2 w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full w-3/5 bg-primary rounded-full" />
      </div>
    )},
    { icon: Home, label: "FURNISHED", desc: "Ready to move", action: () => navigate("/furnished"), color: "from-green-500/10 to-green-600/5", extra: (
      <div className="mt-2 flex items-center gap-2 text-[9px]">
        <span className="flex items-center gap-1 text-primary font-bold">● Fully Furnished</span>
        <span className="text-muted-foreground">Minimal Setup</span>
      </div>
    )},
    { icon: Users, label: "SHARED", desc: "Split the cost", action: () => navigate("/shared"), color: "from-purple-500/10 to-purple-600/5", extra: (
      <div className="mt-2 text-[9px] space-y-0.5">
        <p className="text-muted-foreground">Total Rent: <span className="font-bold text-foreground">₹ 18,000</span></p>
        <p className="text-primary font-bold">Split (3 people): ₹ 6000 each</p>
      </div>
    )},
    { icon: MapPinned, label: "NEAR ME", desc: "Closest first", action: () => navigate("/properties?sort=distance"), color: "from-orange-500/10 to-orange-600/5", extra: (
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-[9px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold">● Smart Sort</span>
        <span className="text-[9px] px-2 py-0.5 bg-secondary rounded-full font-bold text-muted-foreground">Closest</span>
      </div>
    )},
  ];

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", action: handleDashboardRedirect },
    { icon: Building2, label: "My Listings", action: () => navigate(userRole === "landlord" ? "/landlord" : "/tenant") },
    { icon: Search, label: "Browse Properties", action: () => navigate("/properties") },
    { icon: MapPinned, label: "Near Me", action: () => navigate("/properties?sort=distance") },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-secondary">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <MapPin className="w-6 h-6 text-primary" />
              <span className="text-xl font-black tracking-tight">Rentifyx</span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search PG..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-secondary/50 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEmergency(true)}
              className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-xl text-[11px] font-bold hover:bg-destructive/20 transition-all border border-destructive/20"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Emergency Stay</span>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black">ON</span>
            </button>
            <button className="p-2 rounded-lg hover:bg-secondary relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <button
              onClick={() => isLoggedIn ? navigate("/profile") : navigate("/auth")}
              className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20"
            >
              {isLoggedIn ? (
                <span className="text-sm font-bold text-primary">
                  {userRole?.charAt(0).toUpperCase() || "U"}
                </span>
              ) : (
                <LogIn className="w-4 h-4 text-primary" />
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-col w-56 min-h-[calc(100vh-4rem)] border-r border-border bg-card/50 p-4">
          <nav className="space-y-1 flex-1">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          {userRole === "landlord" && (
            <button
              onClick={() => navigate("/landlord")}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:brightness-110 transition-all mt-4"
            >
              + Post Property
            </button>
          )}
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
              <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="fixed left-0 top-0 bottom-0 w-64 bg-card z-50 p-4 border-r border-border lg:hidden">
                <div className="flex items-center gap-2 mb-8 px-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="text-lg font-black">Rentifyx</span>
                  <button onClick={() => setSidebarOpen(false)} className="ml-auto p-1"><X className="w-5 h-5" /></button>
                </div>
                <nav className="space-y-1">
                  {sidebarItems.map((item) => (
                    <button key={item.label} onClick={() => { item.action(); setSidebarOpen(false); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                      <item.icon className="w-4 h-4" /> {item.label}
                    </button>
                  ))}
                </nav>
                {userRole === "landlord" && (
                  <button onClick={() => { navigate("/landlord"); setSidebarOpen(false); }} className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold mt-6">+ Post Property</button>
                )}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8 space-y-8 max-w-[1200px]">
            {/* Title Bar */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
                Find the Best PGs Around You!
              </h1>
              <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium">{locationName}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {filters.map((f) => (
                <button
                  key={f.label}
                  onClick={f.action}
                  className={`bg-gradient-to-br ${f.color} border border-border/50 rounded-2xl p-4 lg:p-5 text-left space-y-2 hover:border-primary/40 hover:-translate-y-0.5 transition-all group`}
                >
                  <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-tight">{f.label}</h3>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                  {f.extra}
                </button>
              ))}
            </div>

            {/* Emergency Places Nearby + Map */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Property Cards */}
              <div className="flex-1 space-y-4">
                <h2 className="text-xl font-black tracking-tight">Emergency Places Nearby</h2>

                {loading ? (
                  <div className="h-48 flex items-center justify-center"><CubeLoader /></div>
                ) : (
                  <>
                    {/* Horizontal scroll cards */}
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                      {filteredList.slice(0, 6).map((p, i) => {
                        const dist = getDistance(p);
                        const realRating = ratingsMap[p.id];
                        const isComparing = compareIds.includes(p.id);

                        return (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="min-w-[280px] snap-start bg-card border border-border rounded-2xl overflow-hidden group hover:shadow-lg transition-all"
                          >
                            <div className="relative h-40 overflow-hidden cursor-pointer" onClick={() => navigate(`/property/${p.id}`)}>
                              <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.title} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                              {dist !== null && (
                                <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-primary" /> {dist.toFixed(1)} km
                                </div>
                              )}
                              {/* Compare btn */}
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleCompare(p.id); }}
                                className={`absolute top-3 left-3 w-7 h-7 rounded-lg flex items-center justify-center border transition-all backdrop-blur-sm
                                  ${isComparing ? "bg-primary border-primary text-primary-foreground" : "bg-card/70 border-border/50 text-muted-foreground hover:border-primary"}`}
                              >
                                <GitCompareArrows className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="p-3 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="font-bold text-sm truncate">{p.title}</h3>
                                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    {dist !== null && <span>{dist.toFixed(1)} km away</span>}
                                    {!dist && <span>{p.area}</span>}
                                  </p>
                                </div>
                                <p className="text-sm font-black text-primary whitespace-nowrap">₹{p.rent.toLocaleString()}<span className="text-[9px] font-normal text-muted-foreground">/mo</span></p>
                              </div>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-1">
                                {[...(p.tags || []), ...(p.features || [])].filter(Boolean).slice(0, 2).map(tag => (
                                  <span key={tag} className="text-[8px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold">{tag}</span>
                                ))}
                                {p.bedrooms && (
                                  <span className="text-[8px] px-2 py-0.5 bg-secondary rounded-full font-bold text-muted-foreground flex items-center gap-0.5">
                                    <Bed className="w-2.5 h-2.5" /> {p.bedrooms}
                                  </span>
                                )}
                              </div>

                              {/* Amenity icons + actions */}
                              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                                <div className="flex items-center gap-1.5">
                                  {realRating && (
                                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-500">
                                      <Star className="w-3 h-3 fill-current" /> {realRating.avg.toFixed(1)}
                                    </span>
                                  )}
                                  <Wifi className="w-3 h-3 text-muted-foreground" />
                                  <Wind className="w-3 h-3 text-muted-foreground" />
                                  <Tv className="w-3 h-3 text-muted-foreground" />
                                </div>
                                <button
                                  onClick={() => navigate(`/property/${p.id}`)}
                                  className="text-[9px] font-bold px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 transition-all"
                                >
                                  View
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Vertical list below */}
                    <div className="space-y-3">
                      {filteredList.slice(6, 10).map((p, i) => {
                        const dist = getDistance(p);
                        const realRating = ratingsMap[p.id];
                        return (
                          <motion.div
                            key={p.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex gap-4 bg-card border border-border rounded-xl p-3 hover:shadow-md transition-all cursor-pointer group"
                            onClick={() => navigate(`/property/${p.id}`)}
                          >
                            <div className="w-24 h-20 rounded-lg overflow-hidden shrink-0">
                              <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={p.title} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-bold text-sm truncate">{p.title}</h3>
                                <p className="text-sm font-black text-primary whitespace-nowrap">₹{p.rent.toLocaleString()}<span className="text-[9px] font-normal text-muted-foreground">/mo</span></p>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                {dist !== null && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{dist.toFixed(1)} km away</span>}
                                {realRating && <span className="flex items-center gap-0.5 text-orange-500 font-bold"><Star className="w-3 h-3 fill-current" />{realRating.avg.toFixed(1)}</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                {[...(p.tags || [])].filter(Boolean).slice(0, 2).map(tag => (
                                  <span key={tag} className="text-[8px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold">{tag}</span>
                                ))}
                                <button className="ml-auto text-[9px] font-bold px-3 py-1 border border-border rounded-lg hover:border-primary transition-all" onClick={(e) => { e.stopPropagation(); navigate(`/property/${p.id}`); }}>
                                  Navigate
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Map Section */}
              <div className="w-full lg:w-[380px] shrink-0">
                <div className="sticky top-20 rounded-2xl overflow-hidden border border-border bg-card shadow-sm h-[400px] lg:h-[520px]">
                  <iframe
                    title="Nearby Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation ? `${userLocation.lng - 0.05},${userLocation.lat - 0.05},${userLocation.lng + 0.05},${userLocation.lat + 0.05}` : '77.35,28.55,77.45,28.65'}&layer=mapnik${userLocation ? `&marker=${userLocation.lat},${userLocation.lng}` : ''}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Compare Bar */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
            <GitCompareArrows className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase tracking-widest">{compareIds.length}/2 Selected</span>
            {compareIds.length === 2 && (
              <button onClick={() => setShowCompare(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase hover:brightness-110 transition-all">Compare Now</button>
            )}
            <button onClick={() => setCompareIds([])} className="p-1 hover:bg-background/20 rounded-full"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Drawer */}
      {showCompare && compareProperties.length === 2 && (
        <ComparisonDrawer properties={compareProperties} onClose={() => { setShowCompare(false); setCompareIds([]); setCompareProperties([]); }} />
      )}

      {/* Emergency Modal */}
      <AnimatePresence>
        {showEmergency && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEmergency(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-card border border-border p-8 rounded-3xl shadow-2xl space-y-6">
              <button onClick={() => setShowEmergency(false)} className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full"><X className="w-5 h-5" /></button>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto"><AlertTriangle className="w-7 h-7 text-destructive" /></div>
                <h2 className="text-xl font-black uppercase">Emergency</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Quick access to help</p>
              </div>
              <div className="space-y-3">
                <a href="tel:100" className="flex items-center gap-3 w-full py-4 px-5 bg-destructive text-destructive-foreground rounded-2xl font-black text-[11px] uppercase tracking-widest"><Phone className="w-4 h-4" /> Police — 100</a>
                <a href="tel:101" className="flex items-center gap-3 w-full py-4 px-5 bg-secondary rounded-2xl font-black text-[11px] uppercase tracking-widest"><Phone className="w-4 h-4" /> Fire — 101</a>
                <a href="tel:102" className="flex items-center gap-3 w-full py-4 px-5 bg-secondary rounded-2xl font-black text-[11px] uppercase tracking-widest"><Phone className="w-4 h-4" /> Ambulance — 102</a>
                <a href="tel:1091" className="flex items-center gap-3 w-full py-4 px-5 bg-secondary rounded-2xl font-black text-[11px] uppercase tracking-widest"><Phone className="w-4 h-4" /> Women Helpline — 1091</a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Budget Modal */}
      <AnimatePresence>
        {showBudgetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBudgetModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-card border border-border p-10 rounded-3xl shadow-2xl">
              <button onClick={() => setShowBudgetModal(false)} className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-full"><X className="w-5 h-5 text-muted-foreground" /></button>
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto"><Zap className="w-8 h-8 text-primary fill-primary" /></div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic">AI Budget Matcher</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Find the best match for your budget</p>
                </div>
                <div className="relative">
                  <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input autoFocus type="number" placeholder="Enter Total Budget..." className="w-full bg-secondary border-none rounded-2xl py-5 pl-12 pr-6 text-sm font-black focus:ring-2 focus:ring-primary/20 transition-all" value={tempBudget} onChange={(e) => setTempBudget(e.target.value)} />
                </div>
                <button onClick={handleBudgetOptimization} className="w-full py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95">
                  Optimize Selection <ArrowRight className="inline w-4 h-4 ml-2" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="py-8 border-t border-border/50 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30">© 2026 Made by MV Studios Japan</p>
      </footer>
    </div>
  );
};

export default Landing;
