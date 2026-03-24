import { useNavigate } from "react-router-dom"; 
import { motion } from "framer-motion"; 
import { ArrowRight, Building2, Sparkles, Star, MapPin, Maximize, Wallet, Home, Users, TrendingDown } from "lucide-react"; 
import { useEffect, useState } from "react"; 
import { supabase } from "@/integrations/supabase/client";

interface DBProperty { 
  id: string; 
  title: string; 
  address: string; 
  area: string; 
  rent: number; 
  rating: number; 
  image_url: string | null; 
  features: string[]; 
  has_vr: boolean; 
}

const Landing = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<DBProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getFeatured = async () => {
      // Logic: Try to get featured first, if empty, get top 6 rated properties
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
    getFeatured();
  }, []);

  const filters = [
    { i: Wallet, l: "Budget PGs", d: "Under ₹5,000", a: () => navigate("/tenant?maxRent=5000") },
    { i: Home, l: "Furnished", d: "Ready to move", a: () => navigate("/tenant?feature=Furnished") },
    { i: Users, l: "Shared", d: "Split the cost", a: () => navigate("/tenant?feature=Shared") },
    { i: TrendingDown, l: "Best Deals", d: "Top rated", a: () => navigate("/tenant?sort=value") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-white">
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-20 pb-32 overflow-hidden bg-slate-950">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-50 pointer-events-none scale-105" 
          src="/hero-video.mp4" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background z-[1]" />
        
        <div className="text-center max-w-4xl mx-auto space-y-10 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1, ease: "easeOut" }} 
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white text-[11px] font-black uppercase tracking-[0.3em]">
              <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" /> Redefining Rental Luxury
            </div>
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter text-white leading-[0.8] drop-shadow-2xl">
              FIND RENT <br />
              <span className="text-primary italic drop-shadow-none">RELAX.</span>
            </h1>
            <p className="text-xl text-white/70 font-medium max-w-lg mx-auto leading-relaxed drop-shadow-md">
              The high-performance platform for modern tenants, landlords, and administrators.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-5" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.6 }}
          >
            <button 
              onClick={() => navigate("/tenant")} 
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-6 rounded-[2rem] bg-primary text-primary-foreground text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_50px_rgba(99,102,241,0.3)]"
            >
              Browse Marketplace <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate("/auth")} 
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-6 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 text-white text-sm font-black uppercase tracking-widest hover:bg-white/20 transition-all"
            >
              <Building2 className="w-5 h-5" /> Landlord Hub
            </button>
          </motion.div>
        </div>
      </section>

      {/* Floating Filter Grid */}
      <div className="container max-w-6xl mx-auto px-4 -mt-24 relative z-30">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {filters.map((f, idx) => (
            <motion.button 
              key={f.l} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + (idx * 0.1) }}
              onClick={f.a} 
              className="bg-card/80 backdrop-blur-3xl border border-border/50 rounded-[3rem] p-10 text-center space-y-4 hover:border-primary/50 hover:-translate-y-3 transition-all active:scale-95 group shadow-2xl shadow-black/20"
            >
              <div className="w-16 h-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary transition-all duration-500">
                <f.i className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider">{f.l}</h3>
                <p className="text-[10px] text-muted-foreground font-bold opacity-60 mt-1 uppercase tracking-tighter">{f.d}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Featured Grid */}
      <main className="container max-w-7xl mx-auto px-6 py-32 space-y-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-border/50 pb-10">
          <div className="space-y-3">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">Featured Units</h2>
            <p className="text-[12px] text-primary font-black uppercase tracking-[0.4em] opacity-80">High-Performance Living</p>
          </div>
          <button 
            onClick={() => navigate("/tenant")} 
            className="group flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-foreground hover:text-primary transition-colors"
          >
            View All Marketplace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-4">
             <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground">Syncing Database...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
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
                <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl group-hover:shadow-primary/20 transition-all duration-500">
                  <img 
                    src={p.image_url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000"} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    alt={p.title}
                  />
                  <div className="absolute top-6 right-6 bg-background/90 backdrop-blur-xl px-5 py-2.5 rounded-2xl text-[13px] font-black text-primary shadow-xl">
                    ₹{p.rent.toLocaleString()}
                  </div>
                  {p.has_vr && (
                    <div className="absolute bottom-6 left-6 flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black tracking-widest shadow-2xl animate-bounce">
                      <Maximize className="w-3.5 h-3.5" /> VR AVAILABLE
                    </div>
                  )}
                </div>
                
                <div className="px-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black tracking-tighter group-hover:text-primary transition-colors">{p.title}</h3>
                    <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1 rounded-full text-orange-500 text-[11px] font-black border border-orange-500/20">
                      <Star className="w-3.5 h-3.5 fill-current" /> {p.rating || "5.0"}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" /> {p.address}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-border/50 bg-card/30 backdrop-blur-sm text-center">
        <div className="space-y-6">
          <div className="text-2xl font-black tracking-tighter">Rentify<span className="text-primary">X</span></div>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40">
            © 2026 Made by MV Studios Japan
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;