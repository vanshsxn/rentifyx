import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

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

const Properties = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<DBProperty[]>([]);
  const [loading, setLoading] = useState(true);

  const maxRent = searchParams.get("maxRent");
  const featureFilter = searchParams.get("feature");

  useEffect(() => {
    const fetchProperties = async () => {
      let query = supabase.from("properties").select("id, title, address, area, rent, rating, image_url, features, has_vr").order("created_at", { ascending: false });
      if (maxRent) query = query.lte("rent", parseInt(maxRent));
      const { data } = await query;
      let results = (data as DBProperty[]) || [];
      if (featureFilter) {
        results = results.filter(p => (p.features || []).some(f => f.toLowerCase().includes(featureFilter.toLowerCase())));
      }
      setProperties(results);
      setLoading(false);
    };
    fetchProperties();
  }, [maxRent, featureFilter]);

  const filtered = properties.filter(
    (p) => searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Browse Properties</h1>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, area, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading properties...</div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">{filtered.length} properties found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden card-shadow group cursor-pointer"
                  onClick={() => navigate(`/property/${p.id}`)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80"} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-3 right-3 bg-card/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-primary shadow-sm">
                      ₹{p.rent.toLocaleString()}/mo
                    </div>
                    {p.has_vr && (
                      <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-card/90 backdrop-blur-sm text-xs font-semibold text-primary">VR</div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-foreground">{p.title}</h3>
                    <p className="text-xs text-muted-foreground">{p.address}</p>
                    <div className="flex gap-2 pt-1">
                      {(p.features || []).slice(0, 3).map((f) => (
                        <span key={f} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium">{f}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">No properties found.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default Properties;
