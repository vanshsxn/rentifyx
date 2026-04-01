import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, MapPin, Star, Heart, Wifi, Car, Droplets, Shield, Wind, Zap, 
  Dumbbell, SlidersHorizontal, ArrowLeftRight, X, 
  Loader2, User, Settings, LogOut, ChevronDown, Camera, Edit3, Sparkles
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

  const isOptimized = searchParams.get("optimize") === "true";
  const hasMaxRent = searchParams.get("maxRent");

  const getPageTitle = () => {
    if (isOptimized || hasMaxRent) return "Smart Budget Analyzer";
    if (userProfile?.role === 'landlord') return "Landlord Hub";
    return "Marketplace";
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    // Using explicit casting as requested
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
      result = result.filter(p => {
        const combined = [...(p.features || []), ...(p.tags || [])];
        return selectedTags.every(tag => combined.includes(tag));
      });
    }

    const maxRentParam = searchParams.get("maxRent");
    const numericQuery = !isNaN(Number(searchQuery)) && searchQuery !== "" ? Number(searchQuery) : null;
    const budgetLimit = numericQuery || (maxRentParam ? Number(maxRentParam) : null);

    if (isOptimized || budgetLimit) {
      const limit = budgetLimit || Infinity;
      const withinBudget = result.filter(p => Number(p.rent) <= limit);
      
      result = withinBudget.sort((a, b) => {
        const aCount = [...(a.features || []), ...(a.tags || [])].length;
        const bCount = [...(b.features || []), ...(b.tags || [])].length;
        return bCount - aCount;
      });

      if (isOptimized && result.length > 0) {
        result = [result[0]];
      }
    } 
    else if (searchQuery && isNaN(Number(searchQuery))) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(query) || p.area?.toLowerCase().includes(query)
      );
    }

    setFilteredProps(result);
  }, [searchQuery, selectedTags, properties, searchParams, isOptimized]);

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

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Syncing Database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-4 md:py-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black italic tracking-tighter uppercase text-primary flex items-center gap-2">
              {isOptimized && <Sparkles className="w-5 h-5" />}
              {getPageTitle()}
            </h1>

            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 bg-card p-1 pr-3 rounded-full border border-border/50 hover:border-primary/50 transition-colors">
                <img src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.full_name || 'User'}`} className="w-8 h-8 rounded-full object-cover border border-border" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProps.length > 0 ? (
            filteredProps.map((p, idx) => {
              const amenitiesCount = Array.from(new Set([...(p.features || []), ...(p.tags || [])])).length;
              
              return (
                <motion.div 
                  key={p.id} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card rounded-[2.5rem] overflow-hidden border border-border/50 group cursor-pointer hover:shadow-2xl hover:shadow-primary/5 transition-all" 
                  onClick={() => navigate(`/property/${p.id}`)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={p.image_url || "/placeholder.jpg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-white">
                      ₹{p.rent.toLocaleString()}
                    </div>
                    <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-wider text-primary-foreground shadow-lg">
                      {amenitiesCount} Premium Features
                    </div>
                  </div>
                  <div className="p-7 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-black uppercase tracking-tighter text-lg leading-tight group-hover:text-primary transition-colors">{p.title}</h3>
                        <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary"/> {p.area}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-orange-500/10 text-orange-600 px-2 py-1 rounded-lg text-[10px] font-black">
                         <Star className="w-3 h-3 fill-current" /> {p.rating?.toFixed(1) || "0.0"}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Monthly Rent</span>
                       <span className="text-sm font-black italic tracking-tight">₹{p.rent.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-32 text-center space-y-6">
              <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Search className="w-8 h-8 text-muted-foreground opacity-50" />
              </div>
              <div className="space-y-2">
                <p className="text-[12px] font-black uppercase tracking-[0.3em] text-foreground">No Units Found</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Try adjusting your budget or search area</p>
              </div>
              <button 
                onClick={() => { setSearchQuery(""); navigate("/tenant-dashboard"); }}
                className="px-8 py-3 bg-secondary rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-border transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isEditingProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border border-border w-full max-w-md rounded-[3rem] p-10 space-y-8 shadow-2xl relative"
            >
              <button onClick={() => setIsEditingProfile(false)} className="absolute top-8 right-8 p-2 bg-secondary hover:bg-border rounded-full transition-colors"><X className="w-4 h-4"/></button>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Profile Settings</h2>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Manage your identity</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest ml-4 text-muted-foreground">Full Name</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Enter Name" className="w-full bg-secondary/50 p-4 rounded-2xl border border-transparent focus:border-primary/20 outline-none font-bold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest ml-4 text-muted-foreground">Avatar Image URL</label>
                  <input type="text" value={editAvatar} onChange={(e) => setEditAvatar(e.target.value)} placeholder="https://..." className="w-full bg-secondary/50 p-4 rounded-2xl border border-transparent focus:border-primary/20 outline-none font-bold text-xs" />
                </div>
                <button onClick={handleSaveProfile} className="w-full py-5 bg-primary text-primary-foreground rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                  Save Preferences
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TenantDashboard;