import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Star, MapPin, Wallet, Home, Users, 
  Search, Bell, Bed, MapPinned, PanelLeftClose, PanelLeft, LayoutDashboard,
  Wifi, Tv, Wind, ShieldCheck
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CubeLoader from "@/components/CubeLoader";

const Landing = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Widget States
  const [budgetVal, setBudgetVal] = useState(15000);
  const [splitPeople, setSplitPeople] = useState(3);

  useEffect(() => {
    checkUserRole();
    getFeatured();
  }, []);

  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();
      setUserRole(data?.role || "tenant");
    }
  };

  const getFeatured = async () => {
    setLoading(true);
    const { data } = await supabase.from("properties").select("*").limit(6);
    setList(data || []);
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-slate-900 overflow-hidden font-sans">
      
      {/* 1. ROLE-BASED SIDEBAR */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex flex-col border-r border-slate-200 bg-white p-6 z-50 shrink-0"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <MapPin className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase">Rentifyx</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-indigo-600">
                <PanelLeftClose size={18} />
              </button>
            </div>

            <nav className="space-y-2 flex-1">
              <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-bold">
                <LayoutDashboard size={18} /> <span className="text-sm">Main Hub</span>
              </button>
              
              {/* Dynamic Role Navigation */}
              {userRole === 'landlord' ? (
                <button onClick={() => navigate("/landlord-dashboard")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-bold border border-transparent hover:border-slate-100">
                  <ShieldCheck size={18} /> <span className="text-sm">Landlord Panel</span>
                </button>
              ) : (
                <button onClick={() => navigate("/tenant-dashboard")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-bold border border-transparent hover:border-slate-100">
                  <Users size={18} /> <span className="text-sm">Tenant Hub</span>
                </button>
              )}
              
              <button onClick={() => navigate("/properties")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 font-bold">
                <Search size={18} /> <span className="text-sm">Search PG</span>
              </button>
            </nav>

            {/* Profile Info in Sidebar */}
            <div className="pt-6 border-t border-slate-100">
               <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">{userRole?.[0].toUpperCase() || 'U'}</div>
                  <div>
                    <p className="text-xs font-black uppercase text-slate-800">{userRole || 'User'}</p>
                    <p className="text-[10px] text-slate-400 font-bold">Active Session</p>
                  </div>
               </div>
            </div>
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
              <input type="text" placeholder="Quick Search PG..." className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 text-xs outline-none" />
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-black uppercase">
               <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"/> Emergency Stay
             </div>
             <Bell size={18} className="text-slate-400"/>
             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">VS</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* HERO SECTION */}
          <div className="relative h-[45vh] w-full overflow-hidden bg-slate-900">
            <img src="/hero-blueprint.jpg" className="absolute inset-0 w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-[#F8F9FB]" />
            
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
               <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] text-slate-900 mb-8 uppercase">
                  Find Rent<br/>
                  <span className="text-indigo-600 italic">Relax.</span>
               </h1>

               <div className="flex gap-4">
                  <button onClick={() => navigate("/properties")} className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:scale-105 transition-transform">
                     Browse Listings <ArrowRight size={16} />
                  </button>
                  {userRole === 'landlord' && (
                    <button onClick={() => navigate("/landlord-hub")} className="px-8 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm">
                       Landlord Hub
                    </button>
                  )}
               </div>
            </div>
          </div>

          <div className="px-8 -mt-16 relative z-20 pb-20">
            {/* INTERACTIVE WIDGETS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              
              {/* 2. BUDGET PG (Functional Slider) */}
              <div className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col items-center group">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Wallet className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Budget PGs</h3>
                <p className="font-bold text-slate-800 text-sm mb-3">Up to ₹{budgetVal.toLocaleString()}</p>
                <input 
                  type="range" min="5000" max="30000" step="1000"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(parseInt(e.target.value))}
                  onMouseUp={() => navigate(`/properties?maxBudget=${budgetVal}`)}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* 3. FURNISHED (Split Options) */}
              <div className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col items-center">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                  <Home className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Furnished</h3>
                <div className="flex flex-col gap-2 w-full">
                  <button onClick={() => navigate("/properties?furnished=fully")} className="text-[9px] font-black uppercase py-2 bg-slate-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">Fully Furnished</button>
                  <button onClick={() => navigate("/properties?furnished=minimal")} className="text-[9px] font-black uppercase py-2 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all">Minimal Setup</button>
                </div>
              </div>

              {/* 4. SHARED (Split Cost Logic) */}
              <div className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col items-center">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                  <Users className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shared</h3>
                <p className="text-[10px] font-bold text-slate-800 mt-1">Split ({splitPeople} people)</p>
                <div className="flex items-center gap-3 mt-3">
                   <button onClick={() => setSplitPeople(Math.max(2, splitPeople-1))} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-bold">-</button>
                   <button onClick={() => navigate(`/properties?type=shared&split=${splitPeople}`)} className="text-[9px] font-black bg-indigo-600 text-white px-4 py-1 rounded-lg">SORT</button>
                   <button onClick={() => setSplitPeople(splitPeople+1)} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center font-bold">+</button>
                </div>
              </div>

              {/* 5. NEAR ME (Icon set) */}
              <div onClick={() => navigate("/properties?sort=distance")} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col items-center cursor-pointer group">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MapPinned className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Near Me</h3>
                <div className="flex gap-3 mt-4 text-slate-300">
                   <Wifi size={14}/> <Tv size={14}/> <Users size={14}/> <Wind size={14}/>
                </div>
              </div>
            </div>

            {/* 7. FEATURED UNITS + MINI MAP */}
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex items-end justify-between">
                   <h2 className="text-3xl font-black tracking-tighter text-slate-800 uppercase italic">Featured Units</h2>
                   <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">High Performance Living</p>
                </div>
                
                {loading ? <div className="h-40 flex items-center justify-center"><CubeLoader /></div> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {list.map((p) => (
                      <motion.div 
                        key={p.id} 
                        whileHover={{ y: -5 }}
                        className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden group shadow-sm hover:shadow-xl transition-all cursor-pointer" 
                        onClick={() => navigate(`/property/${p.id}`)}
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-xl font-black text-[10px] text-indigo-600">₹{p.rent?.toLocaleString()}</div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{p.title}</h3>
                          <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase">{p.area}</p>
                          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-50">
                            <div className="flex gap-2 text-slate-400 text-[9px] font-black uppercase"><Wifi size={12}/> <Tv size={12}/> <Users size={12}/></div>
                            <div className="text-indigo-600 font-black flex items-center gap-1 text-[9px] uppercase tracking-widest">View Details <ArrowRight size={12}/></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* MINI MAP COMPONENT */}
              <div className="lg:w-[350px] space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Neighborhood</h3>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                 </div>
                 <div className="h-[500px] bg-slate-200 rounded-[2.5rem] border border-white shadow-xl relative overflow-hidden">
                    <img src="/sample-map.jpg" className="w-full h-full object-cover" />
                    {/* Mock map markers */}
                    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-indigo-100 scale-90">
                       <div className="w-3 h-3 rounded-full bg-indigo-600" />
                       <p className="text-[10px] font-black uppercase">Your PG</p>
                    </div>
                    <div className="absolute bottom-10 left-6 right-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white">
                       <p className="text-[10px] font-black uppercase text-indigo-600 mb-1">Live Updates</p>
                       <p className="text-[9px] font-bold text-slate-500">3 Verified properties found within 2km of your search.</p>
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