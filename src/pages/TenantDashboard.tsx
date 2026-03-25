import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, MapPin, Star, Heart, 
  Wifi, Car, Droplets, Shield, Wind, Zap, Dumbbell,
  SlidersHorizontal, LayoutGrid, List, ArrowLeftRight, X, Check, Loader2
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
  
  // Comparison States
  const [compareList, setCompareList] = useState<any[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

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

  // --- Combined Filter Logic ---
  useEffect(() => {
    let result = properties;

    if (searchQuery) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.area.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter(p => 
        selectedTags.every(tag => p.features?.includes(tag))
      );
    }

    const maxRent = searchParams.get("maxRent");
    if (maxRent && searchParams.get("optimize") === "true") {
        const budget = parseInt(maxRent);
        result = result.filter(p => p.rent <= budget);
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
        toast.error("Limit Reached", { description: "You can compare up to 3 units side-by-side." });
        return;
      }
      setCompareList([...compareList, p]);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* HEADER & SEARCH */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search by area or PG name..." 
                className="w-full bg-secondary/50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="px-6 py-4 bg-foreground text-background rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary hover:text-white transition-all">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
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
                }`}
              >
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
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Market Listings</h2>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{filteredProps.length} Results Found</p>
            </div>
            <div className="flex bg-secondary p-1 rounded-xl">
                <button className="p-2 bg-background rounded-lg shadow-sm"><LayoutGrid className="w-4 h-4"/></button>
                <button className="p-2 text-muted-foreground"><List className="w-4 h-4"/></button>
            </div>
        </div>

        {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Syncing Database...</span>
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
                    
                    {/* Compare Button */}
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
                        {p.has_vr && <div className="px-3 py-1.5 bg-primary text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-lg">VR Ready</div>}
                        <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-black rounded-lg text-[8px] font-black uppercase tracking-widest">{p.sqft || 0} SQFT</div>
                    </div>
                  </div>

                  <div className="px-2 space-y-2">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors">{p.title}</h3>
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
                        {p.features?.slice(0, 3).map((f: string) => (
                            <span key={f} className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground/60 bg-secondary px-2 py-1 rounded-md border border-border/50">{f}</span>
                        ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* FLOATING COMPARE BAR */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl">
            <div className="bg-foreground text-background rounded-[2rem] p-4 flex items-center justify-between shadow-2xl border border-white/10">
              <div className="flex items-center gap-4 px-4">
                <div className="flex -space-x-4">
                  {compareList.map((p) => (
                    <img key={p.id} src={p.image_url} className="w-10 h-10 rounded-full border-2 border-foreground object-cover shadow-lg" />
                  ))}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Analysis Mode</p>
                    <p className="text-[8px] font-bold opacity-50 uppercase mt-1">{compareList.length}/3 Units Selected</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setCompareList([])} className="px-4 py-2 text-[10px] font-black uppercase opacity-50 hover:opacity-100 transition-opacity">Clear</button>
                <button onClick={() => setShowCompareModal(true)} className="bg-primary text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Compare Now</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDE-BY-SIDE MODAL */}
      <AnimatePresence>
        {showCompareModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl p-6 overflow-y-auto">
            <div className="max-w-6xl mx-auto py-10 space-y-12">
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black uppercase tracking-tighter italic">Side-By-Side Comparison</h2>
                <button onClick={() => setShowCompareModal(false)} className="p-4 bg-secondary rounded-full hover:rotate-90 transition-all"><X /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {compareList.map((p) => (
                  <div key={p.id} className="space-y-8 bg-card border border-border rounded-[3rem] p-8 relative shadow-xl">
                    <div className="aspect-video rounded-[2rem] overflow-hidden">
                        <img src={p.image_url} className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xl font-black uppercase leading-none truncate">{p.title}</h3>
                        <p className="text-4xl font-black text-primary italic">₹{p.rent}</p>
                    </div>
                    <div className="space-y-6 pt-6 border-t border-border">
                        <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase opacity-40">Living Space</span><span className="text-xs font-bold">{p.sqft || "--"} SqFt</span></div>
                        <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase opacity-40">Config</span><span className="text-xs font-bold">{p.bedrooms} BHK / {p.bathrooms} Bath</span></div>
                        <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase opacity-40">Locality</span><span className="text-xs font-bold truncate ml-4 capitalize">{p.area}</span></div>
                    </div>
                    <div className="space-y-4 pt-6 border-t border-border">
                        <span className="text-[9px] font-black uppercase opacity-40">Amenities</span>
                        <div className="flex flex-wrap gap-2">
                            {p.features?.map((f: string) => (
                                <div key={f} className="flex items-center gap-1 bg-secondary px-3 py-1.5 rounded-lg text-[8px] font-black uppercase">
                                    <Check className="w-3 h-3 text-green-500" /> {f}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => navigate(`/property/${p.id}`)} className="w-full py-4 bg-foreground text-background rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all">Go to Page</button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TenantDashboard;