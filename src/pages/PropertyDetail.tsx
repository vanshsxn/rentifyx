import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeft, Star, MapPin, Bed, Bath, Maximize, 
  Phone, MessageCircle, CalendarDays, Share2, 
  Heart, Sparkles, Building2, Loader2, X, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

// --- Sub-component for Recommendations ---
const RecommendedSection = ({ currentProperty }: { currentProperty: any }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecs = async () => {
      const { data } = await supabase
        .from("properties")
        .select("*")
        .neq("id", currentProperty.id) // Don't show the same house
        .gte("rent", currentProperty.rent - 5000) // Similar price floor
        .lte("rent", currentProperty.rent + 5000) // Similar price ceiling
        .limit(4);
      
      if (data) setRecommendations(data);
    };
    fetchRecs();
  }, [currentProperty]);

  if (recommendations.length === 0) return null;

  return (
    <section className="mt-20 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Recommended for You
        </h2>
        <Link to="/" className="text-[10px] font-black uppercase text-primary flex items-center gap-1 hover:underline">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((item) => (
          <Link 
            key={item.id} 
            to={`/property/${item.id}`}
            className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl transition-all"
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img 
                src={item.image_url || "/placeholder.jpg"} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
            </div>
            <div className="p-4 space-y-1">
              <h3 className="text-[11px] font-black uppercase truncate">{item.title}</h3>
              <p className="text-[9px] font-bold text-muted-foreground uppercase">{item.area}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-black text-primary">₹{item.rent.toLocaleString()}</span>
                <div className="flex items-center gap-1 text-[10px] font-bold"><Star className="w-3 h-3 fill-orange-500 text-orange-500"/>{item.rating || 0}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

// --- Sub-component for Rating ---
const RatingSection = ({ propertyId }: { propertyId: string }) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitRating = async () => {
    if (!user) return toast.error("Sign in to leave a review");
    if (userRating === 0) return toast.error("Please select a star rating");
    setIsSubmitting(true);
    const { error } = await supabase.from("property_ratings").upsert({
      property_id: propertyId,
      user_id: user.id,
      rating: userRating,
      comment: comment
    });
    if (error) toast.error("Rating failed: " + error.message);
    else { toast.success("Feedback submitted!"); setComment(""); }
    setIsSubmitting(false);
  };

  return (
    <div className="mt-10 p-6 bg-card border border-border rounded-[2rem] shadow-sm">
      <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
        <Star className="w-4 h-4 text-primary" /> Rate this Property
      </h3>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} onClick={() => setUserRating(star)}>
            <Star className={`w-8 h-8 ${star <= (hover || userRating) ? "fill-orange-500 text-orange-500" : "text-muted-foreground opacity-30"}`} />
          </button>
        ))}
      </div>
      <textarea placeholder="Experience... (Optional)" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-4 rounded-2xl bg-background border border-border text-xs min-h-[80px] mb-4" />
      <button onClick={submitRating} disabled={isSubmitting} className="w-full py-4 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:opacity-90">
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
};

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showVR, setShowVR] = useState(false);

  useEffect(() => {
    const getData = async () => {
      if (!id) return;
      const { data } = await supabase.from("properties").select("*").eq("id", id).single();
      if (data) setP(data);
      setLoading(false);
      window.scrollTo(0, 0); // Scroll to top on change
    };
    getData();
  }, [id]);

  const handleChatRequest = async () => {
    if (!user) return toast.error("Please sign in to chat");
    const { error } = await supabase.from("tenant_requests").insert({
      property_id: id,
      tenant_id: user.id,
      message: `User ${user.email} started a chat for ${p.title}`,
      status: "pending"
    });
    if (error) toast.error("Failed to send request");
    else toast.success("Chat request sent!");
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!p) return <div className="h-screen flex items-center justify-center font-black uppercase">Unit Not Found</div>;

  const imgs = p.images && p.images.length > 0 ? p.images : [p.image_url || ""];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-xl transition-colors"><ArrowLeft className="w-5 h-5"/></button>
        <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">{p.title}</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => toast.success("Saved")}><Heart className="w-5 h-5"/></button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}><Share2 className="w-5 h-5"/></button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[80px,1fr,400px] gap-8 items-start mb-20">
          <div className="flex flex-row md:flex-col gap-3 overflow-x-auto scrollbar-hide">
            {imgs.map((img: string, i: number) => (
              <button key={i} onClick={() => { setActiveImg(i); setShowVR(false); }} className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${i === activeImg && !showVR ? "border-primary scale-105" : "border-transparent opacity-40"}`}>
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="relative aspect-square bg-black rounded-[2.5rem] overflow-hidden border border-border shadow-2xl">
            <AnimatePresence mode="wait">
              {showVR ? (
                <motion.div key="vr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
                  <iframe src={p.vr_url} className="w-full h-full border-none" allowFullScreen />
                  <button onClick={() => setShowVR(false)} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md"><X className="w-5 h-5" /></button>
                </motion.div>
              ) : (
                <motion.img key={activeImg} src={imgs[activeImg]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full object-cover" />
              )}
            </AnimatePresence>
            {!showVR && <div className="absolute top-6 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-2xl text-xs font-black shadow-xl">₹{p.rent.toLocaleString()}</div>}
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">{p.title}</h1>
                  <div className="flex items-center gap-1 text-orange-500 font-bold text-xs"><Star className="w-3.5 h-3.5 fill-current"/>{p.rating || 0}</div>
                </div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary"/>{p.address}</p>
            </div>

            {p.has_vr && p.vr_url ? (
              <button onClick={() => setShowVR(true)} className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all ${showVR ? "bg-secondary" : "bg-primary text-primary-foreground hover:scale-[1.02]"}`}>
                <Sparkles className="w-5 h-5" /> {showVR ? "Viewing AI VR" : "Launch AI 3D VR Tour"}
              </button>
            ) : <div className="w-full py-5 text-center text-[10px] font-black uppercase bg-secondary text-muted-foreground rounded-2xl">AI VR Processing...</div>}

            <div className="grid grid-cols-3 gap-3">
              {[{i:Bed, v:p.bedrooms, l:"Beds"}, {i:Bath, v:p.bathrooms, l:"Baths"}, {i:Maximize, v:p.sqft, l:"SqFt"}].map((s, idx) => (
                <div key={idx} className="bg-card border border-border p-4 rounded-2xl text-center">
                  <s.i className="w-4 h-4 mx-auto mb-2 text-primary opacity-60"/><p className="text-sm font-black">{s.v}</p><p className="text-[9px] text-muted-foreground uppercase font-bold">{s.l}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => window.open(`tel:${p.phone}`)} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest"><Phone className="w-4 h-4"/> Call</button>
                <button onClick={handleChatRequest} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-secondary font-black text-[10px] uppercase tracking-widest"><MessageCircle className="w-4 h-4"/> Chat Now</button>
                <button className="col-span-2 flex items-center justify-center gap-2 py-4 rounded-2xl bg-secondary font-black text-[10px] uppercase tracking-widest"><CalendarDays className="w-4 h-4"/> Schedule Visit</button>
            </div>
            <RatingSection propertyId={id!} />
          </div>
        </div>

        {/* RECOMMENDATION SECTION */}
        <RecommendedSection currentProperty={p} />
      </main>
    </div>
  );
};

export default PropertyDetail;