import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Navigation,
  MapPin
} from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import PropertyMap from "@/components/PropertyMap";
import { getUserLocation, sortByProximity } from "@/lib/geo";

const Landing = () => {
  const navigate = useNavigate();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLoc, setUserLoc] = useState<any>(null);

  const featuredScrollRef = useRef<HTMLDivElement>(null);

  // FETCH DATA
  useEffect(() => {
    supabase.from("properties").select("*").then(({ data }) => {
      setProperties(data || []);
      setLoading(false);
    });
  }, []);

  // USER LOCATION
  useEffect(() => {
    getUserLocation().then(setUserLoc).catch(() => {});
  }, []);

  // FEATURED LOGIC
  const featured = useMemo(() => {
    if (userLoc) {
      return sortByProximity(properties, userLoc).slice(0, 10);
    }
    return properties.slice(0, 10);
  }, [properties, userLoc]);

  // SCROLL
  const scrollFeatured = (dir: "left" | "right") => {
    if (!featuredScrollRef.current) return;
    featuredScrollRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FB] min-h-screen p-6">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <MapPin className="text-white w-5 h-5" />
        </div>
        <h1 className="text-2xl font-black">RentifyX</h1>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* FEATURED SLIDER */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black">
                {userLoc ? "Closest to you" : "Featured Properties"}
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={() => scrollFeatured("left")}
                  className="p-2 bg-white rounded-xl border"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={() => scrollFeatured("right")}
                  className="p-2 bg-white rounded-xl border"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>

            <div
              ref={featuredScrollRef}
              className="flex gap-4 overflow-x-auto pb-4"
            >
              {featured.slice(0, 6).map((p) => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/property/${p.id}`)}
                  className="min-w-[260px] bg-white rounded-xl overflow-hidden shadow cursor-pointer"
                >
                  <img
                    src={p.image_url}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-bold">{p.title}</h3>
                    <p className="text-sm text-gray-500">{p.area}</p>
                    <p className="text-indigo-600 font-bold mt-1">
                      ₹{p.rent}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* GRID BELOW */}
          <div>
            <h3 className="text-xl font-black mb-4">
              More Properties
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {properties.slice(6, 18).map((p) => (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/property/${p.id}`)}
                  className="bg-white rounded-xl overflow-hidden shadow cursor-pointer"
                >
                  <img
                    src={p.image_url}
                    className="h-32 w-full object-cover"
                  />
                  <div className="p-2">
                    <h4 className="font-bold text-sm truncate">
                      {p.title}
                    </h4>
                    <p className="text-xs text-gray-500">{p.area}</p>
                    <p className="text-indigo-600 font-bold text-sm">
                      ₹{p.rent}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT SIDE MAP */}
        <div className="hidden lg:block h-[520px] sticky top-4">
          <div className="h-full rounded-xl overflow-hidden border shadow relative">

            <PropertyMap
              properties={properties.filter(
                (p) => p.latitude && p.longitude
              )}
              userLocation={userLoc}
              onMarkerClick={(id) => navigate(`/property/${id}`)}
            />

            <button
              onClick={() => navigate("/near-me")}
              className="absolute bottom-4 left-4 right-4 bg-white py-3 rounded-xl font-bold text-indigo-600"
            >
              <Navigation size={14} /> Open Full Map
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Landing;