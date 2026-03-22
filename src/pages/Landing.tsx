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
  const [featured, setFeatured] = useState<DBProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from("properties")
        .select("id, title, address, area, rent, rating, image_url, features, has_vr")
        .eq("is_featured", true)
        .limit(6);
      setFeatured(data || []);
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  const quickFilters = [
    { icon: Wallet, label: "Budget PGs", desc: "Under ₹5,000/mo", action: () => navigate("/properties?maxRent=5000") },
    { icon: Home, label: "Furnished", desc: "Ready to move in", action: () => navigate("/properties?feature=Furnished") },
    { icon: Users, label: "Shared Rooms", desc: "Split the cost", action: () => navigate("/properties?feature=Shared") },
    { icon: TrendingDown, label: "Best Deals", desc: "Top rated & affordable", action: () => navigate("/properties?sort=value") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero with Video */}
      <div className="relative pt-24 pb-20 flex items-center justify-center px-4 overflow-hidden min-h-[600px] bg-slate-900">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0 opacity-80" src="/hero-video.mp4" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-background z-[1]" />
        <div className="text-center max-w-2xl mx-auto space-y-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold shadow-lg shadow-primary/20">
              <Sparkles className="w-3.5 h-3.5" /> Rental made simple
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg leading-[1.1]">
              Find Rent,<br />
              <span className="text-primary-foreground bg-primary px-4 py-1 rounded-lg inline-block mt-2">Relax.</span>
            </h1>
            <p className="text-lg text-white/90 font-medium max-w-md mx-auto leading-relaxed drop-shadow-md">
              The minimalist platform for tenants, landlords, and administrators. Stress-free rental experience.
            </p>
          </motion.div>
          <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <button onClick={() => navigate("/properties")} className="flex items-center gap-2 px-8 py-4 rounded-xl gradient-primary text-primary-foreground text-sm font-bold transition-all hover:scale-105 shadow-2xl">
              Browse Properties <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate("/auth")} className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold transition-all hover:bg-white/20">
              <Building2 className="w-4 h-4" /> Landlord Portal
            </button>
          </motion.div>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <motion.div className="container max-w-4xl mx-auto px-4 pb-20 -mt-10 relative z-20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickFilters.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} onClick={item.action} className="bg-card border border-border rounded-xl p-5 card-shadow text-center space-y-3 hover:border-primary/30 hover:shadow-elevated transition-all active:scale-[0.97] group">
                <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                <p className="text-[11px] text-muted-foreground leading-tight">{item.desc}</p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Featured Listings - from DB */}
      <section className="container max-w-6xl mx-auto px-4 py-16 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Featured Listings</h2>
          <p className="text-muted-foreground">Hand-picked properties just for you</p>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading listings...</div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No featured listings yet. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -5 }}
                className="bg-card border border-border rounded-2xl overflow-hidden card-shadow group cursor-pointer"
                onClick={() => navigate(`/property/${p.id}`)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-3 right-3 bg-card/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-primary shadow-sm">
                    ₹{p.rent.toLocaleString()}/mo
                  </div>
                  {p.has_vr && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-card/90 backdrop-blur-sm text-xs font-semibold text-primary">
                      <Maximize className="w-3 h-3" /> VR
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-foreground">{p.title}</h3>
                    <div className="flex items-center gap-1 text-orange-500 text-sm font-bold">
                      <Star className="w-3 h-3 fill-current" /> {p.rating}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-xs">
                    <MapPin className="w-3 h-3" /> {p.address}
                  </div>
                  <div className="flex gap-2 pt-1">
                    {(p.features || []).slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <footer className="py-10 border-t border-border mt-auto">
        <p className="text-xs text-muted-foreground tracking-wide text-center">© 2026 Made by MV Studios Japan.</p>
      </footer>
    </div>
  );
};
export default Landing;
