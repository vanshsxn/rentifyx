import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Star, MapPin, Wallet, Home, Users, 
  Search, Bell, Bed, MapPinned, PanelLeftClose, PanelLeft, LayoutDashboard
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

  // Functional Filter States
  const [budgetVal, setBudgetVal] = useState(15000);

  useEffect(() => {
    checkUserRole();
    getFeatured();
  }, []);

  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (data) {
        setUserRole(data.role);
      } else {
        setUserRole("tenant"); // Default role
      }
    }
  };

  const getFeatured = async () => {
    setLoading(true);
    const { data } = await supabase.from("properties").select("*").limit(6);
    setList(data || []);
    setLoading(false);
  };

  const handleBudgetFilter = () => {
    navigate(`/properties?maxBudget=${budgetVal}`);
  };

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-slate-900 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden lg:flex flex-col border-r border-slate-200 bg-white p-6 z-50 shrink-0"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                  <MapPin className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-black tracking-tighter">Rentifyx</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-indigo-600">
                <PanelLeftClose size={18} />
              </button>
            </div>
            <nav className="space-y-1">
              <button onClick={() => navigate("/")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-bold">
                <LayoutDashboard size={18} /> <span className="text-sm">Dashboard</span>
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
              <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white border border-slate-200 rounded-lg">
                <PanelLeft size={18} />
              </button>
            )}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input type="text" placeholder="Quick Search..." className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 text-xs outline-none" />
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">VS</div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* HERO SECTION - Automated Role Text */}
          <div className="relative h-[50vh] w-full overflow-hidden">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-50">
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-[#F8F9FB]" />
            
            <div className="relative z-10 h-full flex flex-col items-center justify-center pt-8 pb-12">
               <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-center leading-[0.9] text-slate-900 mb-8">
                  {userRole === 'landlord' ? 'MANAGE RENT' : 'FIND RENT'}<br/>
                  <span className="text-indigo-600 italic">RELAX.</span>
               </h1>

               <button 
                onClick={() => navigate(userRole === 'landlord' ? "/landlord-dashboard" : "/properties")} 
                className="flex items-center gap-3 px-8 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:scale-105 transition-transform"
               >
                  {userRole === 'landlord' ? 'Landlord Hub' : 'Browse Listings'} <ArrowRight size={16} />
               </button>
            </div>
          </div>

          <div className="px-8 -mt-12 relative z-20 pb-20">
            {/* WIDGETS - Using rounded-2xl (Squircle style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              
              {/* BUDGET */}
              <div className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col items-center group">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Wallet className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Budget PGs</h3>
                <p className="font-bold text-slate-800 text-sm mb-3">Up to ₹{budgetVal.toLocaleString()}</p>
                <input 
                  type="range" min="5000" max="50000" step="1000"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(parseInt(e.target.value))}
                  onMouseUp={handleBudgetFilter}
                  className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* FURNISHED */}
              <div onClick={() => navigate("/properties?furnished=true")} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col items-center cursor-pointer group">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110">
                  <Home className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Furnished</h3>
                <p className="font-bold text-slate-800 text-sm">Premium Sets</p>
              </div>

              {/* SHARED */}
              <div onClick={() => navigate("/properties?type=shared")} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col items-center cursor-pointer group">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110">
                  <Users className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shared</h3>
                <p className="font-bold text-slate-800 text-sm">Split Cost</p>
              </div>

              {/* NEAR ME */}
              <div onClick={() => navigate("/properties?sort=distance")} className="p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col items-center cursor-pointer group">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110">
                  <MapPinned className="text-indigo-600 w-5 h-5" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Near Me</h3>
                <p className="font-bold text-slate-800 text-sm">Live Location</p>
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
                        <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-xl font-black text-[10px] text-indigo-600">₹{p.rent?.toLocaleString()}</div>
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
    </div>
  );
};

export default Landing;