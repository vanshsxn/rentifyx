import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, MapPin, Wallet, Home, Users, Search, PanelLeftClose, PanelLeft,
  LayoutDashboard, Wifi, Tv, Utensils, ShieldCheck, MessageCircle, Heart,
  Zap, LifeBuoy, Crown, Plus, ListChecks, BarChart3, ChevronLeft, ChevronRight, Navigation,
  LogOut, Sparkles, Sliders, Bed, Bath
} from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CubeLoader from "@/components/CubeLoader";
import ChatDrawer from "@/components/ChatDrawer";
import EmergencyBookingModal from "@/components/EmergencyBookingModal";
import PropertyMap from "@/components/PropertyMap";
import { sortByProximity, getUserLocation } from "@/lib/geo";
import { toast } from "sonner";

const Landing = () => {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Widget States
  const [budgetVal, setBudgetVal] = useState(15000);
  const [furnishingType, setFurnishingType] = useState<'fully' | 'minimal'>('fully');
  const [splitPeople, setSplitPeople] = useState(3);
  const [totalRentInput, setTotalRentInput] = useState(18000);

  // Modals
  const [chatOpen, setChatOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  // Map / Featured
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const featuredScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("properties").select("*").then(({ data }) => {
      setProperties(data || []);
      setLoading(false);
    });
  }, []);

  // Get location for proximity sorting
  useEffect(() => {
    getUserLocation().then(setUserLoc).catch(() => {});
  }, []);

  // Budget Optimizer logic
  const optimizedResults = useMemo(() => {
    const filtered = properties
      .filter(p => p.rent <= budgetVal)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.rent - b.rent);
    return filtered.length > 0 ? filtered.slice(0, 6) : [];
  }, [properties, budgetVal]);

  // Featured units (Section 1)
  const featured = useMemo(() => {
    if (userLoc) {
      return sortByProximity(properties, userLoc).slice(0, 8);
    }
    return [...properties].sort((a, b) => Number(b.is_featured) - Number(a.is_featured)).slice(0, 8);
  }, [properties, userLoc]);

  const scrollFeatured = (dir: 'left' | 'right') => {
    if (!featuredScrollRef.current) return;
    featuredScrollRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  const requireAuth = (action: () => void) => {
    if (!user) {
      toast.info("Please sign in to continue");
      navigate("/auth");
      return;
    }
    action();
  };

  // Sidebar navigation mapping
  const navItems = useMemo(() => {
    const tenantNav = [
      { icon: LayoutDashboard, label: "Main Hub", action: () => navigate("/") },
      { icon: BarChart3, label: "Dashboard", action: () => requireAuth(() => navigate("/tenant")) },
      { icon: MessageCircle, label: "Chat", action: () => requireAuth(() => { setSupportOpen(false); setChatOpen(true); }) },
      { icon: Heart, label: "My Favorites", action: () => requireAuth(() => navigate("/tenant")) },
      { icon: Zap, label: "Emergency Booking", action: () => requireAuth(() => setEmergencyOpen(true)), accent: true },
      { icon: Crown, label: "Upgrade to Pro", action: () => toast.info("Pro plan coming soon ✨") },
      { icon: LifeBuoy, label: "Support", action: () => requireAuth(() => { setSupportOpen(true); setChatOpen(true); }) },
    ];

    const landlordNav = [
      { icon: LayoutDashboard, label: "Main Hub", action: () => navigate("/") },
      { icon: ShieldCheck, label: "Landlord Hub", action: () => requireAuth(() => navigate("/landlord")) },
      { icon: ListChecks, label: "My Listings", action: () => requireAuth(() => navigate("/landlord")) },
      { icon: Plus, label: "Post Property", action: () => requireAuth(() => navigate("/landlord")) },
      { icon: MessageCircle, label: "Chat", action: () => requireAuth(() => { setSupportOpen(false); setChatOpen(true); }) },
      { icon: BarChart3, label: "Analytics", action: () => requireAuth(() => navigate("/landlord")) },
      { icon: LifeBuoy, label: "Support", action: () => requireAuth(() => { setSupportOpen(true); setChatOpen(true); }) },
    ];

    const adminNav = [
      { icon: LayoutDashboard, label: "Main Hub", action: () => navigate("/") },
      { icon: ShieldCheck, label: "Admin Console", action: () => navigate("/admin") },
      { icon: MessageCircle, label: "All Chats", action: () => setChatOpen(true) },
    ];

    if (userRole === "admin") return adminNav;
    if (userRole === "landlord") return landlordNav;
    return tenantNav;
  }, [userRole, user]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F8F9FB]"><CubeLoader /></div>;

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-slate-900 overflow-hidden font-sans">

      {/* SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex flex-col border-r border-slate-200 bg-white p-6 shrink-0 relative z-[60]"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <MapPin className="text-white w-5 h-5" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase text-slate-800">Rentifyx</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-indigo-600">
                <PanelLeftClose size={20} />
              </button>
            </div>

            {user && (
              <div className="mb-5 p-3 bg-indigo-50 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">{userRole}</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <nav className="space-y-1.5 flex-1 overflow-y-auto -mx-2 px-2">
              {navItems.map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    i === 0 ? "bg-indigo-50 text-indigo-600" : (item as any).accent ? "text-red-600 hover:bg-red-50" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {user ? (
              <button onClick={handleSignOut} className="mt-3 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 font-bold text-sm transition">
                <LogOut size={18} /> <span>Sign Out</span>
              </button>
            ) : (
              <button onClick={() => navigate("/auth")} className="mt-3 w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition">
                Sign In
              </button>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* HEADER */}
        <header className="h-16 sm:h-20 border-b border-slate-100 bg-white/90 backdrop-blur-md px-4 sm:px-10 flex items-center justify-between z-[50] shrink-0">
          <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="hidden lg:block p-3 bg-white border border-slate-200 rounded-xl">
                <PanelLeft size={20} />
              </button>
            )}
            <div className="relative hidden sm:block w-64 md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Quick search..." className="w-full bg-slate-50 rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg cursor-pointer" onClick={() => user ? navigate("/profile") : navigate("/auth")}>
            {user?.email?.[0]?.toUpperCase() || "?"}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* HERO SECTION */}
          <div className="relative h-[45vh] w-full flex items-center justify-center overflow-hidden">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#F8F9FB]" />
            <div className="relative z-20 text-center px-4">
              <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight">
                FIND RENT <span className="text-indigo-400 italic">RELAX.</span>
              </h1>
            </div>
          </div>

          <div className="px-4 sm:px-10 -mt-12 relative z-30 pb-20">
            
            {/* PROPERTY EXPLORATION GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* LEFT SIDE: SECTIONS 1 & 2 */}
              <div className="lg:col-span-2 space-y-16">
                
                {/* SECTION 1: SLIDE LEFT PROPERTIES */}
                <section>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black tracking-widest text-indigo-500 uppercase">Premium Selection</p>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">Featured Properties</h2>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => scrollFeatured('left')} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                        <ChevronLeft size={18} />
                      </button>
                      <button onClick={() => scrollFeatured('right')} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>

                  <div 
                    ref={featuredScrollRef}
                    className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {featured.map((p) => (
                      <motion.div
                        key={p.id}
                        whileHover={{ y: -6 }}
                        onClick={() => navigate(`/property/${p.id}`)}
                        className="shrink-0 w-[280px] sm:w-[320px] bg-white border border-slate-100 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all snap-start"
                      >
                        <div className="h-44 relative">
                          <img src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"} className="w-full h-full object-cover" alt={p.title} />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-indigo-600 shadow-sm uppercase">Featured</div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-black text-sm text-slate-800 truncate">{p.title}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center gap-1">
                            <MapPin size={10} /> {p.area}
                          </p>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-indigo-600 font-black text-base">₹{p.rent.toLocaleString()}</span>
                            <div className="flex gap-2">
                               <Wifi size={14} className="text-slate-200" />
                               <Tv size={14} className="text-slate-200" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* SECTION 2: SCROLL DOWN FOR MORE */}
                <section>
                  <div className="mb-8">
                    <p className="text-[10px] font-black tracking-widest text-indigo-500 uppercase">Vast Inventory</p>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">Explore More Listings</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {properties.map((p) => (
                      <motion.div
                        key={`grid-${p.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ x: 6 }}
                        onClick={() => navigate(`/property/${p.id}`)}
                        className="group flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all cursor-pointer items-center"
                      >
                        <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                          <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-slate-800 truncate">{p.title}</h4>
                          <p className="text-[10px] text-slate-400 font-medium truncate mb-2">{p.area}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-indigo-600 font-black text-sm">₹{p.rent.toLocaleString()}</span>
                            <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => navigate('/properties')}
                    className="w-full mt-10 py-5 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black text-xs uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 transition-all bg-white/50"
                  >
                    View Entire Catalog
                  </button>
                </section>
              </div>

              {/* RIGHT SIDE: STICKY MAP INTEGRATION */}
              <div className="hidden lg:block sticky top-24 h-[calc(100vh-140px)] min-h-[550px]">
                <div className="h-full rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl relative group">
                  <PropertyMap
                    properties={properties} // Showing all properties stored in DB
                    userLocation={userLoc}
                    onMarkerClick={(id) => navigate(`/property/${id}`)}
                  />
                  
                  {/* Map Controls Overlay */}
                  <div className="absolute bottom-6 left-6 right-6 z-[40]">
                    <button
                      onClick={() => navigate("/near-me")}
                      className="w-full bg-white/95 backdrop-blur-md py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-indigo-600 shadow-2xl border border-white hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Navigation size={14} /> Full Screen View
                    </button>
                  </div>

                  {/* Aesthetic Corner Label */}
                  <div className="absolute top-6 left-6 z-[40] bg-indigo-600 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-lg">
                    Live Map
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* GLOBAL COMPONENTS */}
      <ChatDrawer
        open={chatOpen}
        onClose={() => { setChatOpen(false); setSupportOpen(false); }}
        openSupport={supportOpen}
      />
      <EmergencyBookingModal open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
    </div>
  );
};

export default Landing;