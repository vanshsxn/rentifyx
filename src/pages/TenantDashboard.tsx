import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Heart, Star, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
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
      const { data: props } = await supabase
        .from("properties")
        .select("id, title, address, area, rent, rating, image_url, features, has_vr")
        .order("created_at", { ascending: false });
      setProperties((props as DBProperty[]) || []);

      if (user) {
        const { data: favs } = await supabase.from("favorites").select("property_id").eq("user_id", user.id);
        setFavorites((favs || []).map(f => f.property_id));
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const toggleFavorite = async (propertyId: string) => {
    if (!user) { toast.error("Please sign in"); return; }
    if (favorites.includes(propertyId)) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", propertyId);
      setFavorites(prev => prev.filter(id => id !== propertyId));
      toast.success("Removed from favorites");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, property_id: propertyId });
      setFavorites(prev => [...prev, propertyId]);
      toast.success("Added to favorites");
    }
  };

  const filtered = properties.filter(
    (p) => searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteProperties = properties.filter(p => favorites.includes(p.id));

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Find Your Home</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and favorite properties.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        />
      </div>

      {/* Favorites Section */}
      {favoriteProperties.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Heart className="w-4 h-4 text-destructive fill-destructive" /> My Favorites
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteProperties.map((p) => (
              <div key={p.id} onClick={() => navigate(`/property/${p.id}`)} className="bg-card border border-border rounded-xl p-3 card-shadow cursor-pointer hover:border-primary/30 transition-colors flex items-center gap-3">
                <img src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&q=60"} alt={p.title} className="w-14 h-14 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{p.title}</h3>
                  <p className="text-xs text-muted-foreground">₹{p.rent.toLocaleString()}/mo</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Properties */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">All Properties</h2>
        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No properties found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-2xl overflow-hidden card-shadow group cursor-pointer relative"
                onClick={() => navigate(`/property/${p.id}`)}
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-3 right-3 bg-card/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-primary shadow-sm">
                    ₹{p.rent.toLocaleString()}/mo
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                    className="absolute top-3 left-3 p-1.5 rounded-full bg-card/90 backdrop-blur-sm"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(p.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-foreground text-sm">{p.title}</h3>
                    <span className="flex items-center gap-1 text-orange-500 text-xs font-bold">
                      <Star className="w-3 h-3 fill-current" /> {p.rating}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {p.address}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
export default TenantDashboard;
