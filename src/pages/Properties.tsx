import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, Zap, Sparkles, Star, X } from "lucide-react";
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

/**
 * KNAPSACK PROPERTY OPTIMIZER
 * 
 * Goal: Maximize total "amenities" (tag count) within a user's budget.
 * 
 * Conflict Resolution: If two properties share the same price,
 * only the one with MORE tags is kept.
 * 
 * Fallback: If no exact matches, display by tag-count-to-price ratio (descending).
 */
const knapsackOptimize = (items: DBProperty[], budget: number): DBProperty[] => {
  if (items.length === 0 || budget <= 0) return [];

  // De-duplicate: for same-price properties, keep the one with most tags
  const priceMap = new Map<number, DBProperty>();
  for (const item of items) {
    const rent = Math.round(item.rent);
    const existing = priceMap.get(rent);
    const itemTags = (item.tags?.length || 0) + (item.features?.length || 0);
    const existingTags = existing ? (existing.tags?.length || 0) + (existing.features?.length || 0) : 0;
    if (!existing || itemTags > existingTags) {
      priceMap.set(rent, item);
    }
  }
  const dedupedItems = Array.from(priceMap.values());

  // Scale budget down if too large (prevent memory issues)
  const maxRent = Math.max(...dedupedItems.map(i => Math.round(i.rent)));
  const scaleFactor = budget > 50000 ? Math.ceil(budget / 50000) : 1;
  const W = Math.floor(budget / scaleFactor);

  const n = dedupedItems.length;
  const weights = dedupedItems.map(i => Math.floor(Math.round(i.rent) / scaleFactor));
  const values = dedupedItems.map(i => (i.tags?.length || 0) + (i.features?.length || 0));

  // DP table
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

  // Backtrack
  const result: DBProperty[] = [];
  let remaining = W;
  for (let i = n; i > 0; i--) {
    if (dp[i][remaining] !== dp[i - 1][remaining]) {
      result.push(dedupedItems[i - 1]);
      remaining -= weights[i - 1];
    }
  }

  // Fallback: if no items selected, sort by tag-count / price ratio
  if (result.length === 0) {
    return dedupedItems
      .map(item => ({
        ...item,
        ratio: ((item.tags?.length || 0) + (item.features?.length || 0)) / (item.rent || 1),
      }))
      .sort((a, b) => b.ratio - a.ratio)
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

  const maxRent = searchParams.get("maxRent");
  const tagFilter = searchParams.get("tag");

  useEffect(() => {
    const fetchProperties = async () => {
      let query = supabase
        .from("properties")
        .select("id, title, address, area, rent, rating, image_url, features, tags, has_vr")
        .order("created_at", { ascending: false });

      if (maxRent) query = query.lte("rent", parseInt(maxRent));

      const { data } = await query;
      let results = (data as DBProperty[]) || [];

      if (tagFilter) {
        results = results.filter(p =>
          [...(p.tags || []), ...(p.features || [])].some(
            t => t.toLowerCase() === tagFilter.toLowerCase()
          )
        );
      }

      setProperties(results);
      setLoading(false);
    };
    fetchProperties();
  }, [maxRent, tagFilter]);

  // Detect if search query is a number → treat as budget
  const isSearchBudget = /^\d+$/.test(searchQuery.trim());

  const optimizedResults = useMemo(() => {
    const budget = activeBudget || (isSearchBudget ? parseInt(searchQuery) : null);
    if (!budget) return null;

    const withinBudget = properties.filter(p => p.rent <= budget);
    return knapsackOptimize(withinBudget, budget);
  }, [activeBudget, searchQuery, properties, isSearchBudget]);

  const filtered = useMemo(() => {
    if (optimizedResults) return []; // hide regular list when optimized
    if (!searchQuery) return properties;
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, properties, optimizedResults]);

  const clearOptimizer = () => {
    setActiveBudget(null);
    setBudgetInput("");
    if (isSearchBudget) setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/")} className="p-3 rounded-2xl bg-secondary hover:bg-border transition-all">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-black uppercase tracking-tighter italic">Marketplace</h1>
            </div>

            {/* Budget Optimizer Input */}
            <div className="hidden md:flex items-center gap-2 bg-primary/10 p-1.5 rounded-2xl border border-primary/20">
              <input
                type="number"
                placeholder="Max Budget ₹"
                className="bg-transparent border-none text-[10px] font-black uppercase px-3 focus:outline-none w-32"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
              />
              <button
                onClick={() => {
                  const b = parseInt(budgetInput);
                  if (b > 0) setActiveBudget(b);
                }}
                className="bg-primary text-primary-foreground p-2 rounded-xl hover:scale-105 transition-all"
              >
                <Zap className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name/area or enter a number for budget optimization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border border-border bg-card text-[11px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {isSearchBudget && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-[9px] font-black text-primary uppercase">Budget Mode Active</span>
                <Zap className="w-3 h-3 text-primary fill-primary" />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-6 py-8">
        {/* Optimized Results */}
        <AnimatePresence>
          {optimizedResults && optimizedResults.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-12 p-8 bg-foreground text-background rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Knapsack Optimized — Best Amenities for ₹{activeBudget || searchQuery}
                </h2>
                <button onClick={clearOptimizer} className="p-2 hover:bg-background/20 rounded-xl transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] font-bold uppercase opacity-50 mb-6">
                Maximizing tag count within budget · Conflict resolution: highest amenities per price point
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {optimizedResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/property/${p.id}`)}
                    className="flex items-center gap-4 bg-background/10 p-4 rounded-2xl cursor-pointer hover:bg-background/20 transition-all"
                  >
                    <img src={p.image_url || "/placeholder.svg"} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black uppercase truncate">{p.title}</p>
                      <p className="text-[10px] font-bold text-primary">₹{p.rent.toLocaleString()}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {[...(p.tags || []), ...(p.features || [])].slice(0, 4).map((t) => (
                          <span key={t} className="text-[7px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-black uppercase">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                      {p.rating || 0}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="text-center py-20 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Scanning Properties...</div>
        ) : (
          <>
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
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-white">
                      ₹{p.rent.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-black uppercase text-sm tracking-tighter">{p.title}</h3>
                      <div className="flex items-center gap-1 text-orange-500 font-bold text-[10px]">
                        <Star className="w-3 h-3 fill-current" /> {p.rating || 0}
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{p.area}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {[...(p.tags || []), ...(p.features || [])].slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[8px] px-3 py-1 rounded-full bg-secondary text-foreground font-black uppercase tracking-tighter">{tag}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {filtered.length === 0 && !optimizedResults && (
              <div className="text-center py-20 text-[10px] font-black uppercase tracking-widest opacity-30">No units match your search</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Properties;
