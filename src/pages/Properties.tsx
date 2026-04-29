import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, Zap, Sparkles, Star, X, IndianRupee, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface DBProperty {
  id: string;
  title: string;
  address: string;
  area: string;
  rent: number;
  rating: number;
  image_url: string | null;
  features: string[] | null;
  tags: string[] | null;
  has_vr: boolean;
}

const knapsackOptimize = (items: DBProperty[], budget: number): DBProperty[] => {
  if (items.length === 0 || budget <= 0) return [];

  const priceMap = new Map<number, DBProperty>();
  for (const item of items) {
    const rent = Math.round(item.rent);
    const existing = priceMap.get(rent);
    
    // Calculate true unique amenity count for value assessment
    const uniqueAmenities = new Set([...(item.tags || []), ...(item.features || [])]);
    const uniqueTagsCount = Array.from(uniqueAmenities).filter(t => t && t.trim() !== "").length;

    const existingUnique = existing ? new Set([...(existing.tags || []), ...(existing.features || [])]) : null;
    const existingTagsCount = existingUnique 
      ? Array.from(existingUnique).filter(t => t && t.trim() !== "").length 
      : 0;

    if (!existing || uniqueTagsCount > existingTagsCount) {
      priceMap.set(rent, item);
    }
  }
  const dedupedItems = Array.from(priceMap.values());

  const scaleFactor = budget > 50000 ? Math.ceil(budget / 50000) : 1;
  const W = Math.floor(budget / scaleFactor);
  const n = dedupedItems.length;
  const weights = dedupedItems.map(i => Math.floor(Math.round(i.rent) / scaleFactor));
  const values = dedupedItems.map(i => {
    const combined = new Set([...(i.tags || []), ...(i.features || [])]);
    return Array.from(combined).filter(t => t && t.trim() !== "").length;
  });

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const v = values[i - 1];
    for (let j = 0; j <= W; j++) {
      if (w <= j) {
        dp[i][j] = Math.max(dp[i - 1][j], v + dp[i - 1][j - w]);
      } else {
        dp[i][j] = dp[i - 1][j];
      }
    }
  }

  const result: DBProperty[] = [];
  let remaining = W;
  for (let i = n; i > 0; i--) {
    if (dp[i][remaining] !== dp[i - 1][remaining]) {
      result.push(dedupedItems[i - 1]);
      remaining -= weights[i - 1];
    }
  }

  if (result.length === 0) {
    return dedupedItems
      .map(item => {
        const combined = new Set([...(item.tags || []), ...(item.features || [])]);
        const count = Array.from(combined).filter(t => t && t.trim() !== "").length;
        return { ...item, ratio: count / (item.rent || 1) };
      })
      .sort((a, b) => (b as any).ratio - (a as any).ratio)
      .slice(0, 6);
  }

  return result;
};

