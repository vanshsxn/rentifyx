import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Sparkles, 
  Star, 
  MapPin, 
  Maximize, 
  Wallet, 
  Home, 
  Users, 
  TrendingDown, 
  X, 
  Zap, 
  IndianRupee, 
  LayoutDashboard,
  LogIn,
  ShieldCheck,
  Navigation
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
}

const Landing = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<DBProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [tempBudget, setTempBudget] = useState("");

  useEffect(() => {
    checkUser();
    getFeatured();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await (supabase.auth as any).getSession();

      if (session?.user) {
        setIsLoggedIn(true);
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile) setUserRole(profile.role);
      }
    } catch (error) {
      console.error("Auth sync error:", error);
    }
  };

  const getFeatured = async () => {
    let { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("rating", { ascending: false })
      .limit(6);

    if (!error && data) setList(data);
    setLoading(false);
  };

  const handleBudgetOptimization = () => {
    if (!tempBudget) return toast.error("Enter a budget first!");
    setShowBudgetModal(false);
    navigate(`/tenant?maxRent=${tempBudget}&optimize=true`);
  };

  const handleDashboardRedirect = () => {
    if (!isLoggedIn) {
      navigate("/auth");
    } else {
      if (userRole === "landlord") navigate("/landlord");
      else navigate("/tenant");
    }
  };

  const filters = [
    { i: Wallet, l: "Budget PGs", d: "Smart Optimizer", a: () => setShowBudgetModal(true) },
    { i: Home, l: "Furnished", d: "Ready to move", a: () => navigate("/tenant?tag=Furnished") },
    { i: Users, l: "Shared", d: "Split the cost", a: () => navigate("/tenant?tag=Shared") },
    { i: TrendingDown, l: "Premium", d: "Top rated", a: () => navigate("/tenant?sort=rating") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-white">
      
      <AnimatePresence>
        {showBudgetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowBudgetModal(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative w-full max-w-md bg-card border border-border/50 p-10 rounded-[3.5rem] shadow-2xl overflow-hidden"
            >
              <button onClick={() => setShowBudgetModal(false)} className="absolute top-8 right-8 p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="text-center space-y-8">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/20">
                  <Zap className="w-10 h-10 text-primary fill-primary" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic">Budget Matcher</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                    Analyzing properties to find your <br /> absolute best value match.
                  </p>
                </div>

                <div className="relative">
                  <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  <input 
                    autoFocus
                    type="number" 
                    placeholder="Enter Monthly Budget..." 
                    className="w-full bg-secondary border-none rounded-[1.5rem] py-6 pl-14 pr-6 text-lg font-black focus:ring-2 focus:ring-primary/20 transition-all"
                    value={tempBudget}
                    onChange={(e) => setTempBudget(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleBudgetOptimization}
                  className="w-full py-6 bg-primary text-primary-foreground rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                >
                  Find My Best Match <ArrowRight className="inline w-4 h-4 ml-2" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50 z-[1]" />
        
        <div className="text-center max-w-4xl mx-auto space-y-10 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8 }} 
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.3em]">
              <ShieldCheck className="w-4 h-4 text-primary" /> Verified Premium Properties
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9] uppercase">
              Live with <br />
              <span className="text-primary italic relative">
                Authority.
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: "100%" }} 
                  transition={{ delay: 0.5, duration: 1 }}
                  className="absolute -bottom-2 left-0 h-2 bg-primary/30 -z-10" 
                />
              </span>
            </h1>

            <p className="text-lg text-white/50 font-bold max-w-lg mx-auto leading-relaxed uppercase tracking-tight">
              A high-performance marketplace connecting ambitious tenants with premium landlords.
            </p>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <button onClick={() => navigate("/tenant")} className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-[1.5rem] bg-primary text-primary-foreground text-[13px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl shadow-primary/30 group">
              Explore Units <Navigation className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
            
            <button onClick={handleDashboardRedirect} className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 rounded-[1.5rem] bg-white/5 backdrop-blur-xl border border-white/10 text-white text-[13px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
              {isLoggedIn ? (
                <>
                  <LayoutDashboard className="w-4 h-4 text-primary" /> 
                  {userRole === 'landlord' ? "Access Hub" : "My Dashboard"}
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

      {/* --- FEATURED CATEGORIES --- */}
      <div className="container max-w-6xl mx-auto px-4 -mt-24 relative z-30">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {filters.map((f, i) => (
            <motion.button 
              key={f.l} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + (i * 0.1) }}
              onClick={f.a} 
              className="bg-card/80 backdrop-blur-3xl border border-border/50 rounded-[2.5rem] p-8 text-center space-y-4 hover:border-primary/50 hover:-translate-y-2 transition-all group shadow-2xl shadow-black/20"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto group-hover:bg-primary group-hover:rotate-6 transition-all duration-500 shadow-inner">
                <f.i className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div className="space-y-1">
                <h3 className="text-[12px] font-black uppercase tracking-widest">{f.l}</h3>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">{f.d}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* --- MARKETPLACE PREVIEW --- */}
      <main className="container max-w-6xl mx-auto px-4 py-32 space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-black text-[11px] uppercase tracking-[0.4em]">
              <div className="w-8 h-[2px] bg-primary" /> New Arrivals
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Curated Listings</h2>
          </div>
          <button onClick={() => navigate("/tenant")} className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
            Full Marketplace <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
             <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">Syncing Database...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {list.map((p, i) => (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: i * 0.1 }} 
                className="group cursor-pointer space-y-6" 
                onClick={() => navigate(`/property/${p.id}`)}
              >
                <div className="relative aspect-[16/10] rounded-[3rem] overflow-hidden shadow-xl group-hover:shadow-primary/10 transition-all duration-700 border border-border/50">
                  <img 
                    src={p.image_url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800"} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    alt={p.title} 
                  />
                  <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-[12px] font-black text-white border border-white/10">
                    ₹{p.rent.toLocaleString()}
                  </div>
                  {p.has_vr && (
                    <div className="absolute bottom-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-[10px] font-black tracking-widest shadow-2xl">
                      <Maximize className="w-3 h-3" /> VR TOUR
                    </div>
                  )}
                </div>
                
                <div className="px-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors uppercase italic">{p.title}</h3>
                    <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-600 px-3 py-1 rounded-xl text-[11px] font-black">
                      <Star className="w-3.5 h-3.5 fill-current" /> {p.rating?.toFixed(1) || "5.0"}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                    <MapPin className="w-4 h-4 text-primary" /> {p.address || p.area}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* --- FOOTER --- */}
      <footer className="py-20 border-t border-border/50 bg-secondary/20">
        <div className="container max-w-6xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic text-primary">MV Studios Japan</h2>
          <div className="flex justify-center gap-8 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30 pt-4">
            © 2026 High Performance Rental Solutions
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;