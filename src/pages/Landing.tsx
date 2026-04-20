import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Star, MapPin, Wallet, Home, Users, 
  Search, Bell, Bed, MapPinned, PanelLeftClose, PanelLeft, LayoutDashboard,
  Wifi, Tv, Wind, ShieldCheck, IndianRupee, Filter, TrendingUp, Laptop, Utensils,
  CheckCircle2, Info
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

  // Widget States based on
  const [budgetVal, setBudgetVal] = useState(15000);
  const [furnishingType, setFurnishingType] = useState<'fully' | 'minimal'>('fully');
  const [splitPeople, setSplitPeople] = useState(3);
  const [totalRentInput, setTotalRentInput] = useState(18000);

  useEffect(() => {
    checkUserRole();
    fetchProperties();
  }, []);

  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle();
      setUserRole(data?.role || "tenant");
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    const { data } = await supabase.from("properties").select("*");
    setProperties(data || []);
    setLoading(false);
  };

  // SMART OPTIMIZER LOGIC (Knapsack/Efficiency Mode)
  const optimizedResults = useMemo(() => {
    // 1. Filter by budget first
    let filtered = properties.filter(p => p.rent <= budgetVal);
    
    // 2. If no matches under budget, fallback to lowest price overall
    if (filtered.length === 0) {
      return properties.sort((a, b) => a.rent - b.rent).slice(0, 6);
    }

    // 3. Efficiency Logic: For each price point, pick the one with most amenities
    const bestValueByPrice: Record<number, any> = {};
    filtered.forEach(p => {
      const amenityCount = (p.features || []).length;
      if (!bestValueByPrice[p.rent] || amenityCount > (bestValueByPrice[p.rent].features || []).length) {
        bestValueByPrice[p.rent] = p;
      }
    });

    // 4. Sort by highest amenities first, then lowest price
    return Object.values(bestValueByPrice).sort((a: any, b: any) => {
      const bTags = (b.features || []).length;
      const aTags = (a.features || []).length;
      if (bTags !== aTags) return bTags - aTags;
      return a.rent - b.rent;
    });
  }, [properties, budgetVal]);

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-slate-900 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }} 
            animate={{ width: 280, opacity: 1 }} 
            exit={{ width: 0, opacity: 0 }} 
            className="hidden lg:flex flex-col border-r border-slate-200 bg-white p-6 shrink-0 relative z-50"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <MapPin className="text-white w-5 h-5" />
                </div>
                <span className="text-2xl font-black tracking-tighter uppercase text-slate-800">Rentifyx</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                <PanelLeftClose size={20} />
              </button>
            </div>

            <nav className="space-y-3 flex-1">
              <button onClick={() => navigate("/")} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-indigo-50 text-indigo-600 font-black text-sm transition-all">
                <LayoutDashboard size={20} /> <span>Main Hub</span>
              </button>
              
              <button 
                onClick={() => navigate(userRole === 'landlord' ? "/landlord-dashboard" : "/tenant-dashboard")} 
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-800 font-bold text-sm transition-all"
              >
                {userRole === 'landlord' ? <ShieldCheck size={20} /> : <Users size={20} />} 
                <span>{userRole === 'landlord' ? 'Landlord Hub' : 'Tenant Hub'}</span>
              </button>

              <button onClick={() => navigate("/properties")} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-400 hover:bg-slate-50 hover:text-slate-800 font-bold text-sm transition-all">
                <Search size={20} /> <span>Search PG</span>
              </button>
            </nav>

            {/* USER PROFILE CARD */}
            <div className="pt-6 border-t border-slate-100">
               <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-inner">
                    {userRole?.[0].toUpperCase() || 'T'}
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-slate-800 tracking-wider">{userRole || 'Tenant'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Active Session</p>
                  </div>
               </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="h-20 border-b border-slate-100 bg-white/80 backdrop-blur-xl px-10 flex items-center justify-between z-40">
          <div className="flex items-center gap-6 flex-1">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 shadow-sm hover:border-indigo-600 transition-all">
                <PanelLeft size={20} />
              </button>
            )}
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by area or PG name..." 
                className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500/20 transition-all" 
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="hidden md:flex px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase items-center gap-2 shadow-sm">
               <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"/> Emergency Stay
             </div>
             <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                <Bell size={22} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
             </button>
             <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-100">VS</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* HERO SECTION */}
          <div className="relative h-[45vh] w-full bg-[#111] flex items-center justify-center overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80" 
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity" 
              alt="Background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-[#F8F9FB]" />
            
            <div className="relative z-10 text-center px-4">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Premium Rental Experience</span>
               </div>
               <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] text-white mb-10 uppercase drop-shadow-2xl">
                  Find Rent<br/>
                  <span className="text-indigo-500 italic">Relax.</span>
               </h1>
               <div className="flex items-center justify-center gap-4">
                  <button onClick={() => navigate("/properties")} className="flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/40">
                     Browse Listings <ArrowRight size={18} />
                  </button>
                  <button className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                     View Map
                  </button>
               </div>
            </div>
          </div>

          <div className="px-10 -mt-20 relative z-20 pb-24">
            
            {/* INTERACTIVE WIDGETS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              
              {/* BUDGET ANALYZER */}
              <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5"><Wallet className="text-indigo-600 w-6 h-6" /></div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Budget PGs</h3>
                <p className="font-black text-slate-800 text-sm mb-4">₹5,000 - ₹{budgetVal.toLocaleString()}</p>
                <input 
                  type="range" min="5000" max="35000" step="500" 
                  value={budgetVal} 
                  onChange={(e) => setBudgetVal(parseInt(e.target.value))} 
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                />
                <div className="flex justify-between w-full mt-2 text-[10px] font-black text-slate-300 uppercase">
                  <span>5k</span><span>35k</span>
                </div>
              </div>

              {/* FURNISHED TOGGLE */}
              <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5"><Home className="text-indigo-600 w-6 h-6" /></div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Furnished</h3>
                <div className="space-y-2 w-full">
                  <button 
                    onClick={() => setFurnishingType('fully')}
                    className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${furnishingType === 'fully' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {furnishingType === 'fully' && <CheckCircle2 size={14}/>} Fully Furnished
                  </button>
                  <button 
                    onClick={() => setFurnishingType('minimal')}
                    className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${furnishingType === 'minimal' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
                  >
                    {furnishingType === 'minimal' && <CheckCircle2 size={14}/>} Minimal Setup
                  </button>
                </div>
              </div>

              {/* SHARED CALCULATOR */}
              <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5"><Users className="text-indigo-600 w-6 h-6" /></div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Shared</h3>
                <div className="bg-slate-50 w-full p-4 rounded-3xl text-center border border-slate-100 mb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Split ({splitPeople} people)</p>
                  <p className="text-lg font-black text-indigo-600">₹{Math.round(totalRentInput/splitPeople).toLocaleString()}<span className="text-[10px] text-slate-400">/ea</span></p>
                </div>
                <div className="flex items-center gap-6">
                   <button onClick={() => setSplitPeople(Math.max(1, splitPeople-1))} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black hover:bg-indigo-100 hover:text-indigo-600 transition-colors">-</button>
                   <button onClick={() => navigate(`/properties?split=${splitPeople}`)} className="px-6 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest">Sort</button>
                   <button onClick={() => setSplitPeople(splitPeople+1)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black hover:bg-indigo-100 hover:text-indigo-600 transition-colors">+</button>
                </div>
              </div>

              {/* NEAR ME GPS */}
              <div 
                onClick={() => navigate("/properties?sort=location")} 
                className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col items-center cursor-pointer group hover:border-indigo-500/30 transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <MapPinned className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">Near Me</h3>
                <div className="flex gap-2 mb-6">
                   <span className="px-3 py-1.5 bg-indigo-600 text-white text-[9px] font-black rounded-lg uppercase flex items-center gap-2"><MapPin size={10}/> Smart Sort</span>
                   <span className="px-3 py-1.5 bg-slate-50 text-slate-400 text-[9px] font-black rounded-lg uppercase">Closest</span>
                </div>
                <div className="flex gap-4 text-slate-200 group-hover:text-indigo-200 transition-colors">
                   <Wifi size={18}/> <Tv size={18}/> <Users size={18}/> <Utensils size={18}/>
                </div>
              </div>
            </div>

            {/* FEATURED + NEIGHBORHOOD SECTION */}
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1 space-y-8">
                <div className="flex items-end justify-between">
                   <div>
                      <h2 className="text-4xl font-black tracking-tighter text-slate-800 uppercase italic leading-none">Featured Units</h2>
                      <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-[0.3em] mt-2">High-Performance Living</p>
                   </div>
                   <button onClick={() => navigate("/properties")} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 flex items-center gap-2 transition-colors">
                     View All <ArrowRight size={14}/>
                   </button>
                </div>
                
                {loading ? <div className="h-60 flex items-center justify-center"><CubeLoader /></div> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {optimizedResults.slice(0, 4).map((p) => (
                      <motion.div 
                        key={p.id} 
                        whileHover={{ y: -8 }} 
                        className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer" 
                        onClick={() => navigate(`/property/${p.id}`)}
                      >
                        <div className="relative h-56 overflow-hidden">
                          <img 
                            src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                            alt={p.title}
                          />
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl font-black text-xs text-indigo-600 shadow-xl border border-white/50">
                            ₹{p.rent?.toLocaleString()}
                          </div>
                          {p.rent <= budgetVal && (
                            <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-1 shadow-lg">
                               <TrendingUp size={12}/> Best Value
                            </div>
                          )}
                        </div>
                        <div className="p-7">
                          <div className="flex justify-between items-start mb-2">
                             <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight truncate leading-tight">{p.title}</h3>
                             <div className="flex items-center gap-1 text-amber-500 font-black text-[10px]"><Star size={14} className="fill-current"/> 4.8</div>
                          </div>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-6 flex items-center gap-2"><MapPin size={12} className="text-indigo-400"/> {p.area}</p>
                          
                          <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                            <div className="flex gap-4 text-slate-300">
                               <Wifi size={16} className="group-hover:text-indigo-400 transition-colors"/> 
                               <Tv size={16} className="group-hover:text-indigo-400 transition-colors"/> 
                               <Utensils size={16} className="group-hover:text-indigo-400 transition-colors"/>
                            </div>
                            <button className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 tracking-widest group-hover:translate-x-1 transition-transform">
                               Detail <ArrowRight size={14}/>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* NEIGHBORHOOD MAP */}
              <div className="lg:w-[420px] shrink-0">
                 <div className="sticky top-28 space-y-6">
                    <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                          <p className="text-[11px] font-black uppercase text-slate-800 tracking-widest">Live Neighborhood</p>
                       </div>
                       <Info size={16} className="text-slate-300 cursor-pointer hover:text-indigo-600 transition-colors" />
                    </div>

                    <div className="h-[650px] bg-slate-100 rounded-[3.5rem] border-8 border-white shadow-2xl relative overflow-hidden group">
                       <img 
                        src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80" 
                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 transition-all duration-1000" 
                        alt="Map Area" 
                       />
                       
                       {/* Mock Map Markers */}
                       <div className="absolute top-1/4 left-1/3 group/pin cursor-pointer">
                          <div className="bg-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 border border-indigo-100 hover:scale-110 transition-transform">
                             <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)] animate-pulse" />
                             <p className="text-[10px] font-black uppercase text-slate-800">Java PG</p>
                          </div>
                       </div>

                       <div className="absolute bottom-8 left-6 right-6">
                          <div className="bg-white/90 backdrop-blur-xl p-7 rounded-[2.5rem] border border-white shadow-2xl">
                             <p className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em] mb-2">Area Insights</p>
                             <h4 className="text-sm font-black text-slate-800 uppercase mb-3">Graphic Era Region</h4>
                             <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
                                42 Verified listings found. This area has a 98% security rating and high-speed fiber connectivity.
                             </p>
                             <div className="flex gap-2 mt-5">
                                <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-xl uppercase">Wifi Zone</span>
                                <span className="px-3 py-1.5 bg-rose-50 text-rose-600 text-[9px] font-black rounded-xl uppercase">Safe Night</span>
                             </div>
                          </div>
                       </div>
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