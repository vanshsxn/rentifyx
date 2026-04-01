import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, MapPin, Star, Heart, Wifi, Car, Droplets, Shield, Wind, Zap, 
  Dumbbell, SlidersHorizontal, ArrowLeftRight, X, 
  Loader2, User, Settings, LogOut, ChevronDown, Camera, Edit3
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

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
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const { data: { user } } = await (supabase.auth as any).getUser();
    
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setUserProfile(profile);
        setEditName(profile.full_name || "");
        setEditAvatar(profile.avatar_url || "");
      }
    }

    const { data: props, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && props) setProperties(props);
    setLoading(false);
  };

  useEffect(() => {
    if (!properties.length) return;

    let result = [...properties];

    if (selectedTags.length > 0) {
      result = result.filter(p => 
        selectedTags.every(tag => p.features?.includes(tag))
      );
    }

    const maxRentParam = searchParams.get("maxRent");
    const isOptimized = searchParams.get("optimize") === "true";
    const numericQuery = !isNaN(Number(searchQuery)) && searchQuery !== "" ? Number(searchQuery) : null;
    const budgetLimit = numericQuery || (maxRentParam ? Number(maxRentParam) : null);

    if (isOptimized || budgetLimit) {
      const limit = budgetLimit || Infinity;
      const withinBudget = result.filter(p => Number(p.rent) <= limit);
      const exactMatches = withinBudget.filter(p => Number(p.rent) === limit);

      if (exactMatches.length > 0) {
        const bestExact = exactMatches.sort((a, b) => 
          (b.features?.length || 0) - (a.features?.length || 0)
        )[0];
        result = [bestExact];
      } else {
        const bestValueUnder = withinBudget.sort((a, b) => 
          (b.features?.length || 0) - (a.features?.length || 0)
        )[0];
        result = bestValueUnder ? [bestValueUnder] : [];
      }
    } 
    else if (searchQuery && isNaN(Number(searchQuery))) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(query) || p.area?.toLowerCase().includes(query)
      );
    }

    setFilteredProps(result);
  }, [searchQuery, selectedTags, properties, searchParams]);

  const handleLogout = async () => {
    await (supabase.auth as any).signOut();
    navigate("/auth");
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: editName, avatar_url: editAvatar })
      .eq("id", userProfile.id);

    if (!error) {
      setUserProfile({ ...userProfile, full_name: editName, avatar_url: editAvatar });
      setIsEditingProfile(false);
      toast.success("Profile Updated");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-4 md:py-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            {/* THE TITLE WAS REMOVED FROM HERE TO CLEAN UP THE UI 
            */}
            <div className="flex-1" /> 

            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 bg-card p-1 pr-3 rounded-full border border-border/50">
                <img src={userProfile?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} className="w-8 h-8 rounded-full object-cover" />
                <ChevronDown className={`w-3 h-3 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-3 w-56 bg-card border border-border/50 rounded-2xl shadow-2xl p-2 z-50">
                    <button onClick={() => { setShowUserMenu(false); setIsEditingProfile(true); }} className="w-full flex items-center gap-3 p-3 hover:bg-secondary rounded-xl text-[10px] font-black uppercase tracking-widest"><Settings className="w-4 h-4"/> Edit Profile</button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest"><LogOut className="w-4 h-4"/> Sign Out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="relative group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search area or enter budget price..." 
              className="w-full bg-secondary/50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProps.length > 0 ? (
            filteredProps.map((p) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-[2rem] overflow-hidden border border-border/50 group cursor-pointer" onClick={() => navigate(`/property/${p.id}`)}>
                <div className="relative aspect-video overflow-hidden">
                  <img src={p.image_url || "/placeholder.jpg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[8px] font-black uppercase italic">
                    {p.features?.length || 0} Amenities
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black uppercase tracking-tight text-lg leading-none">{p.title}</h3>
                      <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase flex items-center gap-1"><MapPin className="w-3 h-3 text-primary"/> {p.area}</p>
                    </div>
                    <p className="text-xl font-black italic">₹{p.rent.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 text-xs font-black">
                     <Star className="w-3 h-3 fill-current" /> {p.rating || "0.0"}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No units found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isEditingProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-card border border-border w-full max-w-md rounded-[3rem] p-10 space-y-8 shadow-2xl relative">
              <button onClick={() => setIsEditingProfile(false)} className="absolute top-6 right-6 p-2 bg-secondary rounded-full"><X className="w-4 h-4"/></button>
              <div className="text-center">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Profile Info</h2>
              </div>
              <div className="space-y-4">
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Full Name" className="w-full bg-secondary/50 p-4 rounded-2xl border-none outline-none font-bold" />
                <input type="text" value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} placeholder="Avatar URL" className="w-full bg-secondary/50 p-4 rounded-2xl border-none outline-none font-bold text-xs" />
                <button onClick={handleSaveProfile} className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em]">Save Changes</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TenantDashboard;