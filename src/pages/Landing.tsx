import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Star, MapPin, Wallet, Home, Users, 
  Search, Bell, MapPinned, PanelLeftClose, PanelLeft, LayoutDashboard,
  Wifi, Tv, ShieldCheck, Utensils, CheckCircle2, Info, Sparkles, TrendingUp
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import CubeLoader from "@/components/CubeLoader";

const Landing = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Widget States
  const [budgetVal, setBudgetVal] = useState(15000);
  const [furnishingType, setFurnishingType] = useState<'fully' | 'minimal'>('fully');
  const [splitPeople, setSplitPeople] = useState(3);
  const [totalRentInput, setTotalRentInput] = useState(18000);

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle();
          setUserRole(data?.role || "tenant");
        }
        const { data: props } = await supabase.from("properties").select("*");
        setProperties(props || []);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const optimizedResults = useMemo(() => {
    let filtered = properties.filter(p => p.rent <= budgetVal);
    return filtered.length > 0 ? filtered : properties.sort((a, b) => a.rent - b.rent).slice(0, 4);
  }, [properties, budgetVal]);

  if (loading) return <div className="h-screen flex items-center justify-center"><CubeLoader /></div>;

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
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <MapPin className="text-white w-5 h-5" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase text-slate-800">Rentifyx</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-indigo-600">
                <PanelLeftClose size={20} />
              </button>
            </div>

            <nav className="space-y-3 flex-1">
              <button onClick={() => navigate("/")} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-indigo-50 text-indigo-600 font-black text-sm">
                <LayoutDashboard size={20} /> <span>Main Hub</span>
              </button>
              
              {/* FIXED NAVIGATION TO TENANT DASHBOARD */}
              <button 
                onClick={() => navigate(userRole === 'landlord' ? "/landlord-dashboard" : "/tenant-dashboard")} 
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-800 font-bold text-sm transition-all"
              >
                {userRole === 'landlord' ? <ShieldCheck size={20} /> : <Users size={20} />} 
                <span>{userRole === 'landlord' ? 'Landlord Hub' : 'Tenant Hub'}</span>
              </button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* TOP NAVBAR - Fixed Z-Index */}
        <header className="h-20 border-b border-slate-100 bg-white/90 backdrop-blur-md px-10 flex items-center justify-between z-[50]">
          <div className="flex items-center gap-6">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-3 bg-white border border-slate-200 rounded-xl">
                <PanelLeft size={20} />
              </button>
            )}
            <div className="relative w-64 md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Quick search..." className="w-full bg-slate-50 rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg">VS</div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* VIDEO HERO SECTION */}
          <div className="relative h-[55vh] w-full bg-black flex items-center justify-center overflow-hidden">
            <video 
              autoPlay loop muted playsInline 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-complex-buildings-under-a-blue-sky-40011-large.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FB] via-transparent to-black/40" />
            
            <div className="relative z-20 text-center px-4 -mt-12">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Premium Rental Experience</span>
               </div>
               <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-10 uppercase drop-shadow-2xl">
                 Find Rent <span className="text-indigo-400 italic">Relax.</span>
               </h1>
               <div className="flex flex-wrap items-center justify-center gap-4 relative z-30">
                  <button 
                    onClick={() => navigate("/properties")} 
                    className="flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl"
                  >
                    Browse Listings <ArrowRight size={18} />
                  </button>
                  <button className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    View Map
                  </button>
               </div>
            </div>
          </div>

          {/* INTERACTIVE WIDGETS - Added mt- to overlap video slightly but cleanly */}
          <div className="px-10 -mt-16 relative z-30 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              
              {/* BUDGET ANALYZER */}
              <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center group hover:translate-y-[-5px] transition-all">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5"><Wallet className="text-indigo-600 w-6 h-6" /></div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Budget PGs</h3>
                <p className="font-black text-slate-800 text-sm mb-4">₹5,000 - ₹{budgetVal.toLocaleString()}</p>
                <input 
                  type="range" min="5000" max="35000" step="500" 
                  value={budgetVal} 
                  onChange={(e) => setBudgetVal(parseInt(e.target.value))} 
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                />
              </div>

              {/* FURNISHED TOGGLE */}
              <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5"><Home className="text-indigo-600 w-6 h-6" /></div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Furnishing</h3>
                <div className="flex gap-2 w-full">
                  <button 
                    onClick={() => setFurnishingType('fully')}
                    className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase transition-all ${furnishingType === 'fully' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}
                  >
                    Fully
                  </button>
                  <button 
                    onClick={() => setFurnishingType('minimal')}
                    className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase transition-all ${furnishingType === 'minimal' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}
                  >
                    Minimal
                  </button>
                </div>
              </div>

              {/* SHARED CALCULATOR */}
              <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5"><Users className="text-indigo-600 w-6 h-6" /></div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Split Rent</h3>
                <div className="bg-slate-50 w-full p-4 rounded-3xl text-center border border-slate-100 mb-4">
                  <p className="text-lg font-black text-indigo-600">₹{Math.round(totalRentInput/splitPeople).toLocaleString()}<span className="text-[10px] text-slate-400">/ea</span></p>
                </div>
                <div className="flex items-center gap-3">
                   <button onClick={() => setSplitPeople(Math.max(1, splitPeople-1))} className="w-8 h-8 rounded-lg bg-slate-100 font-black">-</button>
                   <span className="text-xs font-black">{splitPeople}</span>
                   <button onClick={() => setSplitPeople(splitPeople+1)} className="w-8 h-8 rounded-lg bg-slate-100 font-black">+</button>
                </div>
              </div>

              {/* NEAR ME GPS */}
              <div onClick={() => navigate("/properties?sort=location")} className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center cursor-pointer group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <MapPinned className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Live Radar</h3>
                <div className="flex gap-2 text-slate-200 group-hover:text-indigo-600 transition-colors">
                   <Wifi size={18}/> <Tv size={18}/> <Utensils size={18}/>
                </div>
              </div>
            </div>

            {/* FEATURED LISTINGS */}
            <div className="flex flex-col lg:flex-row gap-12">
               <div className="flex-1">
                  <h2 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic mb-8">Featured Units</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {optimizedResults.map((p) => (
                        <motion.div key={p.id} whileHover={{ y: -5 }} className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate(`/property/${p.id}`)}>
                           <div className="h-56 relative overflow-hidden">
                              <img src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.title} />
                              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl font-black text-xs text-indigo-600 shadow-xl">
                                ₹{p.rent?.toLocaleString()}
                              </div>
                           </div>
                           <div className="p-7">
                              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate">{p.title}</h3>
                              <p className="text-slate-400 text-[10px] font-bold uppercase mt-2">{p.area}</p>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </div>
               
               <div className="lg:w-[380px] shrink-0">
                  <div className="sticky top-28 bg-slate-900 rounded-[3rem] p-8 text-white h-[500px] flex flex-col justify-end overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" />
                     <div className="relative z-10">
                        <p className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-2">Live Insights</p>
                        <h4 className="text-2xl font-black uppercase leading-tight mb-4">Graphic Era Campus Region</h4>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">42 Verified listings found. 98% security rating with high-speed fiber connectivity.</p>
                        <button onClick={() => navigate("/properties")} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest">Explore Map</button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;