const Properties = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<DBProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetInput, setBudgetInput] = useState("");
  const [activeBudget, setActiveBudget] = useState<number | null>(null);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});

  const maxRentParam = searchParams.get("maxRent");
  const tagFilter = searchParams.get("tag");

  useEffect(() => {
    const fetchProperties = async () => {
      let query = supabase
        .from("properties")
        .select("id, title, address, area, rent, rating, image_url, features, tags, has_vr")
        .order("created_at", { ascending: false });

      if (maxRentParam) query = query.lte("rent", parseInt(maxRentParam));

      const { data } = await query;
      let results = (data as DBProperty[]) || [];

      if (tagFilter) {
        results = results.filter(p =>
          [...(p.tags || []), ...(p.features || [])].some(
            t => t?.toLowerCase() === tagFilter.toLowerCase()
          )
        );
      }

      setProperties(results);
      setLoading(false);
    };
    fetchProperties();

    const getRatings = async () => {
      const { data } = await supabase.from("property_ratings").select("property_id, rating");
      const map: Record<string, { sum: number; count: number }> = {};
      (data || []).forEach((r: any) => {
        if (!map[r.property_id]) map[r.property_id] = { sum: 0, count: 0 };
        map[r.property_id].sum += Number(r.rating) || 0;
        map[r.property_id].count += 1;
      });
      const agg: Record<string, { avg: number; count: number }> = {};
      Object.entries(map).forEach(([k, v]) => {
        agg[k] = { avg: v.count > 0 ? v.sum / v.count : 0, count: v.count };
      });
      setRatings(agg);
    };
    getRatings();
  }, [maxRentParam, tagFilter]);

  const liveRating = (p: DBProperty) => {
    const r = ratings[p.id];
    if (r && r.count > 0) return r.avg.toFixed(1);
    if (p.rating && p.rating > 0) return Number(p.rating).toFixed(1);
    return "0.0";
  };

  const optimizedResults = useMemo(() => {
    if (!activeBudget) return null;
    const withinBudget = properties.filter(p => p.rent <= activeBudget);
    return knapsackOptimize(withinBudget, activeBudget);
  }, [activeBudget, properties]);

  const filtered = useMemo(() => {
    if (optimizedResults) return []; 
    if (!searchQuery) return properties;

    const query = searchQuery.toLowerCase();
    const numQuery = parseInt(searchQuery);

    return properties.filter((p) => {
      const textMatch = 
        p.title.toLowerCase().includes(query) ||
        p.area.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query);
      
      const priceMatch = !isNaN(numQuery) && p.rent <= numQuery;
      
      return textMatch || priceMatch;
    });
  }, [searchQuery, properties, optimizedResults]);

  const clearOptimizer = () => {
    setActiveBudget(null);
    setBudgetInput("");
  };

  return (
    <div className="min-h-screen bg-background pb-20 font-sans">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/")} className="p-3 rounded-2xl bg-secondary hover:bg-border transition-all">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-black uppercase tracking-tighter italic text-foreground">Marketplace</h1>
            </div>

            <div className="flex items-center gap-2 bg-primary/10 p-1.5 rounded-2xl border border-primary/20">
              <input
                type="number"
                placeholder="Budget ₹"
                className="bg-transparent border-none text-[10px] font-black uppercase px-3 focus:outline-none w-24 md:w-32 text-foreground"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
              />
              <button
                onClick={() => {
                  const b = parseInt(budgetInput);
                  if (b > 0) setActiveBudget(b);
                }}
                className="bg-primary text-primary-foreground p-2 rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                <Zap className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search area, property, or price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border border-border bg-card text-[11px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
            />
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence>
          {optimizedResults && optimizedResults.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-12 p-8 bg-foreground text-background rounded-[3rem] shadow-2xl overflow-hidden border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-background">
                  <Sparkles className="w-4 h-4 text-primary" /> AI Optimized Package (₹{activeBudget})
                </h2>
                <button onClick={clearOptimizer} className="p-2 hover:bg-background/20 rounded-xl transition-colors">
                  <X className="w-4 h-4 text-background" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {optimizedResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/property/${p.id}`)}
                    className="flex items-center gap-4 bg-background/10 p-4 rounded-2xl cursor-pointer hover:bg-background/20 transition-all border border-white/5"
                  >
                    <img src={p.image_url || "/placeholder.svg"} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black uppercase truncate text-background">{p.title}</p>
                      <p className="text-[10px] font-bold text-primary">₹{p.rent.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1 text-orange-500 text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-orange-500 text-orange-500" /> {liveRating(p as any)}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Refreshing Market...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card border border-border rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => navigate(`/property/${p.id}`)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-white">
                    ₹{p.rent.toLocaleString()}
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black uppercase text-sm tracking-tighter text-foreground">{p.title}</h3>
                    <div className="flex items-center gap-1 text-orange-500 font-bold text-[10px]">
                      <Star className="w-3 h-3 fill-current" /> {liveRating(p)}
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {p.area}
                  </p>
                  
                  {/* Tenant Amenities Display */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {Array.from(new Set([...(p.tags || []), ...(p.features || [])]))
                      .filter(tag => tag && tag.trim() !== "")
                      .slice(0, 7)
                      .map((tag) => (
                        <span 
                          key={tag} 
                          className="text-[8px] px-3 py-1 rounded-full bg-secondary text-foreground font-black uppercase tracking-tighter border border-border/50"
                        >
                          {tag}
                        </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;