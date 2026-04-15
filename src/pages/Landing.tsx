import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Star, MapPin, Wallet, Home, Users,
  X, Zap, IndianRupee, LayoutDashboard, LogIn, AlertTriangle, Phone, Search, Bell, Menu,
  Building2, Bed, Wifi, Wind, Tv, ChevronRight, MapPinned, GitCompareArrows, Navigation
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CubeLoader from "@/components/CubeLoader";
import ComparisonDrawer from "@/components/ComparisonDrawer";

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const Landing = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [tempBudget, setTempBudget] = useState("");
  const [showEmergency, setShowEmergency] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState("Detecting...");
  const [ratingsMap, setRatingsMap] = useState<Record<string, { avg: number; count: number }>>({});
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [compareProperties, setCompareProperties] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
    getFeatured();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationName("Your Current Area");
      });
    }
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setIsLoggedIn(true);
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle();
      setUserRole(data?.role || "tenant");
    }
  };

  const getFeatured = async () => {
    let { data } = await supabase.from("properties").select("*").eq("is_featured", true).limit(10);
    setList(data || []);
    setLoading(false);
  };

  const filters = [
    { icon: Wallet, label: "BUDGET PGs", desc: "Smart Optimizer", action: () => setShowBudgetModal(true), progress: "w-3/5" },
    { icon: Home, label: "FURNISHED", desc: "Ready to move", action: () => navigate("/furnished"), progress: "w-full" },
    { icon: Users, label: "SHARED", desc: "Split the cost", action: () => navigate("/shared"), progress: "w-1/2" },
    { icon: MapPinned, label: "NEAR ME", desc: "Closest first", action: () => navigate("/properties?sort=distance"), progress: "w-4/5" },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      
      {/* 1. THE SIDEBAR (GLASSMORPHIC) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-black/40 backdrop-blur-3xl p-6 z-50 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <MapPin className="text-primary w-8 h-8" />
          <span className="text-2xl font-black tracking-tighter">Rentifyx</span>
        </div>

        <nav className="space-y-2 flex-1">
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 text-primary border border-primary/20 font-bold">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:text-white transition-all">
            <Search size={20} /> Search PG
          </button>
        </nav>

        {userRole === 'landlord' && (
          <button onClick={() => navigate("/landlord")} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] tracking-widest uppercase mb-4">
            + Post Property
          </button>
        )}
      </aside>

      {/* 2. MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* TOP DASHBOARD HEADER */}
        <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-xl px-8 flex items-center justify-between z-40">
          <div className="flex-1 max-w-md">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input type="text" placeholder="Quick Search PG..." className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none" />
             </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setShowEmergency(true)} className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
               <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> Emergency Stay
            </button>
            <Bell className="text-gray-400 cursor-pointer" size={20} />
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40 font-bold text-primary">VS</div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT BODY */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* HERO VIDEO (Restored) */}
          <div className="relative h-[50vh] w-full overflow-hidden">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-50">
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center">
               <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-center leading-[0.85]">
                  FIND RENT<br/>
                  <span className="text-primary italic">RELAX.</span>
               </h1>
            </div>
          </div>

          <div className="px-8 -mt-20 relative z-20 pb-20">
            {/* THE PLACEHOLDER FILTER CARDS (Restored) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              {filters.map((f) => (
                <button key={f.label} onClick={f.action} className="p-6 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-2xl text-left hover:bg-white/10 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <f.icon className="text-primary w-6 h-6" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">{f.label}</h3>
                  <p className="font-bold text-sm mb-3">{f.desc}</p>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className={`${f.progress} h-full bg-primary`} />
                  </div>
                </button>
              ))}
            </div>

            {/* SPLIT VIEW: LISTINGS VS MAP */}
            <div className="flex flex-col xl:flex-row gap-8">
              
              {/* LISTINGS LEFT */}
              <div className="flex-1 space-y-8">
                <h2 className="text-4xl font-black tracking-tighter">Featured Units</h2>
                {loading ? <CubeLoader /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {list.map((p) => (
                      <div key={p.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group hover:bg-white/10 transition-all cursor-pointer" onClick={() => navigate(`/property/${p.id}`)}>
                        <div className="relative h-64 overflow-hidden">
                          <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute top-4 right-4 bg-primary px-4 py-2 rounded-full font-black text-xs">₹{p.rent.toLocaleString()}</div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-1">{p.title}</h3>
                          <p className="text-gray-400 text-sm mb-4">{p.area}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex gap-3 text-gray-400 text-xs"><Bed size={14}/> {p.bedrooms || 1} Bed</div>
                            <div className="text-orange-500 font-bold flex items-center gap-1"><Star size={14} className="fill-current"/> 4.8</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MAP RIGHT (Fixed Integration) */}
              <div className="w-full xl:w-[420px] shrink-0">
                <div className="sticky top-8 h-[600px] rounded-[3rem] border border-white/10 overflow-hidden bg-white/5 backdrop-blur-md">
                   {/* We use iframe as a placeholder for Google Maps / OSM */}
                  <iframe
                    title="Map View"
                    width="100%" height="100%"
                    className="grayscale brightness-50 contrast-125 opacity-60 hover:opacity-100 transition-opacity"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation ? `${userLocation.lng - 0.02},${userLocation.lat - 0.02},${userLocation.lng + 0.02},${userLocation.lat + 0.02}` : '77.3,28.5,77.5,28.7'}&layer=mapnik`}
                  />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3">
                     <Navigation size={18} className="text-primary" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Live Area View</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* THE MODALS (Restored logic) */}
      <AnimatePresence>
        {showEmergency && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEmergency(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative w-full max-w-sm bg-card border border-white/10 p-8 rounded-[2.5rem] text-center">
              <h2 className="text-2xl font-black mb-6">EMERGENCY HELPLINE</h2>
              <div className="space-y-3">
                <a href="tel:100" className="flex items-center gap-3 w-full py-4 px-5 bg-destructive text-white rounded-2xl font-black uppercase text-xs tracking-widest"><Phone size={16}/> Police — 100</a>
                <a href="tel:102" className="flex items-center gap-3 w-full py-4 px-5 bg-white/10 rounded-2xl font-black uppercase text-xs tracking-widest"><Phone size={16}/> Ambulance — 102</a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Landing;