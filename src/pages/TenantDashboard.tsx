import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, MapPin, Star, Heart, Wifi, Car, Droplets, Shield, Wind, Zap, 
  Dumbbell, SlidersHorizontal, ArrowLeftRight, X, 
  Loader2, User, Settings, LogOut, ChevronDown, Camera
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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
    fetchUserData();
    fetchProperties();
  }, []);

  const fetchUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setUserRole(data?.role || "tenant");
    }
  };

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

    // 1. DYNAMIC SEARCH (TEXT OR PRICE)
    if (searchQuery) {
      const isNumeric = !isNaN(Number(searchQuery));
      if (isNumeric) {
        // If searching a number, treat as Max Budget
        result = result.filter(p => Number(p.rent) <= Number(searchQuery));
      } else {
        result = result.filter(p => 
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.area?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }

    // 2. KNAPSACK OPTIMIZATION LOGIC
    const maxRentParam = searchParams.get("maxRent");
    const isOptimized = searchParams.get("optimize") === "true" || !!searchQuery;

    if (isOptimized) {
      const budgetLimit = searchQuery && !isNaN(Number(searchQuery)) 
        ? Number(searchQuery) 
        : (maxRentParam ? Number(maxRentParam) : Infinity);

      // Group by Price to find "Best Amenities for the Price"
      const knapsackMap = new Map();

      result.forEach(item => {
        const price = Number(item.rent);
        const amenitiesCount = item.features?.length || 0;

        if (price <= budgetLimit) {
          // If we see the same price, keep only the one with MORE tags (Knapsack Goal)
          if (!knapsackMap.has(price) || amenitiesCount > knapsackMap.get(price).features?.length) {
            knapsackMap.set(price, item);
          }
        }
      });

      // Convert back to array and sort by most tags descending (Best Value First)
      result = Array.from(knapsackMap.values())
        .sort((a, b) => (b.features?.length || 0) - (a.features?.length || 0));
    }

    // 3. FACILITY TAG FILTER
    if (selectedTags.length > 0) {
      result = result.filter(p => selectedTags.every(tag => p.features?.includes(tag)));
    }

    setFilteredProps(result);
  }, [searchQuery, selectedTags, properties, searchParams]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Dynamic Role Heading */}
            <h1 className="text-xl font-black italic tracking-tighter uppercase text-primary">
              {userRole === 'landlord' ? "Landlord Hub" : "Tenant Profile"}
            </h1>

            <div className="relative flex-1 group w-full max-w-xl">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search area or enter max price (e.g. 15000)..." 
                className="w-full bg-secondary/50 border-none rounded-[1.5rem] py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 bg-card border border-border/50 p-1.5 pr-4 rounded-[1.5rem] hover:shadow-lg transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] font-black uppercase tracking-tighter leading-none italic">
                    {userRole === 'landlord' ? "Landlord Account" : "Tenant Account"}
                  </p>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter italic">Verified Access</p>
                </div>
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 mt-3 w-64 bg-card border border-border/50 rounded-[2rem] shadow-2xl p-3 z-50 backdrop-blur-2xl"
                  >
                    <button onClick={() => navigate("/profile")} className="w-full flex items-center gap-3 p-4 hover:bg-primary/10 rounded-xl transition-all group">
                      <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Edit Profile</span>
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 rounded-xl transition-all group">
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* FACILITY TAGS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {filterTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTags(prev => prev.includes(tag.id) ? prev.filter(t => t !== tag.id) : [...prev, tag.id])}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${
                  selectedTags.includes(tag.id) ? "bg-primary border-primary text-white scale-105" : "bg-card border-border text-muted-foreground"
                }`}>
                <tag.icon className="w-3.5 h-3.5" />
                {tag.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 mt-10">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic">Calculating Best Value...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredProps.map((p) => (
                <motion.div layout key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group cursor-pointer space-y-4" onClick={() => navigate(`/property/${p.id}`)}>
                  <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-500">
                    <img src={p.image_url || "/placeholder.jpg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.title} />
                    <div className="absolute top-5 right-5 flex gap-2">
                      <div className="p-3 bg-background/20 backdrop-blur-md rounded-2xl text-white">
                        <Heart className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="absolute bottom-5 left-5 px-3 py-1.5 bg-white/90 backdrop-blur-md text-black rounded-lg text-[8px] font-black uppercase tracking-widest italic">
                      {p.features?.length || 0} Amenities Included
                    </div>
                  </div>

                  <div className="px-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-lg font-black uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{p.title}</h3>
                        <p className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase"><MapPin className="w-3 h-3" /> {p.area}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black">₹{p.rent.toLocaleString()}</p>
                        <div className="flex items-center gap-1 text-orange-500 text-[10px] font-black"><Star className="w-3 h-3 fill-current" /> {p.rating || "4.8"}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default TenantDashboard;