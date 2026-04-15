import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, MapPin, Star, Bed, Bath, Maximize, Cigarette, Moon, Briefcase, GraduationCap, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import CubeLoader from "@/components/CubeLoader";

interface Property {
  id: string;
  title: string;
  address: string;
  area: string;
  rent: number;
  rating: number;
  image_url: string | null;
  tags: string[] | null;
  features: string[] | null;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
}

const SHARING_OPTIONS = [
  { value: 1, label: "Single", icon: "👤" },
  { value: 2, label: "Double", icon: "👤👤" },
  { value: 3, label: "Triple", icon: "👤👤👤" },
  { value: 4, label: "Quad", icon: "👤👤👤👤" },
];

const LIFESTYLE_FILTERS = [
  { key: "non_smoker", label: "Non-Smoker", icon: Cigarette },
  { key: "early_bird", label: "Early Bird", icon: Moon },
  { key: "working", label: "Working Pro", icon: Briefcase },
  { key: "student", label: "Student", icon: GraduationCap },
];

// Static roommate profiles for demo
const MOCK_ROOMMATES = [
  { name: "Arjun K.", age: 24, type: "Working Pro", lifestyle: "Non-Smoker, Early Bird", compatibility: 92 },
  { name: "Priya S.", age: 22, type: "Student", lifestyle: "Non-Smoker, Night Owl", compatibility: 85 },
  { name: "Rahul M.", age: 26, type: "Working Pro", lifestyle: "Non-Smoker, Early Bird", compatibility: 88 },
  { name: "Sneha D.", age: 23, type: "Student", lifestyle: "Non-Smoker, Early Bird", compatibility: 78 },
];

const Shared = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharingCount, setSharingCount] = useState(2);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showRoommates, setShowRoommates] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("properties")
        .select("id, title, address, area, rent, rating, image_url, tags, features, bedrooms, bathrooms, sqft")
        .order("rent", { ascending: true })
        .limit(20);
      setProperties((data || []) as Property[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const toggleFilter = (key: string) => {
    setSelectedFilters(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);
  };

  return (
    <div className="min-h-screen bg-background pb-20 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="p-2.5 rounded-xl bg-secondary hover:bg-border transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">👥 Shared Living</h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Split the cost, share the vibe</p>
            </div>
          </div>

          {/* Sharing Selector Slider */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">How many people?</p>
            <div className="flex gap-2">
              {SHARING_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSharingCount(opt.value)}
                  className={`flex-1 py-3 rounded-xl text-center transition-all border ${
                    sharingCount === opt.value
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/30"
                  }`}
                >
                  <div className="text-lg">{opt.icon}</div>
                  <p className="text-[9px] font-bold mt-0.5">{opt.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Lifestyle Filters */}
          <div className="flex gap-2 flex-wrap">
            {LIFESTYLE_FILTERS.map(f => {
              const active = selectedFilters.includes(f.key);
              return (
                <button
                  key={f.key}
                  onClick={() => toggleFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    active ? "bg-primary/10 text-primary border-primary/30" : "bg-secondary/50 text-muted-foreground border-border"
                  }`}
                >
                  <f.icon className="w-3.5 h-3.5" /> {f.label}
                </button>
              );
            })}
            <button
              onClick={() => setShowRoommates(!showRoommates)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                showRoommates ? "bg-pink-500/10 text-pink-600 border-pink-500/30" : "bg-secondary/50 text-muted-foreground border-border"
              }`}
            >
              <Heart className="w-3.5 h-3.5" /> Find Roommate
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Roommate Match Section */}
        {showRoommates && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
            <h2 className="text-lg font-black uppercase tracking-tight">🤝 Roommate Matches</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_ROOMMATES.map((rm, i) => (
                <motion.div
                  key={rm.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-black text-primary shrink-0">
                    {rm.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-sm">{rm.name}</h3>
                      <span className="text-[10px] font-black text-primary">{rm.compatibility}% Match</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{rm.age} yrs · {rm.type}</p>
                    <p className="text-[9px] text-muted-foreground/70">{rm.lifestyle}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-black text-primary">
                      {rm.compatibility}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Properties */}
        {loading ? (
          <div className="h-64 flex items-center justify-center"><CubeLoader /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p, i) => {
              const splitRent = Math.round(p.rent / sharingCount);

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                  onClick={() => navigate(`/property/${p.id}`)}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[9px] font-bold">
                      {sharingCount} Sharing
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{p.title}</h3>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.area}</p>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-secondary/50 rounded-xl p-3 space-y-1.5 border border-border/50">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-muted-foreground">Total Rent</span>
                        <span className="font-bold">₹{p.rent.toLocaleString()}</span>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between text-[11px]">
                        <span className="text-primary font-bold">Split ({sharingCount} people)</span>
                        <span className="font-black text-primary">₹{splitRent.toLocaleString()} each</span>
                      </div>
                    </div>

                    {/* Quick stats */}
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                      {p.bedrooms && <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {p.bedrooms} Bed</span>}
                      {p.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {p.bathrooms} Bath</span>}
                      {p.sqft && <span className="flex items-center gap-1"><Maximize className="w-3 h-3" /> {p.sqft} sqft</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shared;
