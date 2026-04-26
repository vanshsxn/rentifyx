import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Sparkles, Star, MapPin, Wallet, Siren, TrendingDown, 
  X, Zap, IndianRupee, LayoutDashboard, LogIn, Shield, Award, 
  ArrowDownNarrowWide, CheckCircle2, Lock, Clock
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PropertyMap, { MapMarkerData } from "@/components/PropertyMap";

interface DBProperty {
  id: string;
  title: string;
  address: string;
  area: string;
  rent: number;
  rating: number;
  image_url: string | null;
  tags: string[];
  has_vr: boolean;
  latitude?: number | null;
  longitude?: number | null;
  is_emergency?: boolean;
  availability_status?: string | null;
}

const Landing = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<DBProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapProps, setMapProps] = useState<DBProperty[]>([]);
  const [ratings, setRatings] = useState<Record<string, { avg: number; count: number }>>({});
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(
    () => typeof window !== "undefined" && localStorage.getItem("featured_emergency_only") === "1"
  );
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating">(
    () => (typeof window !== "undefined" ? (localStorage.getItem("featured_sort") as any) : null) || "default"
  );

  useEffect(() => {
    localStorage.setItem("featured_emergency_only", emergencyOnly ? "1" : "0");
  }, [emergencyOnly]);
  
  useEffect(() => {
    localStorage.setItem("featured_sort", sortBy);
  }, [sortBy]);
  
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [tempBudget, setTempBudget] = useState("");

  useEffect(() => {
    const init = async () => {
      await checkUser();
      await getFeatured();
      await getMapped();
      await getRatings();
    };
    init();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await (supabase.auth as any).getSession();
    if (session?.user) {
      setIsLoggedIn(true);
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).maybeSingle();
      setUserRole(data?.role || "tenant");
    }
  };

  const getFeatured = async () => {
    const { data } = await supabase.from("properties").select("*").eq("is_featured", true).limit(6);
    if (!data || data.length === 0) {
      const { data: top } = await supabase.from("properties").select("*").order("rating", { ascending: false }).limit(6);
      setList(top || []);
    } else {
      setList(data);
    }
    setLoading(false);
  };

  const getMapped = async () => {
    const { data } = await supabase.from("properties").select("*").not("latitude", "is", null).limit(50);
    setMapProps(data || []);
  };

  const getRatings = async () => {
    const { data } = await supabase.from("property_ratings").select("property_id, rating");
    const map: Record<string, { sum: number; count: number }> = {};
    (data || []).forEach((r) => {
      if (!map[r.property_id]) map[r.property_id] = { sum: 0, count: 0 };
      map[r.property_id].sum += Number(r.rating);
      map[r.property_id].count += 1;
    });
    const agg: Record<string, { avg: number; count: number }> = {};
    Object.entries(map).forEach(([k, v]) => agg[k] = { avg: v.sum / v.count, count: v.count });
    setRatings(agg);
  };

  const liveRating = (p: DBProperty) => {
    const r = ratings[p.id];
    return r ? r.avg.toFixed(1) : (p.rating || 0).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <AnimatePresence>
        {showBudgetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowBudgetModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-card border border-border p-10 rounded-[3rem] shadow-2xl">
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-black uppercase italic">AI Budget Matcher</h2>
                <input 
                  type="number" placeholder="Enter Budget..." 
                  className="w-full bg-secondary rounded-2xl py-5 px-6 text-sm font-black"
                  value={tempBudget} onChange={(e) => setTempBudget(e.target.value)}
                />
                <button onClick={() => navigate(`/tenant?maxRent=${tempBudget}`)} className="w-full py-5 bg-foreground text-background rounded-2xl font-black uppercase">Optimize Selection</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="relative min-h-[60vh] flex items-center justify-center bg-slate-950 text-center px-4">
        <div className="relative z-10 space-y-6">
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase">Find Rent <span className="text-primary italic">Relax.</span></h1>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate("/properties")} className="bg-primary text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest">Browse All</button>
          </div>
        </div>
      </section>

      <main className="container max-w-6xl mx-auto px-4 py-20">
        <div className="flex justify-between items-end mb-12 border-b pb-6">
          <h2 className="text-3xl font-black uppercase">Featured Units</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${emergencyOnly ? 'bg-red-600 text-white' : 'bg-card'}`}
            >
              Emergency Only
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {list
              .filter(p => !emergencyOnly || p.is_emergency)
              .map((p) => (
                <div key={p.id} onClick={() => navigate(`/property/${p.id}`)} className="group cursor-pointer space-y-3">
                  <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-muted">
                    <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover" alt={p.title} />
                    
                    {/* INLINED BADGE LOGIC - ZERO IMPORTS */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {p.is_emergency && (
                        <div className="inline-flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-md shadow-lg animate-pulse">
                          <Siren size={12} strokeWidth={3} />
                          <span className="text-[9px] font-black uppercase">Emergency</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold uppercase">{p.title}</h3>
                      <p className="text-[10px] text-muted-foreground uppercase">{p.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary">₹{p.rent.toLocaleString()}</p>
                      <div className="flex items-center gap-1 text-orange-500 text-[10px] font-bold justify-end">
                        <Star className="w-3 h-3 fill-current" /> {liveRating(p)}
                      </div>
                    </div>
                  </div>
                </div>
            ))}
          </div>

          <aside className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Live Map
            </h3>
            <div className="rounded-2xl overflow-hidden border border-border h-[400px]">
              <PropertyMap 
                height="100%"
                markers={mapProps.map(p => ({
                  id: p.id, lat: p.latitude!, lng: p.longitude!, title: p.title, rent: p.rent,
                  isEmergency: p.is_emergency, onClick: () => navigate(`/property/${p.id}`)
                }))}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Landing;