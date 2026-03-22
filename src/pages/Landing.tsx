import { useNavigate } from "react-router-dom"; import { motion } from "framer-motion"; import { ArrowRight, Building2, Sparkles, Star, MapPin, Maximize, Wallet, Home, Users, TrendingDown } from "lucide-react"; import { useEffect, useState } from "react"; import { supabase } from "@/integrations/supabase/client";

interface DBProperty { id: string; title: string; address: string; area: string; rent: number; rating: number; image_url: string | null; features: string[]; has_vr: boolean; }

const Landing = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<DBProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getFeatured = async () => {
      const { data } = await supabase.from("properties").select("*").eq("is_featured", true).limit(6);
      setList(data || []);
      setLoading(false);
    };
    getFeatured();
  }, []);

  const filters = [
    { i: Wallet, l: "Budget PGs", d: "Under ₹5,000", a: () => navigate("/properties?maxRent=5000") },
    { i: Home, l: "Furnished", d: "Ready to move", a: () => navigate("/properties?feature=Furnished") },
    { i: Users, l: "Shared", d: "Split the cost", a: () => navigate("/properties?feature=Shared") },
    { i: TrendingDown, l: "Best Deals", d: "Top rated", a: () => navigate("/properties?sort=value") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Cinematic Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center px-4 overflow-hidden bg-slate-900">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-60 pointer-events-none" src="/hero-video.mp4" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background z-[1]" />
        
        <div className="text-center max-w-3xl mx-auto space-y-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles className="w-3 h-3" /> Redefining Rental
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]">
              FIND RENT. <br />
              <span className="text-primary italic">RELAX.</span>
            </h1>
            <p className="text-lg text-white/80 font-medium max-w-md mx-auto leading-relaxed drop-shadow-md">
              The high-performance platform for modern tenants, landlords, and administrators.
            </p>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <button onClick={() => navigate("/properties")} className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-primary/20">
              Browse Listings <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/auth")} className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              <Building2 className="w-4 h-4" /> Landlord Hub
            </button>
          </motion.div>
        </div>
      </section>

      {/* Floating Filter Grid */}
      <div className="container max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filters.map((f) => (
            <button key={f.l} onClick={f.a} className="bg-card/80 backdrop-blur-2xl border border-border rounded-[2rem] p-6 text-center space-y-3 hover:border-primary/50 hover:-translate-y-2 transition-all active:scale-95 group shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary transition-colors">
                <f.i className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-tight">{f.l}</h3>
                <p className="text-[10px] text-muted-foreground font-bold">{f.d}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Grid */}
      <main className="container max-w-6xl mx-auto px-4 py-24 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tighter uppercase">Featured Units</h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Selected for high-performance living</p>
          </div>
          <button onClick={() => navigate("/properties")} className="text-[10px] font-black uppercase tracking-widest text-primary border-b-2 border-primary pb-1">View All Marketplace</button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Syncing...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {list.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group cursor-pointer space-y-4" onClick={() => navigate(`/property/${p.id}`)}>
                <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-lg group-hover:shadow-2xl transition-all">
                  <img src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute top-5 right-5 bg-background/90 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black text-primary">₹{p.rent.toLocaleString()}</div>
                  {p.has_vr && <div className="absolute bottom-5 right-5 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-[10px] font-black"><Maximize className="w-3 h-3" /> VR</div>}
                </div>
                <div className="px-2 space-y-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black tracking-tighter leading-tight">{p.title}</h3>
                    <div className="flex items-center gap-1 text-orange-500 text-[10px] font-black"><Star className="w-3 h-3 fill-current" /> {p.rating}</div>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.address}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-border/50 text-center mt-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">© 2026 Made by MV Studios Japan</p>
      </footer>
    </div>
  );
};

export default Landing;