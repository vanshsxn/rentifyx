import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, MapPin, Star, Heart, Shield, X, Loader2, User, 
  Settings, LogOut, ChevronDown, Camera, Edit3, Sparkles, 
  ZapIcon, MessageSquare, Mail, Phone, CalendarDays
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TenantDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [bestMatch, setBestMatch] = useState<any>(null);
  const [otherProperties, setOtherProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  
  const isOptimized = searchParams.get("optimize") === "true";
  const hasMaxRent = searchParams.get("maxRent");
  const isEmergency = searchParams.get("emergency") === "true";
  
  const [activeTab, setActiveTab] = useState<"discover" | "overview">(
    isOptimized || hasMaxRent || isEmergency ? "discover" : "overview"
  );
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});

  const getPageTitle = () => {
    if (activeTab === "overview") return "My Tenant Hub";
    if (isOptimized || hasMaxRent) return "Smart Budget Analyzer";
    if (userProfile?.role === 'landlord') return "Landlord Hub";
    return "Marketplace";
  };

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const { data: { user } } = await (supabase.auth as any).getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile) {
        setUserProfile(profile);
        setEditName(profile.full_name || "");
        setEditAvatar(profile.avatar_url || "");
      }
      
      const { data: favs } = await supabase.from("favorites").select("property_id").eq("user_id", user.id);
      if (favs && favs.length > 0) {
        const favIds = favs.map((f: any) => f.property_id);
        const { data: favProps } = await supabase.from("properties").select("*").in("id", favIds);
        if (favProps) setFavorites(favProps);
      }
    }
    const { data: props, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
    if (!error && props) setProperties(props);
    
    // Unread logic
    if (user) {
      const { data: convs } = await supabase.from("conversations").select("id").or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`);
      if (convs && convs.length > 0) {
        const { count } = await supabase.from("messages").select("*", { count: "exact", head: true })
          .in("conversation_id", convs.map(c => c.id))
          .neq("sender_id", user.id)
          .is("read_at", null);
        if (count) setUnreadCount(count);
      }
    }
    // Fetch Ratings
    const { data: ratingData } = await supabase.from("property_ratings").select("property_id, rating");
    const map: Record<string, { sum: number; count: number }> = {};
    (ratingData || []).forEach((r: any) => {
      if (!map[r.property_id]) map[r.property_id] = { sum: 0, count: 0 };
      map[r.property_id].sum += Number(r.rating) || 0;
      map[r.property_id].count += 1;
    });
    const agg: Record<string, { avg: number; count: number }> = {};
    Object.entries(map).forEach(([k, v]) => {
      agg[k] = { avg: v.count > 0 ? v.sum / v.count : 0, count: v.count };
    });
    setRatings(agg);

    setLoading(false);
  };

  const liveRating = (p: any) => {
    const r = ratings[p.id];
    if (r && r.count > 0) return r.avg.toFixed(1);
    if (p.rating && p.rating > 0) return Number(p.rating).toFixed(1);
    return "0.0";
  };

  useEffect(() => {
    if (!properties.length) return;
    let pool = [...properties];
    const emergencyOnly = searchParams.get("emergency") === "true";
    if (emergencyOnly) pool = pool.filter((p) => p.is_emergency);
    
    if (selectedTags.length > 0) {
      pool = pool.filter(p => {
        const combined = [...(p.features || []), ...(p.tags || [])];
        return selectedTags.every(tag => combined.includes(tag));
      });
    }

    const maxRentParam = searchParams.get("maxRent");
    const numericQuery = !isNaN(Number(searchQuery)) && searchQuery !== "" ? Number(searchQuery) : null;
    const budgetLimit = numericQuery || (maxRentParam ? Number(maxRentParam) : null);

    if (budgetLimit) {
      const exactMatches = pool.filter(p => Number(p.rent) === budgetLimit);
      const underBudget = pool.filter(p => Number(p.rent) < budgetLimit);
      const sortByFeatures = (arr: any[]) => arr.sort((a, b) => {
        const aCount = [...(a.features || []), ...(a.tags || [])].length;
        const bCount = [...(b.features || []), ...(b.tags || [])].length;
        return bCount - aCount;
      });
      const sortedExact = sortByFeatures([...exactMatches]);
      const sortedUnder = sortByFeatures([...underBudget]);
      
      if (sortedExact.length > 0) {
        setBestMatch(sortedExact[0]);
        setOtherProperties([...sortedExact.slice(1), ...sortedUnder]);
      } else if (sortedUnder.length > 0) {
        setBestMatch(sortedUnder[0]);
        setOtherProperties(sortedUnder.slice(1));
      } else {
        setBestMatch(null);
        setOtherProperties([]);
      }
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = pool.filter(p => p.title?.toLowerCase().includes(query) || p.area?.toLowerCase().includes(query));
      setBestMatch(null);
      setOtherProperties(filtered);
    }
  }, [searchQuery, selectedTags, properties, searchParams]);

  const handleLogout = async () => {
    await (supabase.auth as any).signOut();
    navigate("/auth");
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase.from("profiles").update({ 
      full_name: editName, avatar_url: editAvatar 
    }).eq("id", userProfile.id);
    
    if (!error) {
      setUserProfile({ ...userProfile, full_name: editName, avatar_url: editAvatar });
      setIsEditingProfile(false);
      toast.success("Profile Updated");
    } else {
      toast.error("Failed to update profile");
    }
  };

  const PropertyCard = ({ p, isHero = false }: { p: any, isHero?: boolean }) => {
    const amenitiesCount = Array.from(new Set([...(p.features || []), ...(p.tags || [])])).length;
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className={`bg-card rounded-[2.5rem] overflow-hidden border flex flex-col ${isHero ? 'border-primary/40 shadow-2xl shadow-primary/10' : 'border-border/50'} group cursor-pointer hover:shadow-2xl transition-all h-full`} 
        onClick={() => navigate(`/property/${p.id}`)}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={p.image_url || "/placeholder.jpg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          {isHero && (
            <div className="absolute top-4 left-4 bg-primary px-4 py-2 rounded-2xl text-[10px] font-black text-white uppercase flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Best Match
            </div>
          )}
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-white">
            ₹{p.rent.toLocaleString()}
          </div>
          <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-wider text-primary-foreground shadow-lg">
            {amenitiesCount} Premium Features
          </div>
        </div>
        <div className="p-7 space-y-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="font-black uppercase tracking-tighter text-lg leading-tight group-hover:text-primary transition-colors">{p.title}</h3>
                <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary"/> {p.area}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-orange-500/10 text-orange-600 px-2 py-1 rounded-lg text-[10px] font-black">
                 <Star className="w-3 h-3 fill-current" /> {liveRating(p)}
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Monthly Rent</span>
             <span className="text-sm font-black italic tracking-tight">₹{p.rent.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Syncing Database...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-4 md:py-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black italic tracking-tighter uppercase text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {getPageTitle()}
            </h1>
            
            <div className="flex gap-2">
              <button onClick={() => navigate("/chat")} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-border transition-colors border border-border/50 relative">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>}
              </button>
              
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 bg-card p-1 pr-3 rounded-full border border-border/50 hover:bg-secondary transition-colors">
                  <img src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.full_name || 'User'}`} className="w-8 h-8 rounded-full border border-border object-cover bg-secondary" />
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                      <button onClick={() => { setActiveTab("overview"); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-widest">My Hub</span>
                      </button>
                      <button onClick={() => { setActiveTab("discover"); setShowUserMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors text-left border-t border-border/50">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Marketplace</span>
                      </button>
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-left border-t border-border/50">
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Log Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          
          {activeTab === "discover" && (
            <div className="relative group w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search area or enter budget price..." 
                className="w-full bg-secondary/50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-12">
        {activeTab === "overview" && (
          <div className="space-y-12">
            {/* Welcome Card */}
            <section className="bg-card rounded-[3rem] border border-border p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20" />
              <div className="relative">
                <img src={userProfile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.full_name || 'User'}`} className="w-32 h-32 rounded-full border-4 border-background shadow-xl object-cover bg-secondary" />
              </div>
              <div className="flex-1 space-y-4 text-center md:text-left z-10">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Welcome Back, <span className="text-primary">{userProfile?.full_name || "Tenant"}</span>!</h2>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-2 flex items-center justify-center md:justify-start gap-4">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> {userProfile?.email}</span>
                    {userProfile?.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> {userProfile?.phone}</span>}
                  </p>
                </div>
                <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-3">
                  <button onClick={() => navigate("/visits")} className="px-5 py-2.5 rounded-xl bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest border border-border hover:bg-border transition-all flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5" /> My Visits
                  </button>
                  <button onClick={() => navigate("/chat")} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground flex text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" /> Open Messages
                  </button>
                </div>
              </div>
            </section>

            {/* Wishlist inline */}
            <section className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary fill-primary" />
                  Your Wishlist ({favorites.length})
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {favorites.length > 0 ? (
                  favorites.map((p) => <PropertyCard key={p.id} p={p} />)
                ) : (
                  <div className="col-span-full py-20 text-center bg-card rounded-[3rem] border border-dashed border-border/50">
                    <Heart className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Your wishlist is empty. Start exploring the marketplace!</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "discover" && (
          <>
            {/* BEST MATCH SECTION */}
            {bestMatch && (
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary whitespace-nowrap">Your Recommended Unit</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
                <div className="max-w-lg mx-auto">
                  <PropertyCard p={bestMatch} isHero />
                </div>
              </section>
            )}

            {/* OTHER PROPERTIES SECTION */}
            <section className="space-y-8">
              {otherProperties.length > 0 && (
                <div className="flex items-center justify-between">
                  <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                    <ZapIcon className="w-4 h-4 text-amber-500" />
                    {bestMatch ? "Other Options Within Budget" : "Available Properties"}
                  </h2>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherProperties.length > 0 ? (
                  otherProperties.map((p) => <PropertyCard key={p.id} p={p} />)
                ) : !bestMatch && (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No matches found for this criteria.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};
export default TenantDashboard;