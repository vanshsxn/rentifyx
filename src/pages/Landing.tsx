import { useNavigate } from "react-router-dom"; 
import { motion, AnimatePresence } from "framer-motion"; 
import { ArrowRight, Building2, Sparkles, Star, MapPin, Maximize, Wallet, Home, Users, TrendingDown, X, Zap, IndianRupee, LayoutDashboard } from "lucide-react"; 
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
    const { data: { user } } = await (supabase.auth as any).getUser();
    
    if (user) {
      setIsLoggedIn(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setUserRole(profile?.role || "tenant");
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
      setList(topRated || []);
    } else {
      setList(data);
    }
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
    { i: TrendingDown, l: "Best Deals", d: "Top rated", a: () => navigate("/tenant?sort=value") },
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
                    We'll use the Knapsack Algorithm to find the <br /> highest-value property for your money.
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

      {/* Cinematic Hero Section with local video */}
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
            <p className="text-base text-white/60 font-medium max-w-md mx-auto leading-relaxed">
              The high-performance platform for modern tenants and landlords.
            </p>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <button onClick={() => navigate("/tenant")} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground text-[12px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-primary/20">
              Browse Listings <ArrowRight className="w-4 h-4" />
            </button>
            
            <button onClick={handleDashboardRedirect} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white text-[12px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
              {isLoggedIn ? (
                <>
                  <LayoutDashboard className="w-4 h-4" /> 
                  {userRole === 'landlord' ? "Landlord Hub" : "Tenant Hub"}
                </>
              ) : (
                <>
                  <Building2 className="w-4 h-4" /> Landlord Hub
                </>
              )}
            </button>
          </motion.div>
        </div>
      </section>

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

      <main className="container max-w-6xl mx-auto px-4 py-20 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-border/50 pb-8">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight uppercase">Featured Units</h2>
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.3em]">High-Performance Living</p>
          </div>
          <button onClick={() => navigate("/tenant")} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1">
            View All Marketplace
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
             <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
             <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Syncing...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {list.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group cursor-pointer space-y-4" onClick={() => navigate(`/property/${p.id}`)}>
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-500">
                  <img src={p.image_url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.title} />
                  <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-bold text-primary">₹{p.rent.toLocaleString()}</div>
                  {p.has_vr && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-[9px] font-bold tracking-widest shadow-lg"><Maximize className="w-3 h-3" /> VR</div>
                  )}
                </div>
                <div className="px-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold tracking-tight group-hover:text-primary transition-colors">{p.title}</h3>
                    <div className="flex items-center gap-1 text-orange-500 text-[10px] font-bold"><Star className="w-3 h-3 fill-current" /> {p.rating || "5.0"}</div>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase flex items-center gap-1.5"><MapPin className="w-3 h-3 text-primary/60" /> {p.address}</p>
                </div>
              </motion.div>
            ))}
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