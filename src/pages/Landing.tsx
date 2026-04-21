import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, MapPin, Wallet, Home, Users, Search, PanelLeftClose, PanelLeft,
  LayoutDashboard, Wifi, Tv, Utensils, ShieldCheck, MessageCircle, Heart,
  Zap, LifeBuoy, Crown, Plus, ListChecks, BarChart3, ChevronLeft, ChevronRight, Navigation,
  LogOut, Sparkles, Sliders, Bed, Bath
} from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CubeLoader from "@/components/CubeLoader";
import ChatDrawer from "@/components/ChatDrawer";
import EmergencyBookingModal from "@/components/EmergencyBookingModal";
import PropertyMap from "@/components/PropertyMap";
import { sortByProximity, getUserLocation } from "@/lib/geo";
import { toast } from "sonner";

const Landing = () => {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Widget States
  const [budgetVal, setBudgetVal] = useState(15000);
  const [furnishingType, setFurnishingType] = useState<'fully' | 'minimal'>('fully');
  const [splitPeople, setSplitPeople] = useState(3);
  const [totalRentInput, setTotalRentInput] = useState(18000);

  // Modals
  const [chatOpen, setChatOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  // Map / Featured
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const featuredScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("properties").select("*").then(({ data }) => {
      setProperties(data || []);
      setLoading(false);
    });
  }, []);

  // Try to get location silently for the featured map
  useEffect(() => {
    getUserLocation().then(setUserLoc).catch(() => {});
  }, []);

  // Budget Optimizer
  const optimizedResults = useMemo(() => {
    const filtered = properties
      .filter(p => p.rent <= budgetVal)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.rent - b.rent);
    return filtered.length > 0 ? filtered.slice(0, 6) : [];
  }, [properties, budgetVal]);

  // Featured (sorted by proximity if available, else featured flag)
  const featured = useMemo(() => {
    if (userLoc) {
      return sortByProximity(properties, userLoc).slice(0, 8);
    }
    return [...properties].sort((a, b) => Number(b.is_featured) - Number(a.is_featured)).slice(0, 8);
  }, [properties, userLoc]);

  const scrollFeatured = (dir: 'left' | 'right') => {
    if (!featuredScrollRef.current) return;
    featuredScrollRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  const requireAuth = (action: () => void) => {
    if (!user) {
      toast.info("Please sign in to continue");
      navigate("/auth");
      return;
    }
    action();
  };

  // Sidebar nav by role
  const tenantNav = [
    { icon: LayoutDashboard, label: "Main Hub", action: () => navigate("/") },
    { icon: BarChart3, label: "Dashboard", action: () => requireAuth(() => navigate("/tenant")) },
    { icon: MessageCircle, label: "Chat", action: () => requireAuth(() => { setSupportOpen(false); setChatOpen(true); }) },
    { icon: Heart, label: "My Favorites", action: () => requireAuth(() => navigate("/tenant")) },
    { icon: Zap, label: "Emergency Booking", action: () => requireAuth(() => setEmergencyOpen(true)), accent: true },
    { icon: Crown, label: "Upgrade to Pro", action: () => toast.info("Pro plan coming soon ✨") },
    { icon: LifeBuoy, label: "Support", action: () => requireAuth(() => { setSupportOpen(true); setChatOpen(true); }) },
  ];

  const landlordNav = [
    { icon: LayoutDashboard, label: "Main Hub", action: () => navigate("/") },
    { icon: ShieldCheck, label: "Landlord Hub", action: () => requireAuth(() => navigate("/landlord")) },
    { icon: ListChecks, label: "My Listings", action: () => requireAuth(() => navigate("/landlord")) },
    { icon: Plus, label: "Post Property", action: () => requireAuth(() => navigate("/landlord")) },
    { icon: MessageCircle, label: "Chat", action: () => requireAuth(() => { setSupportOpen(false); setChatOpen(true); }) },
    { icon: BarChart3, label: "Analytics", action: () => requireAuth(() => navigate("/landlord")) },
    { icon: LifeBuoy, label: "Support", action: () => requireAuth(() => { setSupportOpen(true); setChatOpen(true); }) },
  ];

  const adminNav = [
    { icon: LayoutDashboard, label: "Main Hub", action: () => navigate("/") },
    { icon: ShieldCheck, label: "Admin Console", action: () => navigate("/admin") },
    { icon: MessageCircle, label: "All Chats", action: () => setChatOpen(true) },
  ];

  const navItems = userRole === "admin" ? adminNav : userRole === "landlord" ? landlordNav : tenantNav;

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#F8F9FB]"><CubeLoader /></div>;

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
            <div className="flex items-center justify-between mb-8">
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

            {/* Role Badge */}
            {user && (
              <div className="mb-5 p-3 bg-indigo-50 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-indigo-700 tracking-wider">{userRole}</p>
                  <p className="text-xs font-bold text-slate-700 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <nav className="space-y-1.5 flex-1 overflow-y-auto -mx-2 px-2">
              {navItems.map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                    i === 0
                      ? "bg-indigo-50 text-indigo-600"
                      : (item as any).accent
                      ? "text-red-600 hover:bg-red-50"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {user ? (
              <button
                onClick={handleSignOut}
                className="mt-3 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 font-bold text-sm transition"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="mt-3 w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition"
              >
                Sign In
              </button>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* TOP NAVBAR */}
        <header className="h-16 sm:h-20 border-b border-slate-100 bg-white/90 backdrop-blur-md px-4 sm:px-10 flex items-center justify-between z-[50] shrink-0">
          <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="hidden lg:block p-3 bg-white border border-slate-200 rounded-xl">
                <PanelLeft size={20} />
              </button>
            )}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <MapPin className="text-white w-4 h-4" />
              </div>
              <span className="font-black text-slate-800">RentifyX</span>
            </div>
            <div className="relative hidden sm:block w-64 md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Quick search..."
                className="w-full bg-slate-50 rounded-xl py-3 pl-12 pr-4 text-xs font-bold outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <button
                onClick={() => setChatOpen(true)}
                className="p-2.5 sm:p-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
                aria-label="Chat"
              >
                <MessageCircle size={18} className="text-indigo-600" />
              </button>
            )}
            <div
              onClick={() => user ? navigate("/profile") : navigate("/auth")}
              className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-lg cursor-pointer"
            >
              {user?.email?.[0]?.toUpperCase() || "?"}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* HERO */}
          <div className="relative h-[55vh] sm:h-[65vh] w-full flex items-center justify-center overflow-hidden">
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
              <source src="/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#F8F9FB]" />

            <div className="relative z-20 text-center px-4">
              <p className="text-[10px] sm:text-[11px] tracking-[0.25em] text-white/70 mb-4 uppercase font-bold">
                PREMIUM RENTAL EXPERIENCE
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.1]">
                FIND RENT <br />
                <span className="text-indigo-400 italic">RELAX.</span>
              </h1>

              <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-8 sm:mt-10">
                <button
                  onClick={() => navigate("/properties")}
                  className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-indigo-700 transition shadow-lg"
                >
                  Browse Properties <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => requireAuth(() => navigate(userRole === 'landlord' ? "/landlord" : userRole === 'admin' ? "/admin" : "/tenant"))}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-xs sm:text-sm backdrop-blur-md hover:bg-white hover:text-black transition"
                >
                  {userRole === 'landlord' ? 'Landlord Hub' : userRole === 'admin' ? 'Admin Console' : 'Tenant Hub'}
                </button>
              </div>
            </div>
          </div>

          {/* WIDGETS */}
          <div className="px-4 sm:px-10 -mt-12 sm:-mt-16 relative z-30 pb-16 sm:pb-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-20">

              {/* 1. BUDGET PGS */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center group hover:translate-y-[-4px] transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  <Wallet className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Budget PGs</h3>
                <p className="text-[10px] font-bold text-slate-400 mb-3">₹5,000 - ₹{budgetVal.toLocaleString()}</p>
                <input
                  type="range" min="3000" max="50000" step="500"
                  value={budgetVal}
                  onChange={(e) => setBudgetVal(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 mb-3"
                />
                <div className="flex justify-between w-full text-[9px] font-black text-slate-300 uppercase mb-3">
                  <span>3K</span><span>50K</span>
                </div>
                <button
                  onClick={() => navigate(`/properties?maxPrice=${budgetVal}`)}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={12} /> Smart Optimizer
                </button>
              </div>

              {/* 2. FURNISHED */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  <Home className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Furnished</h3>
                <p className="text-[10px] font-bold text-slate-400 mb-3">Ready to move</p>
                <div className="space-y-2 w-full">
                  <button
                    onClick={() => { setFurnishingType('fully'); navigate('/furnished?type=fully'); }}
                    className={`w-full py-2.5 px-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-between ${
                      furnishingType === 'fully' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2"><Bed size={12}/> Fully Furnished</span>
                  </button>
                  <button
                    onClick={() => { setFurnishingType('minimal'); navigate('/furnished?type=minimal'); }}
                    className={`w-full py-2.5 px-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-between ${
                      furnishingType === 'minimal' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2"><Sliders size={12}/> Minimal Setup</span>
                  </button>
                </div>
              </div>

              {/* 3. SHARED */}
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  <Users className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Shared</h3>
                <p className="text-[10px] font-bold text-slate-400 mb-3">Split the cost</p>

                <div className="w-full bg-slate-50 rounded-xl p-3 mb-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Rent</p>
                  <input
                    type="number"
                    value={totalRentInput}
                    onChange={(e) => setTotalRentInput(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent font-black text-sm text-slate-800 outline-none"
                  />
                </div>
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="text-[10px] font-black uppercase text-slate-400">People</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSplitPeople(Math.max(1, splitPeople-1))} className="w-7 h-7 rounded-lg bg-slate-100 font-black text-slate-600">-</button>
                    <span className="text-xs font-black w-5 text-center">{splitPeople}</span>
                    <button onClick={() => setSplitPeople(splitPeople+1)} className="w-7 h-7 rounded-lg bg-slate-100 font-black text-slate-600">+</button>
                  </div>
                </div>
                <div className="w-full text-center bg-indigo-50 rounded-xl py-2">
                  <p className="text-[9px] font-black uppercase text-indigo-500">Per Person</p>
                  <p className="font-black text-indigo-600 text-sm">₹{Math.round(totalRentInput/splitPeople).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => navigate('/shared')}
                  className="w-full mt-2 py-2 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-500 rounded-xl text-[10px] font-black uppercase transition"
                >
                  Find Roommates
                </button>
              </div>

              {/* 4. NEAR ME */}
              <div onClick={() => navigate("/near-me")} className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center cursor-pointer group hover:translate-y-[-4px] transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Navigation className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Near Me</h3>
                <p className="text-[10px] font-bold text-slate-400 mb-3">Sorted by distance</p>
                <div className="flex gap-2 mb-3">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-md">Smart Sort</span>
                  <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase rounded-md">Closest</span>
                </div>
                <div className="flex gap-3 text-slate-300 group-hover:text-indigo-600 transition-colors mb-3">
                  <Wifi size={16}/><Tv size={16}/><Users size={16}/><Utensils size={16}/>
                </div>
                <button className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition flex items-center justify-center gap-1.5">
                  <Navigation size={12}/> Open Map
                </button>
              </div>
            </div>

            {/* BUDGET OPTIMIZER RESULTS */}
            {optimizedResults.length > 0 && (
              <div className="mb-12 sm:mb-16">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-black tracking-widest text-indigo-500 uppercase">Smart Optimizer</p>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
                      Top picks under ₹{budgetVal.toLocaleString()}
                    </h2>
                  </div>
                  <button onClick={() => navigate(`/properties?maxPrice=${budgetVal}`)} className="hidden sm:flex items-center gap-1 text-xs font-black text-indigo-600 hover:underline">
                    View all <ArrowRight size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {optimizedResults.slice(0, 3).map((p, i) => {
                    const savings = budgetVal - p.rent;
                    const pct = Math.round((savings / budgetVal) * 100);
                    const medals = ['🥇', '🥈', '🥉'];
                    return (
                      <motion.div
                        key={p.id}
                        whileHover={{ y: -4 }}
                        onClick={() => navigate(`/property/${p.id}`)}
                        className="bg-white rounded-2xl overflow-hidden border border-slate-100 cursor-pointer shadow-sm hover:shadow-xl transition-all"
                      >
                        <div className="relative h-32 sm:h-40">
                          <img src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"} className="w-full h-full object-cover" alt={p.title} />
                          <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-lg text-sm font-black shadow">{medals[i]} #{i+1}</div>
                          {pct > 0 && (
                            <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase">
                              Save {pct}%
                            </div>
                          )}
                        </div>
                        <div className="p-3 sm:p-4">
                          <h3 className="font-black text-xs sm:text-sm text-slate-800 truncate">{p.title}</h3>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 truncate">{p.area}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-indigo-600 font-black text-sm">₹{p.rent.toLocaleString()}</span>
                            <div className="flex gap-2 text-[9px] font-bold text-slate-400">
                              <span className="flex items-center gap-0.5"><Bed size={10}/>{p.bedrooms||1}</span>
                              <span className="flex items-center gap-0.5"><Bath size={10}/>{p.bathrooms||1}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FEATURED + MAP */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-black tracking-widest text-indigo-500 uppercase">Featured Units</p>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 italic">
                      {userLoc ? "Closest to you" : "Hand-picked for you"}
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => scrollFeatured('left')} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => scrollFeatured('right')} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <div
                  ref={featuredScrollRef}
                  className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {featured.map((p) => (
                    <motion.div
                      key={p.id}
                      whileHover={{ y: -4 }}
                      onClick={() => navigate(`/property/${p.id}`)}
                      className="shrink-0 w-[260px] sm:w-[300px] bg-white border border-slate-100 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all snap-start"
                    >
                      <div className="h-36 sm:h-44 relative overflow-hidden">
                        <img src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"} className="w-full h-full object-cover" alt={p.title} />
                        {(p as any)._distance != null && (
                          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-lg text-[10px] font-black text-slate-700 shadow">
                            {(p as any)._distance < 1 ? `${Math.round((p as any)._distance*1000)}m` : `${(p as any)._distance.toFixed(1)}km away`}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-black text-sm text-slate-800 truncate">{p.title}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 truncate">{p.area}</p>
                        <p className="text-indigo-600 font-black text-sm mt-2">₹{p.rent.toLocaleString()}<span className="text-[10px] text-slate-400">/month</span></p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex gap-2 text-slate-300">
                            <Wifi size={14}/><Tv size={14}/><Utensils size={14}/>
                          </div>
                          <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">View</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* MAP */}
              <div className="hidden lg:block h-[460px] sticky top-0">
                <div className="h-full rounded-2xl overflow-hidden border border-slate-200 shadow-lg relative">
                  <PropertyMap
                    properties={featured}
                    userLocation={userLoc}
                    onMarkerClick={(id) => navigate(`/property/${id}`)}
                  />
                  <button
                    onClick={() => navigate("/near-me")}
                    className="absolute bottom-4 left-4 right-4 z-[400] bg-white/95 backdrop-blur py-3 rounded-xl font-black text-xs uppercase text-indigo-600 hover:bg-indigo-600 hover:text-white transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <Navigation size={14} /> Open Full Map
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ChatDrawer
        open={chatOpen}
        onClose={() => { setChatOpen(false); setSupportOpen(false); }}
        openSupport={supportOpen}
      />
      <EmergencyBookingModal open={emergencyOpen} onClose={() => setEmergencyOpen(false)} />
    </div>
  );
};

export default Landing;
