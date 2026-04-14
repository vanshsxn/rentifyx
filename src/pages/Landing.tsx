import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Sparkles, Star, MapPin, Maximize, Wallet, Home, Users,
  X, Zap, IndianRupee, LayoutDashboard, LogIn, Shield, MapPinned,
  GitCompareArrows, AlertTriangle, Phone
} from "lucide-react";
import { useEffect, useState } from "react";
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
  has_vr: boolean;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
}

const Landing = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<DBProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [tempBudget, setTempBudget] = useState("");
  const [showEmergency, setShowEmergency] = useState(false);

  // Real ratings from DB
  const [ratingsMap, setRatingsMap] = useState<Record<string, { avg: number; count: number }>>({});

  // Compare
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    checkUser();
    getFeatured();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setUserRole(roleData?.role || "tenant");
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    } catch (error) {
      console.error("Auth error:", error);
      setIsLoggedIn(false);
    }
  };

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
      data = topRated || [];
    }

    setList(data);

    // Fetch real ratings for all these properties
    if (data.length > 0) {
      const ids = data.map((p: any) => p.id);
      const { data: ratings } = await supabase
        .from("property_ratings")
        .select("property_id, rating")
        .in("property_id", ids);

      if (ratings && ratings.length > 0) {
        const map: Record<string, { total: number; count: number }> = {};
        ratings.forEach((r: any) => {
          if (!map[r.property_id]) map[r.property_id] = { total: 0, count: 0 };
          map[r.property_id].total += Number(r.rating);
          map[r.property_id].count += 1;
        });
        const avgMap: Record<string, { avg: number; count: number }> = {};
        Object.entries(map).forEach(([id, v]) => {
          avgMap[id] = { avg: v.total / v.count, count: v.count };
        });
        setRatingsMap(avgMap);
      }
    }
    setLoading(false);
  };

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
      if (prev.length >= 2) { toast.info("You can compare up to 2 properties"); return prev; }
      return [...prev, id];
    });
  };

  useEffect(() => {
    if (compareIds.length === 2) setShowCompare(true);
  }, [compareIds]);

  const filters = [
    { i: Wallet, l: "Budget PGs", d: "Smart Optimizer", a: () => setShowBudgetModal(true) },
    { i: Home, l: "Furnished", d: "Ready to move", a: () => navigate("/properties?tag=Furnished") },
    { i: Users, l: "Shared", d: "Split the cost", a: () => navigate("/properties?tag=Shared") },
    { i: MapPinned, l: "Near Me", d: "Closest first", a: () => navigate("/properties?sort=distance") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-white">
      
      {/* Emergency Button - Fixed */}
      <button
        onClick={() => setShowEmergency(true)}
        className="fixed top-4 right-4 z-[60] flex items-center gap-2 px-4 py-2.5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg hover:brightness-110 transition-all animate-pulse"
      >
        <AlertTriangle className="w-4 h-4" /> SOS
      </button>

      {/* Emergency Modal */}
      <AnimatePresence>
        {showEmergency && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEmergency(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-card border border-border p-8 rounded-[2rem] shadow-2xl space-y-6">
              <button onClick={() => setShowEmergency(false)} className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full"><X className="w-5 h-5 text-muted-foreground" /></button>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7 text-destructive" />
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight">Emergency</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase">Quick access to help</p>
              </div>
              <div className="space-y-3">
                <a href="tel:100" className="flex items-center gap-3 w-full py-4 px-5 bg-destructive text-destructive-foreground rounded-2xl font-black text-[11px] uppercase tracking-widest hover:brightness-110 transition-all">
                  <Phone className="w-4 h-4" /> Police — 100
                </a>
                <a href="tel:101" className="flex items-center gap-3 w-full py-4 px-5 bg-secondary rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-secondary/80 transition-all">
                  <Phone className="w-4 h-4" /> Fire — 101
                </a>
                <a href="tel:102" className="flex items-center gap-3 w-full py-4 px-5 bg-secondary rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-secondary/80 transition-all">
                  <Phone className="w-4 h-4" /> Ambulance — 102
                </a>
                <a href="tel:1091" className="flex items-center gap-3 w-full py-4 px-5 bg-secondary rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-secondary/80 transition-all">
                  <Phone className="w-4 h-4" /> Women Helpline — 1091
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Budget Modal */}
      <AnimatePresence>
        {showBudgetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBudgetModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-card border border-border p-10 rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <button onClick={() => setShowBudgetModal(false)} className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-full transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-primary fill-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic">AI Budget Matcher</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">Analyzing market data to find your <br /> perfect high-value match.</p>
                </div>
                <div className="relative">
                  <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <input autoFocus type="number" placeholder="Enter Total Budget..." className="w-full bg-secondary border-none rounded-2xl py-5 pl-12 pr-6 text-sm font-black focus:ring-2 focus:ring-primary/20 transition-all uppercase" value={tempBudget} onChange={(e) => setTempBudget(e.target.value)} />
                </div>
                <button onClick={handleBudgetOptimization} className="w-full py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all shadow-xl active:scale-95">
                  Optimize Selection <ArrowRight className="inline w-4 h-4 ml-2" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Compare Drawer */}
      {showCompare && compareIds.length === 2 && (
        <ComparisonDrawer
          propertyIds={compareIds}
          onClose={() => { setShowCompare(false); setCompareIds([]); }}
        />
      )}

      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex items-center justify-center px-4 pt-16 pb-24 overflow-hidden bg-slate-950">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-60">
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
            <button onClick={() => navigate("/properties")} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-[12px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20">
              Browse Listings <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={handleDashboardRedirect} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white text-[12px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
              {isLoggedIn ? (
                <>
                  {userRole === 'admin' ? <Shield className="w-4 h-4 text-primary" /> : <LayoutDashboard className="w-4 h-4" />}
                  {userRole === 'admin' ? "Admin Hub" : userRole === 'landlord' ? "Landlord Hub" : "Tenant Hub"}
                </>
              ) : (
                <><LogIn className="w-4 h-4" /> Login</>
              )}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Floating Filter Cards */}
      <div className="container max-w-5xl mx-auto px-4 -mt-16 relative z-30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filters.map((f) => (
            <button key={f.l} onClick={f.a} className="bg-card/90 backdrop-blur-2xl border border-border/50 rounded-[2rem] p-6 text-center space-y-3 hover:border-primary/50 hover:-translate-y-1 transition-all group shadow-xl">
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

      {/* Compare Bar */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4"
          >
            <GitCompareArrows className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase tracking-widest">{compareIds.length}/2 Selected</span>
            {compareIds.length === 2 && (
              <button onClick={() => setShowCompare(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
                Compare Now
              </button>
            )}
            <button onClick={() => setCompareIds([])} className="p-1 hover:bg-background/20 rounded-full"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marketplace Section */}
      <main className="container max-w-6xl mx-auto px-4 py-20 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border/50 pb-8">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight uppercase">Featured Units</h2>
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.3em]">High-Performance Living</p>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <CubeLoader />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {list.map((p, i) => {
              const realRating = ratingsMap[p.id];
              const displayRating = realRating ? realRating.avg.toFixed(1) : null;
              const isComparing = compareIds.includes(p.id);

              return (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group cursor-pointer space-y-4 relative">
                  {/* Compare checkbox */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleCompare(p.id); }}
                    className={`absolute top-4 left-4 z-20 w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all backdrop-blur-md
                      ${isComparing ? "bg-primary border-primary text-primary-foreground" : "bg-background/70 border-border/50 text-muted-foreground hover:border-primary"}`}
                  >
                    <GitCompareArrows className="w-4 h-4" />
                  </button>

                  <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-500" onClick={() => navigate(`/property/${p.id}`)}>
                    <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.title} />
                    <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-bold text-primary">₹{p.rent.toLocaleString()}</div>
                  </div>
                  <div className="px-2 space-y-1" onClick={() => navigate(`/property/${p.id}`)}>
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">{p.title}</h3>
                      {displayRating ? (
                        <div className="flex items-center gap-1 text-orange-500 text-[10px] font-bold">
                          <Star className="w-3 h-3 fill-current" /> {displayRating}
                          <span className="text-muted-foreground">({realRating.count})</span>
                        </div>
                      ) : (
                        <span className="text-[9px] text-muted-foreground font-bold uppercase">No reviews</span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primary/60" /> {p.address}</p>
                  </div>
                </motion.div>
              );
            })}
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
