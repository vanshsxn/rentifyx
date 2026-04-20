import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Star, MapPin, Wallet, Home, Users, 
  X, Zap, IndianRupee, LayoutDashboard, LogIn, AlertTriangle, Phone, 
  Search, Bell, Menu, Building2, Bed, Wifi, Wind, Tv, 
  ChevronRight, MapPinned, GitCompareArrows, Navigation, PanelLeftClose, PanelLeft
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
    const { data, error } = await supabase.from("properties").select("*").limit(6);
    if (error) console.error(error);
    setList(data || []);
    setLoading(false);
  };

  const handleBudgetNavigation = () => {
    navigate(`/properties?maxBudget=${budgetVal}`);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-slate-900 overflow-hidden font-sans">
      
      {/* 1. COLLAPSIBLE SIDEBAR */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex flex-col border-r border-slate-200 bg-white p-6 z-50 shrink-0 relative"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-100">
                  <MapPin className="text-white w-4 h-4" />
                </div>
                <span className="text-lg font-black tracking-tighter">Rentifyx</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                <PanelLeftClose size={18} />
              </button>
            </div>

            <nav className="space-y-1 flex-1">
              <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-600 font-bold border border-indigo-100/50">
                <LayoutDashboard size={16} /> <span className="text-sm">Dashboard</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 transition-all font-semibold">
                <Search size={16} /> <span className="text-sm">Search PG</span>
              </button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* HEADER */}
        <header className="h-16 border-b border-slate-200 bg-white/70 backdrop-blur-md px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-4 flex-1">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 transition-all shadow-sm">
                <PanelLeft size={18} />
              </button>
            )}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input type="text" placeholder="Quick Search..." className="w-full bg-slate-100 border-none rounded-xl py-1.5 pl-10 pr-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setShowEmergency(true)} className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
               <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Emergency
            </button>
            <Bell className="text-slate-400" size={18} />
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">VS</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* HERO SECTION - Taller to show more video */}
          <div className="relative h-[55vh] w-full overflow-hidden bg-slate-200">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-70">
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-[#F8F9FB]" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center pb-12">
               <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-center leading-[0.9] text-slate-900 drop-shadow-md">
                  FIND RENT<br/>
                  <span className="text-indigo-600 italic">RELAX.</span>
               </h1>
            </div>
          </div>

          <div className="px-8 -mt-10 relative z-20 pb-20">
            {/* COMPACT WIDGETS - Lowered icons and overall size */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              
              {/* BUDGET */}
              <div className="p-4 rounded-[1.8rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-center">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center mb-2">
                  <Wallet className="text-indigo-600 w-4 h-4" />
                </div>
                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Budget PGs</h3>
                <p className="font-bold text-slate-800 text-xs mb-3">₹ 5,000 - ₹ {budgetVal.toLocaleString()}</p>
                <input 
                  type="range" min="5000" max="50000" step="500"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(parseInt(e.target.value))}
                  onMouseUp={handleBudgetNavigation}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* FURNISHED */}
              <div className="p-4 rounded-[1.8rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/40">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center mb-2 mx-auto">
                  <Home className="text-indigo-600 w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => setFurnishingType("fully")} className={`w-full py-1.5 px-3 rounded-lg text-[9px] font-bold flex items-center justify-between ${furnishingType === "fully" ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    Fully Furnished <Zap size={10} />
                  </button>
                  <button onClick={() => setFurnishingType("minimal")} className={`w-full py-1.5 px-3 rounded-lg text-[9px] font-bold ${furnishingType === "minimal" ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    Minimal Setup
                  </button>
                </div>
              </div>

              {/* SHARED */}
              <div className="p-4 rounded-[1.8rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/40 text-center">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center mb-2 mx-auto">
                  <Users className="text-indigo-600 w-4 h-4" />
                </div>
                <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Shared</h3>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-sm font-black text-indigo-600 leading-none">₹{Math.round(totalRentInput / peopleCount)}</p>
                  <p className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter mt-1">Split cost</p>
                </div>
              </div>

              {/* NEAR ME */}
              <div className="p-4 rounded-[1.8rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-center">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center mb-2">
                  <MapPinned className="text-indigo-600 w-4 h-4" />
                </div>
                <div className="flex gap-1.5 mb-2">
                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-full uppercase">Near Me</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black rounded-full uppercase">Closest</span>
                </div>
                <div className="flex justify-center gap-3 text-slate-300 mt-auto">
                  <Wifi size={14} /> <Tv size={14} /> <Users size={14} /> <Wind size={14} />
                </div>
              </div>
            </div>

            {/* FEATURED UNITS */}
            <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tighter text-slate-800">Featured Units</h2>
              {loading ? <CubeLoader /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map((p) => (
                    <motion.div 
                      key={p.id} 
                      whileHover={{ y: -5 }}
                      className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-xl transition-all cursor-pointer" 
                      onClick={() => navigate(`/property/${p.id}`)}
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-xl font-black text-[10px] text-indigo-600 shadow-md">₹{p.rent?.toLocaleString()}</div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-base font-bold text-slate-800 mb-0.5">{p.title}</h3>
                        <p className="text-slate-400 text-[10px] mb-3">{p.area}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          <div className="flex gap-2 text-slate-400 text-[9px] font-bold uppercase"><Bed size={12}/> {p.bedrooms || 1} Bed</div>
                          <div className="text-amber-500 font-bold flex items-center gap-1 text-[9px]"><Star size={12} className="fill-current"/> 4.8</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* EMERGENCY MODAL */}
      <AnimatePresence>
        {showEmergency && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEmergency(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative w-full max-w-xs bg-white p-6 rounded-[2rem] text-center shadow-2xl">
              <h3 className="text-lg font-black mb-4">Emergency</h3>
              <div className="space-y-2">
                <a href="tel:100" className="flex items-center gap-3 w-full py-3 px-4 bg-rose-600 text-white rounded-xl font-black text-xs tracking-widest uppercase"><Phone size={14}/> Police</a>
                <a href="tel:102" className="flex items-center gap-3 w-full py-3 px-4 bg-slate-100 text-slate-800 rounded-xl font-black text-xs tracking-widest uppercase"><Phone size={14}/> Ambulance</a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;