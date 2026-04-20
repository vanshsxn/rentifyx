import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Star, MapPin, Wallet, Home, Users, 
  X, Zap, IndianRupee, LayoutDashboard, LogIn, AlertTriangle, Phone, 
  Search, Bell, Menu, Building2, Bed, Wifi, Wind, Tv, 
  ChevronRight, MapPinned, GitCompareArrows, Navigation, PanelLeftClose, PanelLeft
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CubeLoader from "@/components/CubeLoader";

const Landing = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Widget States
  const [budgetVal, setBudgetVal] = useState(15000);
  const [furnishingType, setFurnishingType] = useState<"fully" | "minimal">("fully");
  const [totalRentInput, setTotalRentInput] = useState(18000);
  const [peopleCount, setPeopleCount] = useState(3);

  useEffect(() => {
    checkUser();
    getFeatured();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle();
      setUserRole(data?.role || "tenant");
    }
  };

  const getFeatured = async () => {
    setLoading(true);
    // Fetching all to ensure list populates; add .eq("is_featured", true) if you have that column set
    const { data, error } = await supabase.from("properties").select("*").limit(6);
    if (error) console.error(error);
    setList(data || []);
    setLoading(false);
  };

  const handleBudgetNavigation = () => {
    navigate(`/properties?maxBudget=${budgetVal}`);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-slate-900 overflow-hidden">
      
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex flex-col border-r border-slate-200 bg-white p-6 z-50 shrink-0 relative shadow-sm"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
                  <MapPin className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tighter">Rentifyx</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                <PanelLeftClose size={20} />
              </button>
            </div>

            <nav className="space-y-1 flex-1">
              <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-bold border border-indigo-100/50">
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-all font-semibold">
                <Search size={18} /> Search PG
              </button>
            </nav>

            {userRole === 'landlord' && (
              <button onClick={() => navigate("/landlord")} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase mb-4 shadow-lg shadow-indigo-100">
                + Post Property
              </button>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 2. MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-4 flex-1">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 transition-all shadow-sm">
                <PanelLeft size={20} />
              </button>
            )}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Quick Search PG..." className="w-full bg-slate-100 border border-transparent rounded-xl py-2 pl-12 pr-4 text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setShowEmergency(true)} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest">
               <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Emergency Stay
            </button>
            <Bell className="text-slate-400 cursor-pointer" size={20} />
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-white shadow-md font-bold text-white">VS</div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* HERO VIDEO - Optimized Visibility */}
          <div className="relative h-[50vh] w-full overflow-hidden bg-slate-200">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply">
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 to-[#F8F9FB]" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center">
               <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-center leading-[0.85] text-slate-900 drop-shadow-sm">
                  FIND RENT<br/>
                  <span className="text-indigo-600 italic">RELAX.</span>
               </h1>
            </div>
          </div>

          <div className="px-8 -mt-20 relative z-20 pb-20">
            {/* INTERACTIVE FILTERS - Same sizing as your requested reference */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              
              {/* BUDGET WIDGET */}
              <div className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center group relative">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Wallet className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Budget PGs</h3>
                <p className="font-bold text-slate-800 text-sm mb-3">₹ 5,000 - ₹ {budgetVal.toLocaleString()}</p>
                <input 
                  type="range" min="5000" max="50000" step="500"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(parseInt(e.target.value))}
                  onMouseUp={handleBudgetNavigation}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* FURNISHED WIDGET */}
              <div className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 mx-auto">
                  <Home className="text-indigo-600 w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <button onClick={() => setFurnishingType("fully")} className={`w-full py-2 px-4 rounded-xl text-[10px] font-bold flex items-center justify-between transition-all ${furnishingType === "fully" ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'}`}>
                    Fully Furnished <Zap size={12} />
                  </button>
                  <button onClick={() => setFurnishingType("minimal")} className={`w-full py-2 px-4 rounded-xl text-[10px] font-bold transition-all ${furnishingType === "minimal" ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'}`}>
                    Minimal Setup
                  </button>
                </div>
              </div>

              {/* SHARED WIDGET */}
              <div className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 mx-auto">
                  <Users className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Shared</h3>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-lg font-black text-indigo-600 leading-tight">₹{Math.round(totalRentInput / peopleCount)}</p>
                  <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest mt-1">Split ({peopleCount} people)</p>
                </div>
              </div>

              {/* NEAR ME WIDGET */}
              <div className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                  <MapPinned className="text-indigo-600 w-6 h-6" />
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center gap-1 uppercase">
                    <Navigation size={10} className="fill-current" /> Smart Sort
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black rounded-full border border-slate-200 uppercase">Closest</span>
                </div>
                <div className="flex justify-center gap-4 text-slate-300 mt-auto">
                  <Wifi size={18} /> <Tv size={18} /> <Users size={18} /> <Wind size={18} />
                </div>
              </div>
            </div>

            {/* FEATURED UNITS - Fixed Data Mapping */}
            <div className="flex flex-col xl:flex-row gap-8">
              <div className="flex-1 space-y-8">
                <h2 className="text-4xl font-black tracking-tighter text-slate-800">Featured Units</h2>
                {loading ? <CubeLoader /> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {list.map((p) => (
                      <motion.div 
                        key={p.id} 
                        whileHover={{ y: -5 }}
                        className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-xl transition-all cursor-pointer" 
                        onClick={() => navigate(`/property/${p.id}`)}
                      >
                        <div className="relative h-64 overflow-hidden">
                          <img src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl font-black text-xs text-indigo-600 shadow-lg">₹{p.rent?.toLocaleString()}</div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-bold mb-1 text-slate-800">{p.title}</h3>
                          <p className="text-slate-500 text-sm mb-4">{p.area}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex gap-3 text-slate-400 text-xs font-bold uppercase"><Bed size={14}/> {p.bedrooms || 1} Bed</div>
                            <div className="text-amber-500 font-bold flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-xs"><Star size={14} className="fill-current"/> 4.8</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* MAP SECTION */}
              <div className="w-full xl:w-[420px] shrink-0">
                <div className="sticky top-8 h-[600px] rounded-[3rem] border border-slate-200 overflow-hidden bg-white shadow-2xl shadow-slate-200">
                  <iframe
                    title="Map View" width="100%" height="100%"
                    className="grayscale contrast-75 brightness-110 opacity-70 hover:opacity-100 transition-opacity"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation ? `${userLocation.lng - 0.02},${userLocation.lat - 0.02},${userLocation.lng + 0.02},${userLocation.lat + 0.02}` : '77.3,28.5,77.5,28.7'}&layer=mapnik`}
                  />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-xl">
                     <Navigation size={18} className="text-indigo-600" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Live Area View</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* EMERGENCY MODAL */}
      <AnimatePresence>
        {showEmergency && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEmergency(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative w-full max-w-sm bg-white border border-slate-200 p-8 rounded-[2.5rem] text-center shadow-2xl">
              <h2 className="text-2xl font-black mb-6 text-slate-800">EMERGENCY HELPLINE</h2>
              <div className="space-y-3">
                <a href="tel:100" className="flex items-center gap-3 w-full py-4 px-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-rose-100"><Phone size={16}/> Police — 100</a>
                <a href="tel:102" className="flex items-center gap-3 w-full py-4 px-5 bg-slate-100 text-slate-800 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-colors"><Phone size={16}/> Ambulance — 102</a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Landing;