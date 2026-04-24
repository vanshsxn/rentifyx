import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Wifi, Tv, Utensils, Loader2, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lazy, Suspense } from "react";

const PropertyMap = lazy(() => import("@/components/PropertyMap"));
import { sortByProximity, getUserLocation } from "@/lib/geo";
import { toast } from "sonner";

const NearMe = () => {
  const navigate = useNavigate();
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [props, setProps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [locError, setLocError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const userLoc = await getUserLocation();
        setLoc(userLoc);
        const { data } = await supabase.from("properties").select("*");
        const sorted = sortByProximity(data || [], userLoc);
        setProps(sorted);
      } catch (e: any) {
        setLocError(e.message || "Unable to get your location");
        const { data } = await supabase.from("properties").select("*");
        setProps(data || []);
        toast.error("Location denied — showing all properties");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 sm:px-8 py-4 flex items-center gap-4 sticky top-0 z-30">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">Near Me</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            {loc ? `${props.length} properties sorted by proximity` : "Locating..."}
          </p>
        </div>
        {loc && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl">
            <Navigation size={14} className="text-indigo-600" />
            <span className="text-xs font-bold text-indigo-600">Live Location</span>
          </div>
        )}
      </header>

      {loading ? (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-sm font-bold text-slate-500">Finding nearest PGs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-4 sm:p-8">
          {/* List */}
          <div className="lg:col-span-3 space-y-4 lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto lg:pr-3">
            {locError && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-bold">
                ⚠ {locError}. Showing all properties without distance sort.
              </div>
            )}
            {props.length === 0 ? (
              <div className="p-10 bg-white rounded-2xl text-center">
                <MapPin className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-600">No properties found nearby</p>
              </div>
            ) : (
              props.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => navigate(`/property/${p.id}`)}
                  className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 cursor-pointer hover:shadow-lg transition group"
                >
                  <img
                    src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80"}
                    alt={p.title}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-black text-slate-800 text-sm sm:text-base truncate">{p.title}</h3>
                      {p._distance != null && (
                        <span className="shrink-0 text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                          {p._distance < 1 ? `${Math.round(p._distance * 1000)}m` : `${p._distance.toFixed(1)}km`}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{p.area}</p>
                    <p className="text-indigo-600 font-black text-sm mt-2">₹{p.rent.toLocaleString()}/mo</p>
                    <div className="flex items-center gap-2 mt-3 text-slate-300 group-hover:text-indigo-500 transition">
                      <Wifi size={14} /><Tv size={14} /><Utensils size={14} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Map */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 h-[400px] lg:h-[calc(100vh-160px)]">
            <PropertyMap
              properties={props}
              userLocation={loc}
              onMarkerClick={(id) => navigate(`/property/${id}`)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NearMe;
