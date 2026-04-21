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
          // Priority fix for your specific admin/landlord account
          if (session.user.email === 'mvstudiosj@gmail.com') {
            setUserRole('landlord');
          } else {
            const { data } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .maybeSingle();
            setUserRole(data?.role || "tenant");
          }
        }
        const { data: props } = await supabase.from("properties").select("*");
        setProperties(props || []);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  // Budget Analyzer Logic
  const handleBudgetSearch = () => {
    // Navigates to properties page with the budget filter applied
    navigate(`/properties?maxPrice=${budgetVal}`);
  };

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
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <MapPin className="text-white w-5 h-5" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase text-slate-800">Rentifyx</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-indigo-600">
                <PanelLeftClose size={20} />
              </button>
            </div>

            <nav className="space-y-3 flex-1">
              <button onClick={() => navigate("/")} className="w-full flex items-center gap-4 px-5 py-4 rounded-xl bg-indigo-50 text-indigo-600 font-black text-sm">
                <LayoutDashboard size={20} /> <span>Main Hub</span>
              </button>
              
              <button 
                onClick={() => navigate(userRole === 'landlord' ? "/landlord-dashboard" : "/tenant-dashboard")} 
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-800 font-bold text-sm transition-all"
              >
                {userRole === 'landlord' ? <ShieldCheck size={20} /> : <Users size={20} />} 
                <span>{userRole === 'landlord' ? 'Landlord Hub' : 'Tenant Hub'}</span>
              </button>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="h-20 border-b border-slate-100 bg-white/90 backdrop-blur-md px-10 flex items-center justify-between z-[50]">
          <div className="flex items-center gap-6">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-3 bg-white border border-slate-200 rounded-xl">
                <PanelLeft size={20} />
              </button>
            )}
            <div className="relative w-64 md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Quick search..." className="w-full bg-slate-50 rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none" />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg">VS</div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* HERO SECTION */}
          <div className="relative h-[65vh] w-full flex items-center justify-center overflow-hidden">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#F8F9FB]" />

            <div className="relative z-20 text-center px-4">
              <p className="text-[11px] tracking-[0.25em] text-white/70 mb-4 uppercase font-bold">PREMIUM RENTAL EXPERIENCE</p>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1]">
                FIND RENT <br />
                <span className="text-indigo-400 italic">RELAX.</span>
              </h1>

              <div className="flex flex-wrap justify-center gap-6 mt-10">
                <button 
                  onClick={() => navigate("/properties")}
                  className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition shadow-lg"
                >
                  Browse Properties <ArrowRight size={16} />
                </button>

                <button 
                  onClick={() => navigate(userRole === 'landlord' ? "/landlord-dashboard" : "/tenant-dashboard")}
                  className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-sm backdrop-blur-md hover:bg-white hover:text-black transition"
                >
                  {userRole === 'landlord' ? 'Landlord Hub' : 'Tenant Hub'}
                </button>
              </div>
            </div>
          </div>

          {/* WIDGETS SECTION */}
          <div className="px-10 -mt-16 relative z-30 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              
              {/* 1. BUDGET ANALYZER WIDGET */}
              <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center group hover:translate-y-[-5px] transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                  <Wallet className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Budget Analyzer</h3>
                <p className="font-black text-slate-800 text-sm mb-4">Max: ₹{budgetVal.toLocaleString()}</p>
                <input 
                  type="range" min="3000" max="50000" step="500" 
                  value={budgetVal} 
                  onChange={(e) => setBudgetVal(parseInt(e.target.value))} 
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-4" 
                />
                <button 
                  onClick={handleBudgetSearch}
                  className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  View Results
                </button>
              </div>

              {/* 2. FURNISHING TOGGLE */}
              <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                  <Home className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Furnishing</h3>
                <div className="flex gap-2 w-full mt-1">
                  <button onClick={() => setFurnishingType('fully')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${furnishingType === 'fully' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>Fully</button>
                  <button onClick={() => setFurnishingType('minimal')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase transition-all ${furnishingType === 'minimal' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>Minimal</button>
                </div>
              </div>

              {/* 3. SPLIT RENT CALCULATOR */}
              <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5">
                  <Users className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Split Rent</h3>
                <p className="font-black text-indigo-600 text-sm mb-4">₹{Math.round(totalRentInput/splitPeople).toLocaleString()}<span className="text-[10px] text-slate-400">/ea</span></p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSplitPeople(Math.max(1, splitPeople-1))} className="w-8 h-8 rounded-lg bg-slate-100 font-black text-slate-600">-</button>
                  <span className="text-xs font-black">{splitPeople}</span>
                  <button onClick={() => setSplitPeople(splitPeople+1)} className="w-8 h-8 rounded-lg bg-slate-100 font-black text-slate-600">+</button>
                </div>
              </div>

              {/* 4. LIVE RADAR STATUS */}
              <div onClick={() => navigate("/properties?sort=location")} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <MapPinned className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Live Radar</h3>
                <div className="flex gap-3 text-slate-200 group-hover:text-indigo-600 transition-colors">
                  <Wifi size={18}/><Tv size={18}/><Utensils size={18}/>
                </div>
              </div>
            </div>

            {/* FEATURED SECTION */}
            <div className="flex flex-col lg:flex-row gap-12">
               <div className="flex-1">
                  <h2 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic mb-8">Featured Units</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {optimizedResults.map((p) => (
                        <motion.div key={p.id} whileHover={{ y: -5 }} className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate(`/property/${p.id}`)}>
                           <div className="h-56 relative overflow-hidden">
                              <img src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.title} />
                              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl font-black text-xs text-indigo-600 shadow-xl">₹{p.rent?.toLocaleString()}</div>
                           </div>
                           <div className="p-7">
                              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate">{p.title}</h3>
                              <p className="text-slate-400 text-[10px] font-bold uppercase mt-2">{p.area}</p>
                           </div>
                        </motion.div>
                     ))}
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