import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Star, MapPin, Wallet, Home, Users, 
  X, Zap, IndianRupee, LayoutDashboard, Search, Bell, 
  Building2, Bed, Wifi, Wind, Tv, ChevronRight, 
  MapPinned, Navigation, PanelLeftClose, PanelLeft, Phone
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CubeLoader from "@/components/CubeLoader";

const Landing = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showEmergency, setShowEmergency] = useState(false);
  const [userRole, setUserRole] = useState<"tenant" | "landlord">("tenant");

  // Filter States
  const [budgetVal, setBudgetVal] = useState(15000);

  useEffect(() => {
    getFeatured();
  }, []);

  const getFeatured = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("properties").select("*").limit(6);
    if (error) console.error(error);
    setList(data || []);
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-slate-900 overflow-hidden font-sans">
      
      {/* 1. SIDEBAR */}
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
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <MapPin className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-black tracking-tighter">Rentifyx</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                <PanelLeftClose size={18} />
              </button>
            </div>

            <nav className="space-y-1 flex-1">
              <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-bold">
                <LayoutDashboard size={18} /> <span className="text-sm">Dashboard</span>
              </button>
              <button onClick={() => navigate("/properties")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-all font-semibold">
                <Search size={18} /> <span className="text-sm">Search PG</span>
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
              <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 shadow-sm">
                <PanelLeft size={18} />
              </button>
            )}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input type="text" placeholder="Quick Search..." className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 text-xs outline-none" />
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
          {/* HERO SECTION */}
          <div className="relative h-[50vh] w-full overflow-hidden bg-slate-200">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60">
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-[#F8F9FB]" />
            
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
               {/* ROLE TOGGLE */}
               <div className="flex p-1 bg-white/80 backdrop-blur-md rounded-2xl border border-white mb-6 shadow-sm">
                  <button onClick={() => setUserRole("tenant")} className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${userRole === "tenant" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400"}`}>Tenant</button>
                  <button onClick={() => setUserRole("landlord")} className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${userRole === "landlord" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400"}`}>Landlord</button>
               </div>

               <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-center leading-[0.9] text-slate-900 mb-8">
                  FIND RENT<br/>
                  <span className="text-indigo-600 italic">RELAX.</span>
               </h1>

               <button onClick={() => navigate("/properties")} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:scale-105 transition-transform">
                  Browse Listings <ArrowRight size={16} />
               </button>
            </div>
          </div>

          <div className="px-8 -mt-8 relative z-20 pb-20">
            {/* WIDGETS WITH CURVED SQUARE ICONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              
              {/* BUDGET - Functional */}
              <div onClick={() => navigate(`/properties?maxBudget=${budgetVal}`)} className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-center cursor-pointer hover:border-indigo-200 transition-all group">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Wallet className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Budget PGs</h3>
                <p className="font-bold text-slate-800 text-sm mb-3">Up to ₹{budgetVal.toLocaleString()}</p>
                <input 
                  type="range" min="5000" max="50000" step="500" 
                  value={budgetVal} 
                  onChange={(e) => { e.stopPropagation(); setBudgetVal(parseInt(e.target.value)); }} 
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* FURNISHED - Functional */}
              <div onClick={() => navigate("/properties?furnished=true")} className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-center cursor-pointer hover:border-indigo-200 transition-all group">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Home className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Furnished</h3>
                <p className="font-bold text-slate-800 text-sm">Premium Sets</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">Ready to Move</p>
              </div>

              {/* SHARED - Functional */}
              <div onClick={() => navigate("/properties?type=shared")} className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-center cursor-pointer hover:border-indigo-200 transition-all group">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Users className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shared</h3>
                <p className="font-bold text-slate-800 text-sm">Split Cost</p>
                <div className="mt-2 flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /><span className="w-1.5 h-1.5 rounded-full bg-indigo-200" /><span className="w-1.5 h-1.5 rounded-full bg-indigo-100" />
                </div>
              </div>

              {/* NEAR ME - Functional */}
              <div onClick={() => navigate("/properties?sort=distance")} className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-center cursor-pointer hover:border-indigo-200 transition-all group">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <MapPinned className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Near Me</h3>
                <div className="flex gap-2 mt-1">
                   <span className="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded-full uppercase">Live</span>
                   <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black rounded-full uppercase">GPS</span>
                </div>
              </div>
            </div>

            {/* FEATURED UNITS */}
            <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tighter text-slate-800">Featured Units</h2>
              {loading ? <div className="h-40 flex items-center justify-center"><CubeLoader /></div> : (
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