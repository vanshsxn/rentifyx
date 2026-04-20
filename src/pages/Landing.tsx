import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Star, MapPin, Wallet, Home, Users, X, Zap, 
  LayoutDashboard, Search, Bell, Menu, Building2, Bed, Wifi, 
  Wind, Tv, ChevronRight, MapPinned, Navigation, PanelLeftClose, PanelLeft
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CubeLoader from "@/components/CubeLoader";

const Landing = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Widget States
  const [budgetVal, setBudgetVal] = useState(15000);
  const [furnishingType, setFurnishingType] = useState<"fully" | "minimal">("fully");
  const [totalRentInput, setTotalRentInput] = useState(18000);
  const [peopleCount, setPeopleCount] = useState(3);

  useEffect(() => {
    getFeatured();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  const getFeatured = async () => {
    setLoading(true);
    // Removed the 'is_featured' filter temporarily to ensure data shows up if you haven't flagged properties yet
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .limit(6);
    
    if (error) {
      console.error("Supabase Error:", error.message);
    } else {
      setList(data || []);
    }
    setLoading(false);
  };

  const handleBudgetComplete = () => {
    navigate(`/properties?maxBudget=${budgetVal}`);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-slate-900 overflow-hidden font-sans">
      
      {/* 1. SIDEBAR (Collapsible) */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex flex-col border-r border-slate-200 bg-white p-6 z-50 shrink-0 relative"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
                  <MapPin className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-800">Rentifyx</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                <PanelLeftClose size={20} />
              </button>
            </div>

            <nav className="space-y-1 flex-1">
              <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-bold border border-indigo-100/50 transition-all">
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-all font-semibold">
                <Search size={18} /> Search PG
              </button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* HEADER */}
        <header className="h-20 border-b border-slate-200 bg-white/70 backdrop-blur-md px-8 flex items-center justify-between z-40">
          <div className="flex items-center gap-4 flex-1">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-indigo-600 transition-all shadow-sm">
                <PanelLeft size={20} />
              </button>
            )}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Quick Search PG..." className="w-full bg-slate-100 border border-transparent rounded-xl py-2 pl-12 pr-4 text-sm outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all" />
            </div>
          </div>
          
          <div className="flex items-center gap-5">
            <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-rose-100 transition-all">
               <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Emergency Stay
            </button>
            <Bell className="text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors" size={20} />
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center border-2 border-white shadow-md font-bold text-white text-sm">VS</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* HERO */}
          <div className="relative h-[40vh] w-full flex items-center justify-center bg-slate-50">
            <div className="absolute inset-0 overflow-hidden opacity-30">
               <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]" />
            </div>
            <h1 className="relative z-10 text-6xl md:text-8xl font-black tracking-tighter text-center leading-[0.9] text-slate-900">
               FIND RENT<br/>
               <span className="text-indigo-600 italic">RELAX.</span>
            </h1>
          </div>

          <div className="px-8 -mt-12 relative z-20 pb-20">
            {/* COMPACT WIDGETS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              
              {/* BUDGET */}
              <div className="p-5 rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/40">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                  <Wallet className="text-indigo-600 w-4 h-4" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Budget PGs</h3>
                <p className="font-bold text-slate-800 text-sm mb-3">₹ 5,000 - ₹ {budgetVal.toLocaleString()}</p>
                <input 
                  type="range" min="5000" max="50000" step="500"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(parseInt(e.target.value))}
                  onMouseUp={handleBudgetComplete}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* FURNISHED */}
              <div className="p-5 rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/40">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mb-3 mx-auto">
                  <Home className="text-indigo-600 w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => setFurnishingType("fully")} className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-between ${furnishingType === "fully" ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>
                    Fully Furnished <Zap size={10} />
                  </button>
                  <button onClick={() => setFurnishingType("minimal")} className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${furnishingType === "minimal" ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>
                    Minimal Setup
                  </button>
                </div>
              </div>

              {/* SHARED */}
              <div className="p-5 rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/40 text-center">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mb-2 mx-auto">
                  <Users className="text-indigo-600 w-4 h-4" />
                </div>
                <p className="text-[9px] text-slate-400 uppercase font-bold mb-2 tracking-widest">Shared Plan</p>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[14px] font-black text-indigo-600 leading-none">₹{Math.round(totalRentInput / peopleCount)} <span className="text-[8px] text-slate-400 uppercase tracking-tighter">each</span></p>
                  <p className="text-[8px] text-slate-400 uppercase font-bold mt-1 tracking-tighter">Split between {peopleCount}</p>
                </div>
              </div>

              {/* NEAR ME */}
              <div className="p-5 rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mb-3">
                  <MapPinned className="text-indigo-600 w-4 h-4" />
                </div>
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-indigo-600 text-white text-[8px] font-black rounded-full flex items-center gap-1 uppercase">
                    <Navigation size={8} className="fill-current" /> Smart Sort
                  </span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[8px] font-black rounded-full uppercase">Closest</span>
                </div>
                <div className="flex justify-center gap-4 text-slate-300 mt-auto">
                  <Wifi size={14} /> <Tv size={14} /> <Users size={14} /> <Wind size={14} />
                </div>
              </div>
            </div>

            {/* FEATURED UNITS */}
            <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tighter text-slate-800">Featured Units</h2>
              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                  <CubeLoader />
                  <p className="text-slate-400 text-xs font-bold animate-pulse">Fetching premium listings...</p>
                </div>
              ) : list.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map((p) => (
                    <motion.div 
                      key={p.id} 
                      whileHover={{ y: -8 }}
                      className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => navigate(`/property/${p.id}`)}
                    >
                      <div className="relative h-56 overflow-hidden bg-slate-100">
                        <img src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-xl text-indigo-600 font-black text-xs shadow-md">₹{p.rent?.toLocaleString()}</div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{p.title}</h3>
                        <p className="text-slate-500 text-xs mb-4 flex items-center gap-1"><MapPin size={12}/> {p.area}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                           <div className="flex gap-3">
                              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter"><Bed size={14}/> {p.bedrooms || 1} Bed</span>
                              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter"><Star size={14} className="text-amber-400 fill-current"/> 4.8</span>
                           </div>
                           <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] p-16 border-2 border-dashed border-slate-100 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Building2 size={32} />
                  </div>
                  <p className="text-slate-400 font-bold tracking-tight">No units currently available in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;