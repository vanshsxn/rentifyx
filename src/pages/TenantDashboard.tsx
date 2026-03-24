import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart, Star, MapPin, Box, Filter, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

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

const TenantDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<DBProperty[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetching properties from your new Supabase project
      const { data: props } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      
      setProperties((props as DBProperty[]) || []);

      if (user) {
        const { data: favs } = await supabase
          .from("favorites")
          .select("property_id")
          .eq("user_id", user.id);
        setFavorites((favs || []).map(f => f.property_id));
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const toggleFavorite = async (propertyId: string) => {
    if (!user) { toast.error("Please sign in first"); return; }
    
    if (favorites.includes(propertyId)) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", propertyId);
      setFavorites(prev => prev.filter(id => id !== propertyId));
      toast.success("Removed from favorites");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, property_id: propertyId });
      setFavorites(prev => [...prev, propertyId]);
      toast.success("Saved to favorites!");
    }
  };

  const filtered = properties.filter((p) => 
    searchQuery === "" || 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteProperties = properties.filter(p => favorites.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-10">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold tracking-tight text-foreground"
          >
            Find Your Dream Space
          </motion.h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Curated luxury properties for you
          </p>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search city, neighborhood, or building..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-card/50 backdrop-blur-md shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
          />
        </div>
        <button className="p-4 rounded-2xl border border-border bg-card hover:bg-secondary transition-colors">
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Favorites Section */}
      <AnimatePresence>
        {favoriteProperties.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Heart className="w-5 h-5 text-destructive fill-destructive" /> Saved Collection
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {favoriteProperties.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => navigate(`/property/${p.id}`)}
                  className="min-w-[280px] bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                    <img src={p.image_url || "/placeholder.svg"} className="object-cover w-full h-full" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">{p.title}</h3>
                    <p className="text-primary font-semibold text-xs mt-1">₹{p.rent.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Available Listings</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-card border border-border rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
              >
                {/* Image & Badges */}
                <div className="relative h-56 overflow-hidden" onClick={() => navigate(`/property/${p.id}`)}>
                  <img 
                    src={p.image_url || "/placeholder.svg"} 
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-primary shadow-lg">
                    ₹{p.rent.toLocaleString()}/mo
                  </div>
                  
                  {p.has_vr && (
                    <div className="absolute bottom-4 left-4 bg-primary text-white px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 shadow-xl">
                      <Box className="w-3 h-3" /> VR TOUR
                    </div>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                    className="absolute top-4 left-4 p-2.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-all border border-white/30"
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(p.id) ? "fill-destructive text-destructive" : "text-white"}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1" onClick={() => navigate(`/property/${p.id}`)}>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" /> {p.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg text-orange-600 text-xs font-bold">
                      <Star className="w-3 h-3 fill-current" /> {p.rating || "New"}
                    </div>
                  </div>

                  {/* VR Action - Only for VR properties */}
                  {p.has_vr && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/vr/${p.id}`); }}
                      className="w-full py-3 rounded-xl bg-secondary text-foreground text-xs font-bold hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      Step Inside (VR)
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom Padding for Mobile Nav */}
      <div className="h-10" />
    </div>
  );
};

export default TenantDashboard;