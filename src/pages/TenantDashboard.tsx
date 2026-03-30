import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, MapPin, Star, Heart, Wifi, Car, Droplets, Shield, Wind, Zap, 
  Dumbbell, SlidersHorizontal, ArrowLeftRight, X, 
  Loader2, User, Settings, LogOut, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TenantDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProps, setFilteredProps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<any[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const filterTags = [
    { id: "WiFi", icon: Wifi },
    { id: "Parking", icon: Car },
    { id: "Drinking Water", icon: Droplets },
    { id: "AC", icon: Wind },
    { id: "CCTV", icon: Shield },
    { id: "Gym", icon: Dumbbell },
    { id: "Power Backup", icon: Zap },
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProperties(data);
      setFilteredProps(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    let result = [...properties];

    // 1. SEARCH FILTER
    if (searchQuery) {
      result = result.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.area?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const maxRent = searchParams.get("maxRent");
    const isOptimized = searchParams.get("optimize") === "true";

    // 2. BUDGET & KNAPSACK RANKING LOGIC
    if (maxRent) {
      const W = parseInt(maxRent);
      
      if (isOptimized) {
        /**
         * GREEDY KNAPSACK RANKING
         * Instead of hiding properties that don't "fit" a sum,
         * we show all properties <= Budget, but sort them by their 
         * Value-to-Cost ratio (Efficiency).
         */
        result = result
          .filter(p => Number(p.rent) <= W) // Keep everything within budget
          .map(item => {
            const matchingSelectedTags = item.features?.filter((f: string) => 
              selectedTags.includes(f)
            ).length || 0;

            const baseValue = (item.rating || 4.0) * 20; // Weights
            const selectionBonus = matchingSelectedTags * 30;
            const facilityBonus = (item.features?.length || 0) * 5;
            
            const totalValue = baseValue + selectionBonus + facilityBonus;
            const efficiency = totalValue / Number(item.rent); // Value per Rupee

            return { ...item, efficiency };
          })
          .sort((a, b) => b.efficiency - a.efficiency); // Best deals at the top
      } else {
        // Standard non-AI filter: strictly by budget
        result = result.filter(p => Number(p.rent) <= W);
      }
    }

    // 3. FACILITY TAG FILTER
    if (selectedTags.length > 0) {
      result = result.filter(p => selectedTags.every(tag => p.features?.includes(tag)));
    }

    setFilteredProps(result);
  }, [searchQuery, selectedTags, properties, searchParams]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const toggleCompare = (p: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (compareList.find(item => item.id === p.id)) {
      setCompareList(compareList.filter(item => item.id !== p.id));
    } else {
      if (compareList.length >= 3) {
        toast.error("Limit Reached", { description: "You can compare up to 3 units." });
        return;
      }
      setCompareList([...compareList, p]);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* HEADER & SEARCH */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 group w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search by area or PG name..." 
                className="w-full bg-secondary/50 border-none rounded-[1.5rem] py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="hidden lg:flex items-center gap-3 bg-foreground text-background px-6 py-3.5 rounded-[1.5rem]">
               <SlidersHorizontal className="w-4 h-4 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                {searchParams.get("optimize") === "true" ? "AI Budget Mode" : "Standard View"}
               </span>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 bg-card border border-border/50 p-1.5 pr-4 rounded-[1.5rem] hover:shadow-lg hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-tighter leading-none italic">Account</p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter">Verified Member</p>
                </div>
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-card border border-border/50 rounded-[2rem] shadow-2xl p-3 z-50 backdrop-blur-2xl overflow-hidden"
                  >
                    <button onClick={() => { setShowUserMenu(false); navigate("/profile"); }} className="w-full flex items-center gap-3 p-4 hover:bg-primary/10 rounded-xl transition-all group">
                      <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Edit Profile</span>
                    </button>
                    <div className="h-[1px] bg-border/50 my-2 mx-2" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 rounded-xl transition-all group">
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {filterTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all border ${
                  selectedTags.includes(tag.id)
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                    : "bg-card border-border text-muted-foreground hover:border-primary/50"
                }`}>
                <tag.icon className="w-3.5 h-3.5" />
                {tag.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-10">
        <div className="flex items-center justify-between mb-8 px-2">
            <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Recommended Units</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{filteredProps.length} Results available</p>
            </div>
        </div>

        {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Analyzing Budget...</span>
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProps.map((p) => (
                <motion.div 
                  layout
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group cursor-pointer space-y-4"
                  onClick={() => navigate(`/property/${p.id}`)}
                >
                  <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-500">
                    <img src={p.image_url || "/placeholder.jpg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.title} />
                    
                    <button 
                      onClick={(e) => toggleCompare(p, e)}
                      className={`absolute top-5 right-16 p-3 rounded-2xl backdrop-blur-md transition-all z-10 ${
                        compareList.find(item => item.id === p.id) 
                        ? "bg-primary text-white scale-110" 
                        : "bg-background/20 text-white hover:bg-background/40"
                      }`}
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                    </button>

                    <button className="absolute top-5 right-5 p-3 bg-background/20 backdrop-blur-md rounded-2xl text-white hover:bg-red-500 transition-colors z-10">
                        <Heart className="w-4 h-4" />
                    </button>
                    
                    <div className="absolute bottom-5 left-5 flex gap-2">
                        {p.has_vr && <div className="px-3 py-1.5 bg-primary text-white rounded-lg text-[8px] font-black uppercase tracking-widest">VR Ready</div>}
                        <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-black rounded-lg text-[8px] font-black uppercase tracking-widest">{p.sqft || 0} SQFT</div>
                    </div>
                  </div>

                  <div className="px-2 space-y-2">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors leading-none">{p.title}</h3>
                            <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase">
                                <MapPin className="w-3 h-3 text-primary/60" /> {p.area}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-foreground">₹{p.rent.toLocaleString()}</p>
                            <div className="flex items-center gap-1 text-orange-500 text-[10px] font-black">
                                <Star className="w-3 h-3 fill-current" /> {p.rating || "4.8"}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {p.features?.map((f: string) => (
                            <span key={f} className={`text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded-md border transition-colors ${
                                selectedTags.includes(f) 
                                ? "bg-primary/20 border-primary/40 text-primary ring-1 ring-primary/20" 
                                : "bg-secondary border-border/50 text-muted-foreground/60"
                            }`}>{f}</span>
                        ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredProps.length === 0 && (
            <div className="py-32 text-center">
                <h3 className="text-xl font-black uppercase tracking-tighter italic">No Units Fit This Budget</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase mt-2">Adjust your price range or remove facility filters.</p>
            </div>
        )}
      </main>

      {/* FOOTER COMPONENTS (Compare Bar & Modal) */}
      {/* ... keep your existing CompareList and ShowCompareModal code here ... */}
    </div>
  );
};

export default TenantDashboard;