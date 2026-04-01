import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, Sparkles, Star, Building2, Loader2, Filter 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SmartOptimizer = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const { data } = await supabase.from("properties").select("*");
      setProperties(data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // --- THE KAPNSNAK ALGORITHM ---
  const optimizedResults = useMemo(() => {
    const budget = parseFloat(searchQuery);
    
    // 1. Initial Filter by Budget (Knapsack Constraint)
    let filtered = properties.filter(p => {
      if (isNaN(budget)) return true; // Show all if search isn't a number
      return p.rent <= budget;
    });

    // 2. Handle Same-Price Properties (Maximum Amenities Rule)
    // We create a map where the Key is the Price, and the Value is the "Best" property for that price
    const bestValueByPrice: Record<number, any> = {};

    filtered.forEach(p => {
      const amenityCount = (p.features || []).length;
      
      if (!bestValueByPrice[p.rent]) {
        bestValueByPrice[p.rent] = p;
      } else {
        const existingAmenityCount = (bestValueByPrice[p.rent].features || []).length;
        // TIE-BREAKER: Only keep the one with more tags
        if (amenityCount > existingAmenityCount) {
          bestValueByPrice[p.rent] = p;
        }
      }
    });

    // Convert the map back to an array
    const uniqueByPrice = Object.values(bestValueByPrice);

    // 3. Final Sort: Descending order by Amenity Count (Tag Density)
    return uniqueByPrice.sort((a: any, b: any) => {
      const aTags = (a.features || []).length;
      const bTags = (b.features || []).length;
      
      if (bTags !== aTags) {
        return bTags - aTags; // More tags first
      }
      return a.rent - b.rent; // If tags are equal, cheaper price first
    });
  }, [properties, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-foreground">
            Budget <span className="text-primary">Optimizer</span>
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.5em] flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" /> Knapsack Efficiency Mode Active
          </p>
        </div>
        <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">
            {optimizedResults.length} High-Value Matches
          </span>
        </div>
      </div>

      {/* SEARCH / BUDGET INPUT */}
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="w-6 h-6" />
        </div>
        <input 
          type="number"
          placeholder="Enter maximum budget (e.g. 12000)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-16 pr-8 py-7 rounded-[2.5rem] bg-card border-2 border-border focus:border-primary outline-none text-xl font-black shadow-2xl transition-all placeholder:text-muted-foreground/30"
        />
        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Price Filter</span>
        </div>
      </div>

      {/* RESULTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {optimizedResults.map((p, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={p.id}
              className="group bg-card border-2 border-border rounded-[3rem] overflow-hidden hover:border-primary transition-all duration-500 hover:shadow-2xl shadow-primary/5"
            >
              {/* Image Container */}
              <div className="aspect-video relative overflow-hidden">
                <img src={p.image_url || "/placeholder.jpg"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 left-6">
                  <p className="text-white font-black text-2xl tracking-tighter">₹{p.rent.toLocaleString()}</p>
                </div>
                <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-2xl font-black text-[10px] uppercase shadow-xl">
                  Score: {(p.features || []).length} Tags
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase tracking-tight truncate">{p.title}</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Building2 className="w-3 h-3" /> {p.area}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(p.features || []).map((f: string) => (
                    <span key={f} className="px-3 py-1.5 bg-secondary rounded-xl text-[9px] font-black uppercase tracking-tight border border-border group-hover:border-primary/20 transition-colors">
                      {f}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-black text-xs">{p.rating || "5.0"}</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Choice #{idx + 1}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {optimizedResults.length === 0 && (
        <div className="text-center py-32 rounded-[4rem] border-4 border-dashed border-border bg-secondary/10">
          <p className="font-black uppercase tracking-[0.5em] text-muted-foreground/40 text-xl">No Optimal Match Found</p>
        </div>
      )}
    </div>
  );
};

export default SmartOptimizer;