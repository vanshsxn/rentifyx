import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Star, MapPin, Wallet, Home, Users, X, Zap, 
  IndianRupee, LayoutDashboard, LogIn, AlertTriangle, Phone, 
  Search, Bell, Menu, Building2, Bed, Wifi, Wind, Tv, 
  ChevronRight, MapPinned, Navigation 
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CubeLoader from "@/components/CubeLoader";

const Landing = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Widget States
  const [budgetVal, setBudgetVal] = useState(15000);
  const [furnishingType, setFurnishingType] = useState<"fully" | "minimal">("fully");
  const [totalRentInput, setTotalRentInput] = useState(18000);
  const [peopleCount, setPeopleCount] = useState(3);
  const [showBudgetWidget, setShowBudgetWidget] = useState(true);

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
    const { data, error } = await supabase.from("properties").select("*").eq("is_featured", true).limit(6);
    if (error) console.error("Error fetching properties:", error);
    setList(data || []);
    setLoading(false);
  };

  const handleBudgetComplete = () => {
    navigate(`/properties?maxBudget=${budgetVal}`);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-slate-900 overflow-hidden font-sans">
      
      {/* 1. SIDEBAR (Light Glass) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white/80 backdrop-blur-3xl p-6 z-50 shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <MapPin className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-800">Rentifyx</span>
        </div>
        <nav className="space-y-2 flex-1">
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all font-semibold">
            <Search size={20} /> Search PG
          </button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* HEADER */}
        <header className="h-20 border-b border-slate-200 bg-white/50 backdrop-blur-xl px-8 flex items-center justify-between z-40">
          <div className="flex-1 max-w-md">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="Quick Search PG..." className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-2.5 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
             </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors">
               <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Emergency Stay
            </button>
            <Bell className="text-slate-400 cursor-pointer hover:text-indigo-600 transition-colors" size={20} />
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center border-4 border-white shadow-md font-bold text-white uppercase">VS</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          {/* HERO */}
          <div className="relative h-[45vh] w-full overflow-hidden bg-slate-200">
             {/* Replace src with your actual video path */}
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover grayscale brightness-110 contrast-75 opacity-40">
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-[#F8F9FB]" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center">
               <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-center leading-[0.85] text-slate-900">
                  FIND RENT<br/>
                  <span className="text-indigo-600 italic">RELAX.</span>
               </h1>
            </div>
          </div>

          <div className="px-8 -mt-16 relative z-20 pb-20">
            {/* INTERACTIVE WIDGETS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              
              {/* BUDGET WIDGET */}
              <AnimatePresence>
              {showBudgetWidget && (
                <motion.div exit={{ opacity: 0, scale: 0.95 }} className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 relative group">
                  <button onClick={() => setShowBudgetWidget(false)} className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 transition-all">
                    <X size={14} />
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                    <Wallet className="text-indigo-600 w-5 h-5" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Budget PGs</h3>
                  <p className="font-bold text-slate-800 text-sm mb-4">₹ 5,000 - ₹ {budgetVal.toLocaleString()}</p>
                  <input 
                    type="range" min="5000" max="50000" step="500"
                    value={budgetVal}
                    onChange={(e) => setBudgetVal(parseInt(e.target.value))}
                    onMouseUp={handleBudgetComplete}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-2"
                  />
                  <p className="text-[8px] text-slate-400 uppercase tracking-tighter font-bold">Smart Optimizer</p>
                </motion.div>
              )}
              </AnimatePresence>

              {/* FURNISHED WIDGET */}
              <div className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3 mx-auto">
                  <Home className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 mb-4">Furnished</h3>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setFurnishingType("fully")} className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all ${furnishingType === "fully" ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                    <span className="flex items-center gap-2">Fully Furnished</span>
                    <Zap size={12} />
                  </button>
                  <button onClick={() => setFurnishingType("minimal")} className={`flex items-center px-4 py-2.5 rounded-xl text-[10px] font-bold transition-all ${furnishingType === "minimal" ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                    Minimal Setup
                  </button>
                </div>
              </div>

              {/* SHARED WIDGET */}
              <div className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 text-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-2 mx-auto">
                  <Users className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Shared</h3>
                <p className="text-[9px] text-slate-400 mb-3 uppercase tracking-tighter">Budget: ₹ {totalRentInput.toLocaleString()}</p>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <p className="text-[10px] text-slate-500 mb-1">Total Rent: <span className="text-slate-800 font-bold">₹{totalRentInput}</span></p>
                  <div className="w-full h-[1px] bg-slate-200 my-2" />
                  <p className="text-lg font-black text-indigo-600 leading-tight">₹{Math.round(totalRentInput / peopleCount)}</p>
                  <p className="text-[8px] text-slate-400 uppercase font-bold tracking-widest">Split ({peopleCount} people)</p>
                </div>
              </div>

              {/* NEAR ME WIDGET */}
              <div className="p-6 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                  <MapPinned className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Near Me</h3>
                <div className="flex gap-2 mb-5">
                  <span className="px-3 py-1 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center gap-1 uppercase">
                    <Navigation size={10} className="fill-current" /> Smart Sort
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black rounded-full border border-slate-200 uppercase">Closest</span>
                </div>
                <div className="flex justify-center gap-5 text-slate-300 mt-auto">
                  <Wifi size={18} className="hover:text-indigo-600 transition-colors" />
                  <Tv size={18} className="hover:text-indigo-600 transition-colors" />
                  <Users size={18} className="hover:text-indigo-600 transition-colors" />
                  <Wind size={18} className="hover:text-indigo-600 transition-colors" />
                </div>
              </div>
            </div>

            {/* FEATURED UNITS SECTION */}
            <div className="space-y-8">
              <h2 className="text-4xl font-black tracking-tighter text-slate-800">Featured Units</h2>
              {loading ? (
                <div className="h-64 flex items-center justify-center"><CubeLoader /></div>
              ) : list.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {list.map((p) => (
                    <motion.div 
                      key={p.id} 
                      whileHover={{ y: -10 }}
                      className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer"
                      onClick={() => navigate(`/property/${p.id}`)}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-indigo-600 px-4 py-2 rounded-2xl font-black text-xs shadow-lg">₹{p.rent.toLocaleString()}</div>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="text-xl font-bold text-slate-800 leading-tight">{p.title}</h3>
                           <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-50 px-2 py-1 rounded-lg">
                              <Star size={14} className="fill-current" /> 4.8
                           </div>
                        </div>
                        <p className="text-slate-500 text-sm mb-6 flex items-center gap-1">
                          <MapPin size={14} /> {p.area}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase"><Bed size={16} /> {p.bedrooms || 1} Bed</div>
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase"><Building2 size={16} /> Studio</div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                             <ChevronRight size={18} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold tracking-tight">No featured units found.</p>
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