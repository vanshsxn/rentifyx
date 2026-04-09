import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, Sparkles, Star, Building2, Loader2, Filter, TrendingUp, IndianRupee, Bed, Bath, Maximize, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SmartOptimizer = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const { data } = await supabase.from("properties").select("*");
      setProperties(data || []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const optimizedResults = useMemo(() => {
    const budget = parseFloat(searchQuery);
    
    let filtered = properties.filter(p => {
      if (isNaN(budget)) return true;
      return p.rent <= budget;
    });

    const bestValueByPrice: Record<number, any> = {};
    filtered.forEach(p => {
      const amenityCount = (p.features || []).length;
      if (!bestValueByPrice[p.rent]) {
        bestValueByPrice[p.rent] = p;
      } else {
        const existingAmenityCount = (bestValueByPrice[p.rent].features || []).length;
        if (amenityCount > existingAmenityCount) {
          bestValueByPrice[p.rent] = p;
        }
      }
    });

    const uniqueByPrice = Object.values(bestValueByPrice);

    return uniqueByPrice.sort((a: any, b: any) => {
      const aTags = (a.features || []).length;
      const bTags = (b.features || []).length;
      if (bTags !== aTags) return bTags - aTags;
      return a.rent - b.rent;
    });
  }, [properties, searchQuery]);

  const budget = parseFloat(searchQuery);
  const savings = !isNaN(budget) && optimizedResults.length > 0
    ? budget - optimizedResults[0]?.rent
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-foreground">
            Budget <span className="text-primary">Optimizer</span>
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" /> Knapsack Efficiency Mode
          </p>
        </div>
        <div className="flex items-center gap-3">
          {savings !== null && savings > 0 && (
            <div className="bg-green-500/10 text-green-600 px-4 py-2 rounded-2xl border border-green-500/20">
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Save ₹{savings.toLocaleString()}
              </span>
            </div>
          )}
          <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              {optimizedResults.length} Matches
            </span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative group">
        <div className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          <IndianRupee className="w-5 h-5" />
        </div>
        <input 
          type="number"
          placeholder="Enter max budget (e.g. 12000)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-32 py-5 md:py-6 rounded-2xl md:rounded-[2rem] bg-card border-2 border-border focus:border-primary outline-none text-lg font-black shadow-lg transition-all placeholder:text-muted-foreground/30 placeholder:text-sm"
        />
        <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-xl">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground hidden sm:inline">Budget Filter</span>
        </div>
      </div>

      {/* RESULTS */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {optimizedResults.map((p, idx) => {
              const tagCount = (p.features || []).length;
              const efficiency = !isNaN(budget) && budget > 0 
                ? Math.round(((budget - p.rent) / budget) * 100) 
                : null;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  key={p.id}
                  onClick={() => navigate(`/property/${p.id}`)}
                  className="group bg-card border border-border rounded-2xl md:rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl cursor-pointer"
                >
                  {/* Rank badge */}
                  {idx < 3 && (
                    <div className="relative">
                      <div className={`absolute top-4 left-4 z-10 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-lg ${
                        idx === 0 ? "bg-yellow-500 text-yellow-950" : 
                        idx === 1 ? "bg-gray-300 text-gray-800" : 
                        "bg-orange-400 text-orange-950"
                      }`}>
                        #{idx + 1}
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={p.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <p className="text-white font-black text-xl tracking-tight">₹{p.rent.toLocaleString()}<span className="text-white/60 text-[10px] font-bold">/mo</span></p>
                      {efficiency !== null && efficiency > 0 && (
                        <div className="bg-green-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[9px] font-bold">
                          {efficiency}% under budget
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">{p.title}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-primary/60" /> {p.area}
                      </p>
                    </div>

                    {/* Quick stats */}
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                      {p.bedrooms && <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {p.bedrooms} Bed</span>}
                      {p.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {p.bathrooms} Bath</span>}
                      {p.sqft && <span className="flex items-center gap-1"><Maximize className="w-3 h-3" /> {p.sqft} sqft</span>}
                    </div>

                    {/* Tags */}
                    {tagCount > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(p.features || []).slice(0, 4).map((f: string) => (
                          <span key={f} className="px-2.5 py-1 bg-secondary rounded-lg text-[8px] font-bold uppercase tracking-tight border border-border group-hover:border-primary/20 transition-colors">
                            {f}
                          </span>
                        ))}
                        {tagCount > 4 && (
                          <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[8px] font-bold">
                            +{tagCount - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                        <span className="font-black text-xs">{p.rating || "5.0"}</span>
                        <span className="text-[8px] text-muted-foreground font-bold">• {tagCount} amenities</span>
                      </div>
                      <div className="text-primary text-[9px] font-black flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!loading && optimizedResults.length === 0 && (
        <div className="text-center py-24 rounded-3xl border-2 border-dashed border-border bg-secondary/10">
          <div className="space-y-3">
            <Search className="w-10 h-10 mx-auto text-muted-foreground/30" />
            <p className="font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-sm">No Matches Found</p>
            <p className="text-[10px] text-muted-foreground/30">Try increasing your budget</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartOptimizer;
