import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, Zap, Sparkles, Star } from "lucide-react";
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
  tags: string[]; // Changed from features to tags
  has_vr: boolean;
}

const Properties = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<DBProperty[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Knapsack States
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [optimizedList, setOptimizedList] = useState<DBProperty[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const maxRent = searchParams.get("maxRent");
  const tagFilter = searchParams.get("tag");

  useEffect(() => {
    const fetchProperties = async () => {
      let query = supabase
        .from("properties")
        .select("id, title, address, area, rent, rating, image_url, tags, has_vr")
        .order("created_at", { ascending: false });

      if (maxRent) query = query.lte("rent", parseInt(maxRent));
      
      const { data } = await query;
      let results = (data as DBProperty[]) || [];

      if (tagFilter) {
        results = results.filter(p => (p.tags || []).some(t => t.toLowerCase() === tagFilter.toLowerCase()));
      }
      
      setProperties(results);
      setLoading(false);
    };
    fetchProperties();
  }, [maxRent, tagFilter]);

  // --- 0/1 KNAPSACK ALGORITHM ---
  const runBudgetOptimization = () => {
    if (totalBudget <= 0) return;
    setIsOptimizing(true);
    
    const W = totalBudget;
    const n = properties.length;
    const items = properties;
    
    // DP Table
    let dp = Array(n + 1).fill(0).map(() => Array(W + 1).fill(0));

    for (let i = 1; i <= n; i++) {
      const weight = items[i - 1].rent;
      const value = items[i - 1].rating || 1; // Use rating as value

      for (let w = 0; w <= W; w++) {
        if (weight <= w) {
          dp[i][w] = Math.max(value + dp[i - 1][w - weight], dp[i - 1][w]);
        } else {
          dp[i][w] = dp[i - 1][w];
        }
      }
    }

    // Backtrack to find items
    let res = dp[n][W];
    let w = W;
    const result: DBProperty[] = [];
    for (let i = n; i > 0 && res > 0; i--) {
      if (res !== dp[i - 1][w]) {
        result.push(items[i - 1]);
        res -= (items[i - 1].rating || 1);
        w -= items[i - 1].rent;
      }
    }
    
    setOptimizedList(result);
    setIsOptimizing(false);
  };

  const filtered = properties.filter(
    (p) => searchQuery === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            
            {/* Knapsack Mini-Input */}
            <div className="hidden md:flex items-center gap-2 bg-primary/10 p-1.5 rounded-2xl border border-primary/20">
              <input 
                type="number" 
                placeholder="Total Budget?" 
                className="bg-transparent border-none text-[10px] font-black uppercase px-3 focus:outline-none w-32"
                onChange={(e) => setTotalBudget(Number(e.target.value))}
              />
              <button 
                onClick={runBudgetOptimization}
                className="bg-primary text-white p-2 rounded-xl hover:scale-105 transition-all"
              >
                <Zap className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by tags, area, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] border border-border bg-card text-[11px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-6 py-8">
        {/* Optimized Results Display */}
        <AnimatePresence>
          {optimizedList.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: "auto", opacity: 1 }}
              className="mb-12 p-8 bg-foreground text-background rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> AI Budget Optimized Selection
                </h2>
                <button onClick={() => setOptimizedList([])} className="text-[10px] font-black uppercase opacity-50">Clear</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {optimizedList.map(p => (
                  <div key={p.id} onClick={() => navigate(`/property/${p.id}`)} className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl cursor-pointer hover:bg-white/20 transition-all">
                    <img src={p.image_url || ""} className="w-16 h-16 rounded-xl object-cover" />
                    <div>
                      <p className="text-[11px] font-black uppercase">{p.title}</p>
                      <p className="text-[10px] font-bold text-primary">₹{p.rent.toLocaleString()}</p>
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
                    <img src={p.image_url || "/placeholder.jpg"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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
                      {(p.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[8px] px-3 py-1 rounded-full bg-secondary text-foreground font-black uppercase tracking-tighter">{tag}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-20 text-[10px] font-black uppercase tracking-widest opacity-30">No units match your search</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Properties;