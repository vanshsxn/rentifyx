import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Bell, MapPin, LayoutDashboard, Phone,
  Star, Bed, Navigation,
  Wifi, Tv, Utensils
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import CubeLoader from "@/components/CubeLoader";

const Landing = () => {
  const navigate = useNavigate();

  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showEmergency, setShowEmergency] = useState(false);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 🔥 NEW STATES
  const [budget, setBudget] = useState(10000);
  const [furnishType, setFurnishType] = useState<"full" | "minimal" | null>(null);
  const [sharedTotal, setSharedTotal] = useState(18000);
  const [peopleCount, setPeopleCount] = useState(3);

  useEffect(() => {
    getFeatured();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      });
    }
  }, []);

  const getFeatured = async () => {
    let { data } = await supabase
      .from("properties")
      .select("*")
      .eq("is_featured", true)
      .limit(10);

    setList(data || []);
    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">

      {/* SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 bg-black/40 backdrop-blur-3xl p-6">
        <div className="flex items-center gap-3 mb-10">
          <MapPin className="text-primary w-8 h-8" />
          <span className="text-2xl font-black">Rentifyx</span>
        </div>

        <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-primary">
          <LayoutDashboard size={18} /> Dashboard
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-20 border-b border-white/5 bg-black/20 px-8 flex items-center justify-between">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              placeholder="Search PG..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10"
            />
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setShowEmergency(true)}
              className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs"
            >
              Emergency
            </button>
            <Bell />
          </div>
        </header>

        {/* SCROLL AREA */}
        <div className="flex-1 overflow-y-auto">

          {/* HERO */}
          <div className="relative h-[50vh] flex items-center justify-center">
            <h1 className="text-7xl font-black text-center">
              FIND RENT <br />
              <span className="text-primary italic">RELAX.</span>
            </h1>
          </div>

          {/* FILTER SECTION */}
          <div className="px-8 -mt-20 pb-20">

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">

              {/* 💰 BUDGET */}
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                <h3 className="text-xs text-gray-400 mb-2">BUDGET PGs</h3>

                <p className="text-lg font-bold mb-4">
                  ₹ {budget.toLocaleString()}
                </p>

                <input
                  type="range"
                  min="3000"
                  max="30000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />

                <button
                  onClick={() =>
                    navigate(`/properties?min=0&max=${budget}`)
                  }
                  className="mt-4 w-full py-2 bg-primary rounded-xl text-xs font-bold"
                >
                  Apply →
                </button>
              </div>

              {/* 🏠 FURNISHED */}
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                <h3 className="text-xs text-gray-400 mb-3">FURNISHED</h3>

                <button
                  onClick={() => {
                    setFurnishType("full");
                    navigate(`/properties?furnished=full`);
                  }}
                  className={`w-full p-2 mb-2 rounded-xl ${
                    furnishType === "full"
                      ? "bg-primary"
                      : "bg-white/10"
                  }`}
                >
                  Fully Furnished
                </button>

                <button
                  onClick={() => {
                    setFurnishType("minimal");
                    navigate(`/properties?furnished=minimal`);
                  }}
                  className={`w-full p-2 rounded-xl ${
                    furnishType === "minimal"
                      ? "bg-primary"
                      : "bg-white/10"
                  }`}
                >
                  Minimal Setup
                </button>
              </div>

              {/* 👥 SHARED */}
              <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                <h3 className="text-xs text-gray-400 mb-2">SHARED</h3>

                <input
                  type="number"
                  value={sharedTotal}
                  onChange={(e) =>
                    setSharedTotal(Number(e.target.value))
                  }
                  className="w-full mb-2 p-2 rounded-xl bg-white/10"
                  placeholder="Total Rent"
                />

                <input
                  type="number"
                  value={peopleCount}
                  onChange={(e) =>
                    setPeopleCount(Number(e.target.value))
                  }
                  className="w-full mb-2 p-2 rounded-xl bg-white/10"
                  placeholder="People"
                />

                <p className="text-sm text-gray-400">
                  ₹ {Math.floor(sharedTotal / peopleCount)} / person
                </p>

                <button
                  onClick={() =>
                    navigate(`/properties?max=${sharedTotal}&shared=true`)
                  }
                  className="mt-3 w-full py-2 bg-primary rounded-xl text-xs"
                >
                  Find →
                </button>
              </div>

              {/* 📍 NEAR ME */}
              <div
                onClick={() => navigate("/properties?sort=distance")}
                className="p-6 rounded-[2rem] bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10"
              >
                <h3 className="text-xs text-gray-400 mb-3">NEAR ME</h3>

                <div className="flex gap-3 mb-3 text-gray-400">
                  <Wifi size={16} />
                  <Tv size={16} />
                  <Utensils size={16} />
                </div>

                <p className="text-sm font-bold">Closest First</p>
              </div>
            </div>

            {/* LISTINGS */}
            <h2 className="text-3xl font-black mb-6">Featured Units</h2>

            {loading ? (
              <CubeLoader />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {list.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/property/${p.id}`)}
                    className="bg-white/5 rounded-[2rem] overflow-hidden cursor-pointer hover:bg-white/10"
                  >
                    <img
                      src={p.image_url}
                      className="h-60 w-full object-cover"
                    />

                    <div className="p-4">
                      <h3 className="font-bold">{p.title}</h3>
                      <p className="text-sm text-gray-400">{p.area}</p>

                      <div className="flex justify-between mt-3 text-sm">
                        <span>₹{p.rent}</span>
                        <span className="flex items-center gap-1 text-orange-400">
                          <Star size={14} /> 4.8
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* EMERGENCY MODAL */}
      <AnimatePresence>
        {showEmergency && (
          <div className="fixed inset-0 flex items-center justify-center">
            <motion.div
              className="absolute inset-0 bg-black/80"
              onClick={() => setShowEmergency(false)}
            />

            <motion.div className="bg-black p-6 rounded-2xl">
              <h2 className="mb-4 font-bold">Emergency</h2>
              <a href="tel:100" className="block mb-2">
                Police - 100
              </a>
              <a href="tel:102">Ambulance - 102</a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;