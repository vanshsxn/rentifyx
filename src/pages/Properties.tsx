import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, Zap, Sparkles, Star, X, IndianRupee, MapPin, Bed, Bath, Maximize, TrendingUp, Filter, Trophy, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import ComparisonDrawer from "@/components/ComparisonDrawer";

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
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
}

const knapsackOptimize = (items: DBProperty[], budget: number): DBProperty[] => {
  if (items.length === 0 || budget <= 0) return [];

  const priceMap = new Map<number, DBProperty>();
  for (const item of items) {
    const rent = Math.round(item.rent);
    const existing = priceMap.get(rent);
    const uniqueAmenities = new Set([...(item.tags || []), ...(item.features || [])]);
    const uniqueTagsCount = Array.from(uniqueAmenities).filter(t => t && t.trim() !== "").length;
    const existingUnique = existing ? new Set([...(existing.tags || []), ...(existing.features || [])]) : null;
    const existingTagsCount = existingUnique ? Array.from(existingUnique).filter(t => t && t.trim() !== "").length : 0;
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
      dp[i][j] = w <= j ? Math.max(dp[i - 1][j], v + dp[i - 1][j - w]) : dp[i - 1][j];
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
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const maxRentParam = searchParams.get("maxRent");
  const tagFilter = searchParams.get("tag");

  useEffect(() => {
    const fetchProperties = async () => {
      let query = supabase
        .from("properties")
        .select("id, title, address, area, rent, rating, image_url, features, tags, has_vr, bedrooms, bathrooms, sqft")
        .order("created_at", { ascending: false });
      if (maxRentParam) query = query.lte("rent", parseInt(maxRentParam));
      const { data } = await query;
      let results = (data as DBProperty[]) || [];
      if (tagFilter) {
        results = results.filter(p =>
          [...(p.tags || []), ...(p.features || [])].some(t => t?.toLowerCase() === tagFilter.toLowerCase())
        );
      }
      setProperties(results);
      setLoading(false);
    };
    fetchProperties();
  }, [maxRentParam, tagFilter]);

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
      const textMatch = p.title.toLowerCase().includes(query) || p.area.toLowerCase().includes(query) || p.address.toLowerCase().includes(query);
      const priceMatch = !isNaN(numQuery) && p.rent <= numQuery;
      return textMatch || priceMatch;
    });
  }, [searchQuery, properties, optimizedResults]);

  const clearOptimizer = () => {
    setActiveBudget(null);
    setBudgetInput("");
  };

  const toggleCompare = (id: string) => {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 2 ? [...prev, id] : prev);
  };

  const compareProperties = properties.filter(p => compareIds.includes(p.id));
  const displayList = optimizedResults || filtered;

  const savings = activeBudget && optimizedResults && optimizedResults.length > 0
    ? activeBudget - optimizedResults[0].rent
    : null;

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

            <div className="flex items-center gap-3">
              {/* Compare button */}
              {compareIds.length === 2 && (
                <button
                  onClick={() => {}}
                  className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-primary/20 animate-pulse"
                >
                  <Trophy className="w-3.5 h-3.5" /> Compare ({compareIds.length})
                </button>
              )}

              {/* Budget optimizer */}
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
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-3 mb-4">
            {activeBudget && savings !== null && savings > 0 && (
              <div className="bg-green-500/10 text-green-600 px-3 py-1.5 rounded-xl border border-green-500/20">
                <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Save ₹{savings.toLocaleString()}
                </span>
              </div>
            )}
            <div className="bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20">
              <span className="text-[9px] font-black uppercase text-primary tracking-widest">
                {displayList.length} Properties
              </span>
            </div>
            {activeBudget && (
              <button onClick={clearOptimizer} className="ml-auto flex items-center gap-1 text-[9px] font-bold text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-3 h-3" /> Clear filter
              </button>
            )}
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Refreshing Market...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border-2 border-dashed border-border bg-secondary/10">
            <div className="space-y-3">
              <Search className="w-10 h-10 mx-auto text-muted-foreground/30" />
              <p className="font-black uppercase tracking-[0.3em] text-muted-foreground/40 text-sm">No Matches Found</p>
              <p className="text-[10px] text-muted-foreground/30">Try a different search or increase your budget</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayList.map((p, i) => {
              const efficiency = activeBudget && activeBudget > 0
                ? Math.round(((activeBudget - p.rent) / activeBudget) * 100)
                : null;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-card border border-border rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => navigate(`/property/${p.id}`)}
                >
                  {/* Rank badges for optimizer mode */}
                  {activeBudget && i < 3 && (
                    <div className="relative">
                      <div className={`absolute top-4 left-4 z-10 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-lg ${
                        i === 0 ? "bg-yellow-500 text-yellow-950" :
                        i === 1 ? "bg-gray-300 text-gray-800" :
                        "bg-orange-400 text-orange-950"
                      }`}>
                        #{i + 1}
                      </div>
                    </div>
                  )}

                  <div className="relative h-64 overflow-hidden">
                    <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <p className="text-white font-black text-xl tracking-tight">
                        ₹{p.rent.toLocaleString()}<span className="text-white/60 text-[10px] font-bold">/mo</span>
                      </p>
                      {efficiency !== null && efficiency > 0 && (
                        <div className="bg-green-500/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-[9px] font-bold">
                          {efficiency}% under budget
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 min-w-0 flex-1">
                        <h3 className="font-black uppercase text-sm tracking-tighter text-foreground truncate group-hover:text-primary transition-colors">{p.title}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-primary/60" /> {p.area}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-orange-500 font-bold text-[10px] shrink-0">
                        <Star className="w-3 h-3 fill-current" /> {p.rating || "5.0"}
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                      {p.bedrooms && <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {p.bedrooms} Bed</span>}
                      {p.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {p.bathrooms} Bath</span>}
                      {p.sqft && <span className="flex items-center gap-1"><Maximize className="w-3 h-3" /> {p.sqft} sqft</span>}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set([...(p.tags || []), ...(p.features || [])]))
                        .filter(tag => tag && tag.trim() !== "")
                        .slice(0, 4)
                        .map((tag) => (
                          <span key={tag} className="text-[8px] px-2.5 py-1 rounded-lg bg-secondary text-foreground font-bold uppercase tracking-tight border border-border/50 group-hover:border-primary/20 transition-colors">
                            {tag}
                          </span>
                        ))}
                    </div>

                    {/* Compare checkbox */}
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                      <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">
                        <input
                          type="checkbox"
                          checked={compareIds.includes(p.id)}
                          disabled={compareIds.length >= 2 && !compareIds.includes(p.id)}
                          onChange={() => toggleCompare(p.id)}
                          className="rounded border-border accent-primary w-3.5 h-3.5"
                        />
                        Compare
                      </label>
                      <span className="text-[8px] text-muted-foreground font-bold">
                        {Array.from(new Set([...(p.tags || []), ...(p.features || [])])).filter(Boolean).length} amenities
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comparison Drawer */}
      <AnimatePresence>
        {compareIds.length === 2 && (
          <ComparisonDrawer
            properties={compareProperties}
            onClose={() => setCompareIds([])}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Properties;
