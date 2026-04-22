import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, MapPin, Star, Wifi, Car, Droplets, Shield, Wind, Zap,
  Dumbbell, Loader2, LogOut, ChevronDown, Sparkles, ZapIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ✅ Defined OUTSIDE TenantDashboard to prevent "r is not a function" crash
const PropertyCard = ({
  p,
  isHero = false,
  onNavigate,
}: {
  p: any;
  isHero?: boolean;
  onNavigate: (id: string) => void;
}) => {
  const amenitiesCount = Array.from(
    new Set([...(p.features || []), ...(p.tags || [])])
  ).length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-[2.5rem] overflow-hidden border ${
        isHero
          ? "border-primary/40 shadow-2xl shadow-primary/10"
          : "border-border/50"
      } group cursor-pointer hover:shadow-2xl transition-all`}
      onClick={() => onNavigate(`/property/${p.id}`)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={p.image_url || "/placeholder.jpg"}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          alt={p.title}
        />
        {isHero && (
          <div className="absolute top-4 left-4 bg-primary px-4 py-2 rounded-2xl text-[10px] font-black text-white uppercase flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Best Match
          </div>
        )}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-white">
          ₹{p.rent.toLocaleString()}
        </div>
        <div className="absolute bottom-4 left-4 bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-wider text-primary-foreground shadow-lg">
          {amenitiesCount} Premium Features
        </div>
      </div>
      <div className="p-7 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="font-black uppercase tracking-tighter text-lg leading-tight group-hover:text-primary transition-colors">
              {p.title}
            </h3>
            <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" /> {p.area}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-orange-500/10 text-orange-600 px-2 py-1 rounded-lg text-[10px] font-black">
            <Star className="w-3 h-3 fill-current" /> {p.rating?.toFixed(1) || "0.0"}
          </div>
        </div>
        <div className="pt-4 border-t border-border/50 flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Monthly Rent
          </span>
          <span className="text-sm font-black italic tracking-tight">
            ₹{p.rent.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const TenantDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [bestMatch, setBestMatch] = useState<any>(null);
  const [otherProperties, setOtherProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  const isOptimized = searchParams.get("optimize") === "true";
  const hasMaxRent = searchParams.get("maxRent");

  const getPageTitle = () => {
    if (isOptimized || hasMaxRent) return "Smart Budget Analyzer";
    if (userProfile?.role === "landlord") return "Landlord Hub";
    return "Marketplace";
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await (supabase.auth as any).getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profile) setUserProfile(profile);
    }

    const { data: props, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && props) setProperties(props);
    setLoading(false);
  };

  useEffect(() => {
    if (!properties.length) return;
    let pool = [...properties];

    if (selectedTags.length > 0) {
      pool = pool.filter((p) => {
        const combined = [...(p.features || []), ...(p.tags || [])];
        return selectedTags.every((tag) => combined.includes(tag));
      });
    }

    const maxRentParam = searchParams.get("maxRent");
    const numericQuery =
      !isNaN(Number(searchQuery)) && searchQuery !== ""
        ? Number(searchQuery)
        : null;
    const budgetLimit =
      numericQuery || (maxRentParam ? Number(maxRentParam) : null);

    if (budgetLimit) {
      const exactMatches = pool.filter((p) => Number(p.rent) === budgetLimit);
      const underBudget = pool.filter((p) => Number(p.rent) < budgetLimit);

      const sortByFeatures = (arr: any[]) =>
        arr.sort((a, b) => {
          const aCount = [...(a.features || []), ...(a.tags || [])].length;
          const bCount = [...(b.features || []), ...(b.tags || [])].length;
          return bCount - aCount;
        });

      const sortedExact = sortByFeatures([...exactMatches]);
      const sortedUnder = sortByFeatures([...underBudget]);

      if (sortedExact.length > 0) {
        setBestMatch(sortedExact[0]);
        setOtherProperties([...sortedExact.slice(1), ...sortedUnder]);
      } else if (sortedUnder.length > 0) {
        setBestMatch(sortedUnder[0]);
        setOtherProperties(sortedUnder.slice(1));
      } else {
        setBestMatch(null);
        setOtherProperties([]);
      }
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = pool.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.area?.toLowerCase().includes(query)
      );
      setBestMatch(null);
      setOtherProperties(filtered);
    }
  }, [searchQuery, selectedTags, properties, searchParams]);

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
          Syncing Database...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-4 md:py-6">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black italic tracking-tighter uppercase text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {getPageTitle()}
            </h1>
          </div>
          <div className="relative group w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search area or enter budget price..."
              className="w-full bg-secondary/50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-12">
        {bestMatch && (
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary whitespace-nowrap">
                Your Recommended Unit
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            <div className="max-w-lg mx-auto">
              <PropertyCard p={bestMatch} isHero onNavigate={navigate} />
            </div>
          </section>
        )}

        <section className="space-y-8">
          {otherProperties.length > 0 && (
            <div className="flex items-center justify-between">
              <h2 className="text-[12px] font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                <ZapIcon className="w-4 h-4 text-amber-500" />
                {bestMatch ? "Other Options Within Budget" : "Available Properties"}
              </h2>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherProperties.length > 0 ? (
              otherProperties.map((p) => (
                <PropertyCard key={p.id} p={p} onNavigate={navigate} />
              ))
            ) : (
              !bestMatch && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    No matches found for this criteria.
                  </p>
                </div>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TenantDashboard;