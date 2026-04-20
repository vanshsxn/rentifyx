import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Star, MapPin, Wallet, Home, Users, 
  Search, Bell, Bed, MapPinned, PanelLeftClose, PanelLeft, LayoutDashboard,
  Wifi, Tv, Wind, ShieldCheck, IndianRupee, Filter, TrendingUp, Laptop, Utensils,
  CheckCircle2, Info, Sparkles
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
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([checkUserRole(), fetchProperties()]);
      setLoading(false);
    };
    initializeData();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle();
        setUserRole(data?.role || "tenant");
      }
    } catch (e) {
      console.error("Auth error:", e);
    }
  };

  const fetchProperties = async () => {
    try {
      const { data } = await supabase.from("properties").select("*");
      setProperties(data || []);
    } catch (e) {
      console.error("Fetch error:", e);
    }
  };

  // SMART OPTIMIZER LOGIC (Knapsack/Efficiency Mode)
  const optimizedResults = useMemo(() => {
    if (!properties || properties.length === 0) return [];

    // 1. Filter by budget first
    let filtered = properties.filter(p => p.rent <= budgetVal);
    
    // 2. If no matches under budget, fallback to lowest price overall
    if (filtered.length === 0) {
      return [...properties].sort((a, b) => a.rent - b.rent).slice(0, 6);
    }

    // 3. Efficiency Logic: For each price point, pick the one with most amenities
    const bestValueByPrice: Record<number, any> = {};
    filtered.forEach(p => {
      const pFeatures = Array.isArray(p.features) ? p.features : [];
      const amenityCount = pFeatures.length;
      
      if (!bestValueByPrice[p.rent] || amenityCount > (bestValueByPrice[p.rent].features?.length || 0)) {
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
                placeholder="Search area..." 
                className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500/20 transition-all" 
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg">VS</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* Hero */}
          <div className="relative h-[40vh] w-full bg-[#111] flex items-center justify-center overflow-hidden">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity" alt="Hero" />
            <div className="relative z-10 text-center px-4">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span className="text-[10px] font-black uppercase text-white/80 tracking-widest">Premium Housing</span>
               </div>
               <h1 className="text-6xl md:text-7xl font-black text-white uppercase leading-none mb-8">Find Rent <span className="text-indigo-500 italic">Relax.</span></h1>
               <button onClick={() => navigate("/properties")} className="px-10 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest">Browse Listings</button>
            </div>
          </div>

          <div className="px-10 -mt-20 relative z-20 pb-24">
            {/* Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl flex flex-col items-center">
                <Wallet className="text-indigo-600 mb-4" />
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Budget</p>
                <p className="font-black text-slate-800 mb-4">₹{budgetVal.toLocaleString()}</p>
                <input type="range" min="5000" max="35000" step="500" value={budgetVal} onChange={(e) => setBudgetVal(parseInt(e.target.value))} className="w-full accent-indigo-600" />
              </div>

              <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl flex flex-col items-center">
                <Home className="text-indigo-600 mb-4" />
                <button onClick={() => setFurnishingType('fully')} className={`w-full py-3 rounded-xl text-[10px] font-black uppercase mb-2 ${furnishingType === 'fully' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>Fully Furnished</button>
                <button onClick={() => setFurnishingType('minimal')} className={`w-full py-3 rounded-xl text-[10px] font-black uppercase ${furnishingType === 'minimal' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>Minimal Setup</button>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl flex flex-col items-center">
                <Users className="text-indigo-600 mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Split Cost</p>
                <p className="text-lg font-black text-indigo-600 mb-4">₹{Math.round(totalRentInput/splitPeople).toLocaleString()}</p>
                <div className="flex gap-4">
                   <button onClick={() => setSplitPeople(Math.max(1, splitPeople-1))} className="w-10 h-10 bg-slate-50 rounded-lg">-</button>
                   <span className="font-black pt-2">{splitPeople}</span>
                   <button onClick={() => setSplitPeople(splitPeople+1)} className="w-10 h-10 bg-slate-50 rounded-lg">+</button>
                </div>
              </div>

              <div onClick={() => navigate("/properties")} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl flex flex-col items-center cursor-pointer group hover:bg-indigo-600 transition-all">
                <MapPinned className="text-indigo-600 group-hover:text-white mb-4" />
                <p className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white/60">Near Me</p>
                <div className="flex gap-2 mt-4 text-slate-200 group-hover:text-white/30">
                  <Wifi size={18}/> <Tv size={18}/> <Utensils size={18}/>
                </div>
              </div>
            </div>

            {/* Featured Section */}
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1">
                <h2 className="text-4xl font-black text-slate-800 uppercase italic mb-8">Featured Units</h2>
                {loading ? <div className="h-40 flex items-center justify-center"><CubeLoader /></div> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {optimizedResults.slice(0, 4).map((p) => (
                      <div key={p.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm group cursor-pointer" onClick={() => navigate(`/property/${p.id}`)}>
                        <div className="h-52 relative overflow-hidden">
                          <img src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-xl font-black text-xs text-indigo-600">₹{p.rent}</div>
                        </div>
                        <div className="p-6">
                           <h3 className="font-black uppercase text-slate-800 mb-4 truncate">{p.title}</h3>
                           <div className="flex gap-4 text-slate-300 pt-4 border-t">
                              <Wifi size={16}/> <Tv size={16}/> <Utensils size={16}/>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Map Placeholder */}
              <div className="lg:w-[380px] h-[600px] bg-slate-100 rounded-[3rem] border-8 border-white shadow-2xl relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80" className="w-full h-full object-cover grayscale opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase">Live in Bareilly</span>
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