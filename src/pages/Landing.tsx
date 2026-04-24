import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, MapPin, Wallet, Home, Users, Search,
  PanelLeftClose, PanelLeft, ChevronLeft, ChevronRight,
  Navigation, Bed, Bath
} from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CubeLoader from "@/components/CubeLoader";
import PropertyMap from "@/components/PropertyMap";
import { sortByProximity, getUserLocation } from "@/lib/geo";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userLoc, setUserLoc] = useState<any>(null);

  const featuredScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("properties").select("*").then(({ data }) => {
      setProperties(data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    getUserLocation().then(setUserLoc).catch(() => {});
  }, []);

  const featured = useMemo(() => {
    if (userLoc) {
      return sortByProximity(properties, userLoc).slice(0, 8);
    }
    return properties.slice(0, 8);
  }, [properties, userLoc]);

  const scrollFeatured = (dir: "left" | "right") => {
    if (!featuredScrollRef.current) return;
    featuredScrollRef.current.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <CubeLoader />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FB]">

      {/* SIDEBAR */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0 }}
            animate={{ width: 260 }}
            exit={{ width: 0 }}
            className="hidden lg:flex flex-col bg-white border-r p-5"
          >
            <div className="flex justify-between mb-6">
              <span className="font-black text-xl">RentifyX</span>
              <button onClick={() => setSidebarOpen(false)}>
                <PanelLeftClose />
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* TOPBAR */}
        <div className="h-16 flex items-center justify-between px-6 bg-white border-b">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)}>
              <PanelLeft />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Search />
            <input placeholder="Search..." className="outline-none text-sm" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {/* FEATURED + MAP */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT SIDE */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* HORIZONTAL SLIDER */}
              <div>
                <div className="flex justify-between mb-4">
                  <h2 className="text-2xl font-black">
                    {userLoc ? "Closest to you" : "Featured"}
                  </h2>

                  <div className="flex gap-2">
                    <button onClick={() => scrollFeatured("left")}>
                      <ChevronLeft />
                    </button>
                    <button onClick={() => scrollFeatured("right")}>
                      <ChevronRight />
                    </button>
                  </div>
                </div>

                <div
                  ref={featuredScrollRef}
                  className="flex gap-4 overflow-x-auto"
                >
                  {featured.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/property/${p.id}`)}
                      className="min-w-[250px] bg-white rounded-xl shadow cursor-pointer"
                    >
                      <img
                        src={p.image_url}
                        className="h-40 w-full object-cover rounded-t-xl"
                      />
                      <div className="p-3">
                        <p className="font-bold text-sm">{p.title}</p>
                        <p className="text-xs text-gray-400">{p.area}</p>
                        <p className="text-indigo-600 font-bold">
                          ₹{p.rent}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VERTICAL SCROLL GRID */}
              <div>
                <h3 className="text-xl font-black mb-3">
                  More Properties
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
                  {properties.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/property/${p.id}`)}
                      className="bg-white rounded-xl p-3 cursor-pointer shadow-sm"
                    >
                      <img
                        src={p.image_url}
                        className="h-28 w-full object-cover rounded"
                      />
                      <p className="text-xs font-bold mt-1">{p.title}</p>
                      <p className="text-[10px] text-gray-400">{p.area}</p>
                      <p className="text-indigo-600 text-xs font-bold">
                        ₹{p.rent}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT SIDE MAP */}
            <div className="hidden lg:block h-[500px] sticky top-0">
              <PropertyMap
                properties={properties} // ✅ IMPORTANT FIX
                userLocation={userLoc}
                onMarkerClick={(id) => navigate(`/property/${id}`)}
              />
            </div>

          </div>

        </div>
      </main>
    </div>
  );
};

export default Landing;