import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight,
  Sparkles,
  Star,
  MapPin,
  Wallet,
  Siren,
  TrendingDown,
  X,
  Zap,
  IndianRupee,
  LayoutDashboard,
  LogIn,
  Shield,
  Award,
  ArrowDownNarrowWide
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PropertyMap, { MapMarkerData } from "@/components/PropertyMap";
import { EmergencyBadge } from "@/components/StatusBadges";
import { useAuth } from "@/contexts/AuthContext";

interface DBProperty {
  id: string;
  title: string;
  address: string;
  area: string;
  rent: number;
  rating: number;
  image_url: string | null;
  tags: string[];
  has_vr: boolean;
  latitude?: number | null;
  longitude?: number | null;
  is_emergency?: boolean;
  availability_status?: string | null;
}

const Landing = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<DBProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapProps, setMapProps] = useState<DBProperty[]>([]);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const { user, userRole } = useAuth();
  const isLoggedIn = !!user;
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(
    () => typeof window !== "undefined" && localStorage.getItem("featured_emergency_only") === "1"
  );
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating">(
    () => (typeof window !== "undefined" ? (localStorage.getItem("featured_sort") as any) : null) || "default"
  );

  useEffect(() => {
    localStorage.setItem("featured_emergency_only", emergencyOnly ? "1" : "0");
  }, [emergencyOnly]);
  useEffect(() => {
    localStorage.setItem("featured_sort", sortBy);
  }, [sortBy]);
  
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [tempBudget, setTempBudget] = useState("");

  useEffect(() => {
    getFeatured();
    getMapped();
    getRatings();
  }, []);

  const getFeatured = async () => {
    let { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", true)
      .limit(6);

    if (error || !data || data.length === 0) {
      const { data: topRated } = await supabase
        .from("properties")
        .select("*")
        .order("rating", { ascending: false })
        .limit(6);
      setList(topRated || []);
    } else {
      setList(data);
    }
    setLoading(false);
  };

  const getMapped = async () => {
    const { data } = await supabase
      .from("properties")
      .select("id, title, address, area, rent, rating, image_url, tags, has_vr, latitude, longitude, is_emergency")
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .limit(50);
    setMapProps((data as any) || []);
  };

  const getRatings = async () => {
    const { data } = await supabase.from("property_ratings").select("property_id, rating");
    const map: Record<string, { sum: number; count: number }> = {};
    (data || []).forEach((r: any) => {
      if (!map[r.property_id]) map[r.property_id] = { sum: 0, count: 0 };
      map[r.property_id].sum += Number(r.rating) || 0;
      map[r.property_id].count += 1;
    });
    const agg: Record<string, { avg: number; count: number }> = {};
    Object.entries(map).forEach(([k, v]) => {
      agg[k] = { avg: v.count > 0 ? v.sum / v.count : 0, count: v.count };
    });
    setRatings(agg);
  };

  const liveRating = (p: DBProperty) => {
    const r = ratings[p.id];
    if (r && r.count > 0) return r.avg.toFixed(1);
    if (p.rating && p.rating > 0) return Number(p.rating).toFixed(1);
    return "—";
  };

  const handleBudgetOptimization = () => {
    if (!tempBudget) return toast.error("Enter a budget!");
    setShowBudgetModal(false);
    navigate(`/tenant?maxRent=${tempBudget}&optimize=true`);
  };

  const handleBrowse = () => {
    navigate("/properties");
  };

  // --- UPDATED REDIRECT LOGIC ---
  const handleDashboardRedirect = () => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }

    if (userRole === "admin") {
      navigate("/admin");
    } else if (userRole === "landlord") {
      navigate("/landlord");
    } else {
      navigate("/tenant");
    }
  };

  const filters = [
    { i: Wallet, l: "Budget PGs", d: "Smart Optimizer", a: () => setShowBudgetModal(true) },
    { i: Siren, l: "Emergency", d: "Book instantly", a: () => navigate("/tenant?emergency=true") },
    { i: MapPin, l: "Near Me", d: "On the map", a: () => navigate("/near-me") },
    { i: ArrowDownNarrowWide, l: "Compare Now", d: "Side-by-side specs", a: () => navigate("/compare") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-white">
      
      <AnimatePresence>
        {showBudgetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowBudgetModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border p-10 rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <button onClick={() => setShowBudgetModal(false)} className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-primary fill-primary" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic">AI Budget Matcher</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">
                    Analyzing market data to find your <br /> perfect high-value match.
                  </p>
                </div>

                <div className="relative">
                  <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input 
                    autoFocus
                    type="number" 
                    placeholder="Enter Total Budget..." 
                    className="w-full bg-secondary border-none rounded-2xl py-5 pl-12 pr-6 text-sm font-black focus:ring-2 focus:ring-primary/20 transition-all uppercase"
                    value={tempBudget}
                    onChange={(e) => setTempBudget(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleBudgetOptimization}
                  className="w-full py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95"
                >
                  Optimize Selection <ArrowRight className="inline w-4 h-4 ml-2" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center justify-center px-4 pt-16 pb-24 overflow-hidden bg-slate-950">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-60"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-background z-[1]" />
        
        <div className="text-center max-w-3xl mx-auto space-y-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
              <Sparkles className="w-3 h-3 text-primary" /> Premium Rental Experience
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[1.1]">
              FIND RENT <br />
              <span className="text-primary italic">RELAX.</span>
            </h1>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <button onClick={handleBrowse} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-[12px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20">
              Browse Listings <ArrowRight className="w-4 h-4" />
            </button>
            
            <button onClick={handleDashboardRedirect} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white text-[12px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
              {isLoggedIn ? (
                <>
                  {userRole === 'admin' ? <Shield className="w-4 h-4 text-primary" /> : <LayoutDashboard className="w-4 h-4" />}
                  {userRole === 'admin' ? "Admin Hub" : userRole === 'landlord' ? "Landlord Hub" : "Tenant Hub"}
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Login
                </>
              )}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Floating Filter Cards */}
      <div className="container max-w-5xl mx-auto px-4 -mt-16 relative z-30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filters.map((f) => (
            <button 
              key={f.l} 
              onClick={f.a} 
              className="bg-card/90 backdrop-blur-2xl border border-border/50 rounded-[2rem] p-6 text-center space-y-3 hover:border-primary/50 hover:-translate-y-1 transition-all group shadow-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary transition-colors">
                <f.i className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-tight">{f.l}</h3>
                <p className="text-[10px] text-muted-foreground opacity-70">{f.d}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Marketplace Section */}
      <main className="container max-w-6xl mx-auto px-4 py-20 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border/50 pb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-3xl font-black tracking-tight uppercase">Featured Units</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                <Award className="w-3 h-3" /> {list.length}
              </span>
            </div>
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.3em]">High-Performance Living</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <ArrowDownNarrowWide className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-9 pr-3 py-2.5 rounded-xl bg-card border border-border text-[10px] font-black uppercase tracking-widest cursor-pointer hover:border-primary/50 transition-all"
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
            <button
              onClick={() => setEmergencyOnly((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                emergencyOnly
                  ? "bg-red-500 text-white border-red-500 shadow-md"
                  : "bg-card text-muted-foreground border-border hover:border-red-500/50"
              }`}
            >
              <Siren className="w-3.5 h-3.5" /> Emergency Only
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
             <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[1fr,280px] gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(() => {
                let arr = emergencyOnly ? list.filter((p) => p.is_emergency) : [...list];
                if (sortBy === "price-asc") arr.sort((a, b) => a.rent - b.rent);
                else if (sortBy === "price-desc") arr.sort((a, b) => b.rent - a.rent);
                else if (sortBy === "rating") arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                return arr;
              })().map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group cursor-pointer space-y-4" onClick={() => navigate(`/property/${p.id}`)}>
                  <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-500">
                    <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.title} />
                    <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-widest shadow-md">
                        <Award className="w-3 h-3" /> Featured
                      </span>
                      {p.is_emergency && <EmergencyBadge size="md" />}
                    </div>
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-bold text-primary">₹{p.rent.toLocaleString()}</div>
                  </div>
                  <div className="px-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">{p.title}</h3>
                      <div className="flex items-center gap-1 text-orange-500 text-[10px] font-bold" title={ratings[p.id]?.count ? `${ratings[p.id].count} review(s)` : "No reviews yet"}>
                        <Star className="w-3 h-3 fill-current" /> {liveRating(p)}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primary/60" /> {p.address}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <aside className="md:sticky md:top-24 self-start space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-[9px] font-black uppercase tracking-[0.25em] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> Live Map
                </h3>
                <span className="text-[9px] font-bold text-muted-foreground uppercase">{mapProps.length} pins</span>
              </div>
              <PropertyMap
                height="320px"
                markers={mapProps.map((p) => ({
                  id: p.id,
                  lat: p.latitude!,
                  lng: p.longitude!,
                  title: p.title,
                  rent: p.rent,
                  isEmergency: p.is_emergency,
                  onClick: () => navigate(`/property/${p.id}`),
                  detailHref: `/property/${p.id}`,
                })) as MapMarkerData[]}
              />
              {mapProps.length === 0 && (
                <p className="text-[10px] font-bold uppercase text-muted-foreground text-center py-2">No mapped properties yet — landlords can add coordinates.</p>
              )}
            </aside>
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-border/50 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30">© 2026 Made by MV Studios Japan</p>
      </footer>
    </div>
  );
};

export default Landing;