import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bed, Wind, Tv, UtensilsCrossed, Refrigerator, Star, MapPin, X, ChevronLeft, ChevronRight, Maximize, Bath } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
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
  furnish_type: string | null;
}

const FURNISH_OPTIONS = [
  { value: "all", label: "All" },
  { value: "fully_furnished", label: "Fully Furnished" },
  { value: "semi_furnished", label: "Semi Furnished" },
  { value: "unfurnished", label: "Unfurnished" },
];

const AMENITY_BADGES = [
  { key: "bed", icon: Bed, label: "Bed" },
  { key: "ac", icon: Wind, label: "AC" },
  { key: "tv", icon: Tv, label: "TV" },
  { key: "kitchen", icon: UtensilsCrossed, label: "Kitchen" },
  { key: "fridge", icon: Refrigerator, label: "Fridge" },
];

const Furnished = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [furnishFilter, setFurnishFilter] = useState("all");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("properties")
        .select("id, title, address, area, rent, rating, image_url, tags, features, bedrooms, bathrooms, sqft, furnish_type")
        .order("created_at", { ascending: false });

      // Filter to show properties that have furnishing-related tags or all
      let results = (data || []) as Property[];
      setProperties(results);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = properties.filter(p => {
    // Furnish type filter
    if (furnishFilter !== "all") {
      const pFurnish = p.furnish_type?.toLowerCase() || "unfurnished";
      if (!pFurnish.includes(furnishFilter.replace("_", " ").replace("_", ""))) {
        // Also check tags
        const allTags = [...(p.tags || []), ...(p.features || [])].map(t => t?.toLowerCase());
        const hasTag = allTags.some(t => t?.includes(furnishFilter.replace("_", " ")));
        if (!hasTag) return false;
      }
    }
    // Amenity filter
    if (selectedAmenities.length > 0) {
      const allTags = [...(p.tags || []), ...(p.features || [])].map(t => t?.toLowerCase() || "");
      return selectedAmenities.every(am => allTags.some(t => t.includes(am)));
    }
    return true;
  });

  const toggleAmenity = (key: string) => {
    setSelectedAmenities(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);
  };

  // Mock multiple images for preview
  const getPreviewImages = (p: Property) => {
    const base = p.image_url || "/placeholder.svg";
    return [base, base, base]; // In production, these would be separate images
  };

  return (
    <div className="min-h-screen bg-background pb-20 font-sans">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate("/")} className="p-2.5 rounded-xl bg-secondary hover:bg-border transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight">🏠 Furnished Properties</h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Ready-to-move convenience</p>
            </div>
          </div>

          {/* Furnish Type Toggle */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {FURNISH_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFurnishFilter(opt.value)}
                className={`px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border ${
                  furnishFilter === opt.value
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Amenity Badges Filter */}
          <div className="flex gap-2 flex-wrap">
            {AMENITY_BADGES.map(am => {
              const active = selectedAmenities.includes(am.key);
              return (
                <button
                  key={am.key}
                  onClick={() => toggleAmenity(am.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    active
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/20"
                  }`}
                >
                  <am.icon className="w-3.5 h-3.5" /> {am.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="h-64 flex items-center justify-center"><CubeLoader /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border">
            <p className="font-black uppercase text-muted-foreground/40 text-sm">No furnished properties found</p>
            <p className="text-[10px] text-muted-foreground/30 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => {
              const allTags = [...(p.tags || []), ...(p.features || [])].filter(Boolean);
              const hasBed = allTags.some(t => t.toLowerCase().includes("bed"));
              const hasAC = allTags.some(t => t.toLowerCase().includes("ac"));
              const hasFridge = allTags.some(t => t.toLowerCase().includes("fridge"));
              const hasTV = allTags.some(t => t.toLowerCase().includes("tv"));
              const hasKitchen = allTags.some(t => t.toLowerCase().includes("kitchen"));

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => navigate(`/property/${p.id}`)}>
                    <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <p className="text-white font-black text-lg">₹{p.rent.toLocaleString()}<span className="text-white/60 text-[10px]">/mo</span></p>
                      <div className="bg-card/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[9px] font-bold capitalize">
                        {p.furnish_type?.replace("_", " ") || "Unfurnished"}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{p.title}</h3>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.area}</p>
                    </div>

                    {/* Quick stats */}
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                      {p.bedrooms && <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {p.bedrooms} Bed</span>}
                      {p.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {p.bathrooms} Bath</span>}
                      {p.sqft && <span className="flex items-center gap-1"><Maximize className="w-3 h-3" /> {p.sqft} sqft</span>}
                    </div>

                    {/* Amenity badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {hasBed && <span className="text-[8px] px-2 py-1 bg-blue-500/10 text-blue-600 rounded-lg font-bold flex items-center gap-0.5">🛏 Bed</span>}
                      {hasFridge && <span className="text-[8px] px-2 py-1 bg-cyan-500/10 text-cyan-600 rounded-lg font-bold flex items-center gap-0.5">🧊 Fridge</span>}
                      {hasTV && <span className="text-[8px] px-2 py-1 bg-purple-500/10 text-purple-600 rounded-lg font-bold flex items-center gap-0.5">📺 TV</span>}
                      {hasAC && <span className="text-[8px] px-2 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg font-bold flex items-center gap-0.5">❄ AC</span>}
                      {hasKitchen && <span className="text-[8px] px-2 py-1 bg-orange-500/10 text-orange-600 rounded-lg font-bold flex items-center gap-0.5">🍳 Kitchen</span>}
                    </div>

                    {/* Preview Room Button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewProperty(p); setPreviewImageIndex(0); }}
                      className="w-full py-2.5 bg-primary/10 text-primary rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-primary/20 transition-all border border-primary/20"
                    >
                      👁 Preview Room
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Room Modal */}
      <AnimatePresence>
        {previewProperty && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewProperty(null)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
              <button onClick={() => setPreviewProperty(null)} className="absolute top-4 right-4 z-10 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-secondary"><X className="w-5 h-5" /></button>

              {/* Image Slider */}
              <div className="relative aspect-[4/3] bg-secondary">
                {(() => {
                  const images = getPreviewImages(previewProperty);
                  return (
                    <>
                      <img src={images[previewImageIndex]} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute bottom-3 right-3 bg-card/80 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold">
                        {previewImageIndex + 1} / {images.length}
                      </div>
                      {previewImageIndex > 0 && (
                        <button onClick={() => setPreviewImageIndex(i => i - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-secondary">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      )}
                      {previewImageIndex < images.length - 1 && (
                        <button onClick={() => setPreviewImageIndex(i => i + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-card/80 backdrop-blur-sm rounded-full hover:bg-secondary">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Info */}
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-lg">{previewProperty.title}</h3>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {previewProperty.area}</p>
                  </div>
                  <p className="text-xl font-black text-primary">₹{previewProperty.rent.toLocaleString()}<span className="text-[10px] text-muted-foreground">/mo</span></p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...(previewProperty.tags || []), ...(previewProperty.features || [])].filter(Boolean).map(tag => (
                    <span key={tag} className="text-[9px] px-2.5 py-1 bg-secondary rounded-lg font-bold">{tag}</span>
                  ))}
                </div>
                <button onClick={() => { setPreviewProperty(null); navigate(`/property/${previewProperty.id}`); }} className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:brightness-110 transition-all">
                  View Full Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Furnished;
