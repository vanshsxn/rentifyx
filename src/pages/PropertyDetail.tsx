import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeft, Star, MapPin, Bed, Bath, Maximize, 
  Phone, MessageCircle, CalendarDays, Share2, 
  Heart, Box, Building2, Loader2, Lock 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface DBProperty { 
  id: string; 
  title: string; 
  address: string; 
  area: string; 
  rent: number; 
  rating: number; 
  image_url: string | null; 
  images: string[] | null;
  bedrooms: number; 
  bathrooms: number; 
  sqft: number; 
  features: string[]; 
  has_vr: boolean; 
  vr_url: string | null; 
  phone: string | null; 
}

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [p, setP] = useState<DBProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      if (!id) return;
      
      // 1. Get Property Data
      const { data } = await supabase.from("properties").select("*").eq("id", id).single();
      if (data) setP(data as DBProperty);
      setLoading(false);

      if (user) {
        // 2. Get User Role (Crucial for VR Unlocking)
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        if (roleData) setRole(roleData.role);

        // 3. Check Favorites
        const { data: f } = await supabase.from("favorites")
          .select("id").eq("user_id", user.id).eq("property_id", id).limit(1);
        if (f?.length) setIsFav(true);
      }
    };
    getData();
  }, [id, user]);

  const toggleFav = async () => {
    if (!user) return toast.error("Sign in required");
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("property_id", id!);
      setIsFav(false);
      toast.success("Removed");
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, property_id: id! });
      setIsFav(true);
      toast.success("Saved");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!p) return <div className="h-screen flex items-center justify-center text-xs font-black uppercase">Unit Not Found</div>;

  const imgs = p.images && p.images.length > 0 ? p.images : [p.image_url || ""];
  
  // FIX: Unlocked for Tenants and Admins only.
  const canAccessVR = user && (role === "tenant" || role === "admin");

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-xl transition-colors"><ArrowLeft className="w-5 h-5"/></button>
        <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">{p.title}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleFav} className="p-2"><Heart className={`w-5 h-5 ${isFav ? "fill-destructive text-destructive" : ""}`}/></button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }} className="p-2"><Share2 className="w-5 h-5"/></button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[80px,1fr,400px] gap-8 items-start">
          
          {/* 1. Thumbnail Strip */}
          <div className="flex flex-row md:flex-col gap-3 overflow-x-auto scrollbar-hide">
            {imgs.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                  i === activeImg ? "border-primary scale-105 shadow-md" : "border-transparent opacity-40"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
              </button>
            ))}
          </div>

          {/* 2. Main High-Performance View */}
          <div className="relative aspect-square bg-card rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImg}
                src={imgs[activeImg]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute top-6 right-6 bg-background/90 backdrop-blur-xl px-4 py-2 rounded-2xl text-xs font-black text-primary border border-white/10 shadow-xl">
              ₹{p.rent.toLocaleString()}
            </div>
          </div>

          {/* 3. Action & Info Panel */}
          <div className="space-y-8">
            <div className="space-y-2">
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">{p.title}</h1>
                    <div className="flex items-center gap-1 text-orange-500 font-bold text-xs"><Star className="w-3.5 h-3.5 fill-current"/>{p.rating}</div>
                </div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary"/>{p.address}</p>
            </div>

            {/* --- FIXED VR LOGIC AREA --- */}
            {p.has_vr && p.vr_url ? (
              canAccessVR ? (
                <button 
                  onClick={() => window.open(p.vr_url!, "_blank")}
                  className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all"
                >
                  <Box className="w-5 h-5" /> Launch 3D VR Tour
                </button>
              ) : (
                <div className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-secondary/50 border border-border/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                  <Lock className="w-4 h-4" /> Tenant Access Only
                </div>
              )
            ) : (
              <div className="w-full py-5 text-center text-[10px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/20">
                VR Content Unavailable
              </div>
            )}
            {/* --------------------------- */}

            <div className="grid grid-cols-3 gap-3">
              {[{i:Bed, v:p.bedrooms, l:"Beds"}, {i:Bath, v:p.bathrooms, l:"Baths"}, {i:Maximize, v:p.sqft, l:"SqFt"}].map((s, idx) => (
                <div key={idx} className="bg-card border border-border/50 p-4 rounded-2xl text-center">
                  <s.i className="w-4 h-4 mx-auto mb-2 text-primary opacity-60"/>
                  <p className="text-sm font-black">{s.v}</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">{s.l}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => window.open(`tel:${p.phone}`)} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all"><Phone className="w-4 h-4"/> Call</button>
                <button className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-secondary font-black text-[10px] uppercase tracking-widest hover:bg-secondary/80 transition-all"><MessageCircle className="w-4 h-4"/> Chat</button>
                <button className="col-span-2 flex items-center justify-center gap-2 py-4 rounded-2xl bg-secondary font-black text-[10px] uppercase tracking-widest hover:bg-secondary/80 transition-all"><CalendarDays className="w-4 h-4"/> Schedule Visit</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetail;