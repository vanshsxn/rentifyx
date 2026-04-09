import { useParams, useNavigate, Link } from "react-router-dom";import { useState, useEffect } from "react";import { supabase } from "@/integrations/supabase/client";import { useAuth } from "@/contexts/AuthContext";import {ArrowLeft, Star, MapPin, Bed, Bath, Maximize,Phone, MessageCircle, CalendarDays, Share2,Heart, Sparkles, Building2, Loader2, X, ArrowRight, CheckCircle2} from "lucide-react";import { motion, AnimatePresence } from "framer-motion";import { toast } from "sonner";
const RecommendedSection = ({ currentProperty }: { currentProperty: any }) => {const [recommendations, setRecommendations] = useState<any[]>([]);
  useEffect(() => {const fetchRecs = async () => {const { data } = await supabase.from("properties").select("*").neq("id", currentProperty.id).limit(4);
      if (data) setRecommendations(data.filter(d =>d.area === currentProperty.area ||(d.rent >= currentProperty.rent - 5000 && d.rent <= currentProperty.rent + 5000)).slice(0, 4));};fetchRecs();}, [currentProperty]);
  if (recommendations.length === 0) return null;
  return (
    <section className="mt-20 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Similar Properties
        </h2>
        <Link to="/properties" className="text-[10px] font-black uppercase text-primary flex items-center gap-1 hover:underline">
          View All <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((item) => (
          <Link key={item.id} to={`/property/${item.id}`} className="group bg-card border border-border rounded-3xl overflow-hidden hover:shadow-xl transition-all">
            <div className="aspect-[4/3] overflow-hidden">
              <img src={item.image_url || "/placeholder.svg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-4 space-y-1">
              <h3 className="text-[11px] font-black uppercase truncate">{item.title}</h3>
              <p className="text-[9px] font-bold text-muted-foreground uppercase">{item.area}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-black text-primary">₹{item.rent.toLocaleString()}</span>
                <div className="flex items-center gap-1 text-[10px] font-bold">
                  <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                  {item.rating || 0}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>);};
const RatingSection = ({ propertyId, adminRating }: { propertyId: string; adminRating: number | null }) => {const { user } = useAuth();const [userRating, setUserRating] = useState(0);const [hover, setHover] = useState(0);const [comment, setComment] = useState("");const [isSubmitting, setIsSubmitting] = useState(false);const [avgTenantRating, setAvgTenantRating] = useState<number | null>(null);const [totalReviews, setTotalReviews] = useState(0);useEffect(() => {const fetchRatings = async () => {const { data } = await supabase.from("property_ratings").select("rating").eq("property_id", propertyId);if (data && data.length > 0) {const avg = data.reduce((s, r) => s + Number(r.rating), 0) / data.length;setAvgTenantRating(avg);setTotalReviews(data.length);}};fetchRatings();}, [propertyId]);
  const submitRating = async () => {if (!user) return toast.error("Sign in to leave a review");if (userRating === 0) return toast.error("Please select a star rating");setIsSubmitting(true);const { error } = await supabase.from("property_ratings").upsert({property_id: propertyId,user_id: user.id,rating: userRating,comment: comment,});
    if (error) toast.error("Rating failed: " + error.message);else {toast.success("Feedback submitted!");setComment("");const { data } = await supabase.from("property_ratings").select("rating").eq("property_id", propertyId);if (data && data.length > 0) {setAvgTenantRating(data.reduce((s, r) => s + Number(r.rating), 0) / data.length);setTotalReviews(data.length);}}setIsSubmitting(false);};
  const displayedRating = adminRating && avgTenantRating? ((adminRating + avgTenantRating) / 2).toFixed(1): avgTenantRating ? avgTenantRating.toFixed(1): adminRating ? adminRating.toFixed(1): "—";
  return (
    <div className="mt-10 space-y-4">
      <div className="p-4 bg-secondary/50 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Community Rating</p>
          <div className="flex items-center gap-2 mt-1">
            <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
            <span className="text-2xl font-black">{displayedRating}</span>
            <span className="text-[9px] text-muted-foreground font-bold">({totalReviews} reviews)</span>
          </div>
        </div>
        {adminRating && (
          <div className="text-right">
            <p className="text-[8px] font-black uppercase text-muted-foreground">Admin Score</p>
            <p className="text-sm font-black text-primary">{adminRating.toFixed(1)}</p>
          </div>
        )}
      </div>
      <div className="p-6 bg-card border border-border rounded-[2rem] shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" /> Rate this Property
        </h3>
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} onClick={() => setUserRating(star)}>
              <Star className={`w-8 h-8 transition-colors ${star <= (hover || userRating) ? "fill-orange-500 text-orange-500" : "text-muted-foreground opacity-30"}`} />
            </button>
          ))}
        </div>
        <textarea
          placeholder="Share your experience... (Optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-4 rounded-2xl bg-background border border-border text-xs min-h-[80px] mb-4 focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button onClick={submitRating} disabled={isSubmitting} className="w-full py-4 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 disabled:opacity-50">
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>);};
const PropertyDetail = () => {const { id } = useParams<{ id: string }>();const navigate = useNavigate();const { user } = useAuth();const [p, setP] = useState<any>(null);const [loading, setLoading] = useState(true);const [activeImg, setActiveImg] = useState(0);const [showVR, setShowVR] = useState(false);const [hasRequested, setHasRequested] = useState(false);const [isFavorite, setIsFavorite] = useState(false);const [requestLoading, setRequestLoading] = useState(false);useEffect(() => {const getData = async () => {if (!id) return;
      const { data } = await supabase.from("properties").select("*").eq("id", id).single();if (data) {setP(data);if (user) {const [{ data: existingReq }, { data: fav }] = await Promise.all([supabase.from("tenant_requests").select("id").eq("property_id", id).eq("tenant_id", user.id).maybeSingle(),supabase.from("favorites").select("id").eq("property_id", id).eq("user_id", user.id).maybeSingle(),]);if (existingReq) setHasRequested(true);if (fav) setIsFavorite(true);}}setLoading(false);window.scrollTo(0, 0);};getData();}, [id, user]);
  const toggleWishlist = async () => {if (!user) return toast.error("Please login to save favorites");if (isFavorite) {await supabase.from("favorites").delete().eq("property_id", id).eq("user_id", user.id);setIsFavorite(false);toast.success("Removed from Wishlist");} else {await supabase.from("favorites").insert({ property_id: id!, user_id: user.id });setIsFavorite(true);toast.success("Added to Wishlist");}};
  const handleChatRequest = async () => {if (!user) return toast.error("Please sign in to contact the landlord");if (hasRequested) return toast.info("Request already pending");setRequestLoading(true);
    const { error } = await supabase.from("tenant_requests").insert({property_id: id!,tenant_id: user.id,message: `Hi, I am interested in ${p.title}. Let's chat!`,status: "pending",urgent: false,});
    if (error) toast.error("Failed to send request");else {setHasRequested(true);toast.success("Request sent to Landlord!");}setRequestLoading(false);};
  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;if (!p) return <div className="h-screen flex items-center justify-center font-black uppercase">Unit Not Found</div>; const displayImages = p.images && p.images.length > 0 ? p.images : [p.image_url || "/placeholder.svg"];
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50 px-4 md:px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-xl transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">{p.title}</span>
        </div>
        <div className="flex gap-4">
          <button onClick={toggleWishlist}>
            <Heart className={`w-5 h-5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "hover:text-red-500"}`} />
          </button>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }}><Share2 className="w-5 h-5" /></button>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-[80px,1fr,400px] gap-6 md:gap-8 items-start mb-20">

          <div className="flex flex-row md:flex-col gap-3 overflow-x-auto scrollbar-hide py-2">
            {displayImages.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => { setActiveImg(i); setShowVR(false); }}
                className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all
                  ${i === activeImg && !showVR ? "border-primary scale-105 shadow-md" : "border-transparent opacity-40 hover:opacity-100"}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`View ${i}`} />
              </button>
            ))}
          </div>

          <div className="relative aspect-square bg-black rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-border shadow-2xl">
            <AnimatePresence mode="wait">
              {showVR ? (
                <motion.div key="vr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
                  <iframe src={p.vr_url} className="w-full h-full border-none" allowFullScreen />
                  <button onClick={() => setShowVR(false)} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md shadow-lg"><X className="w-5 h-5" /></button>
                </motion.div>
              ) : (
                <motion.img
                  key={activeImg}
                  src={displayImages[activeImg]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full object-cover"
                  alt={p.title}
                />
              )}
            </AnimatePresence>
            {!showVR && (
              <div className="absolute top-6 right-6 bg-primary text-primary-foreground px-4 py-2 rounded-2xl text-xs font-black shadow-xl">
                ₹{p.rent.toLocaleString()}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">{p.title}</h1>
                <div className="flex items-center gap-1 text-orange-500 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {p.rating || 0}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />{p.address}
              </p>
            </div>

            {p.has_vr && p.vr_url ? (
              <button
                onClick={() => setShowVR(true)}
                className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all
                  ${showVR ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground hover:scale-[1.02] active:scale-95"}`}
              >
                <Sparkles className="w-5 h-5" /> {showVR ? "Viewing AI VR" : "Launch AI 3D VR Tour"}
              </button>
            ) : (
              <div className="w-full py-5 text-center text-[10px] font-black uppercase bg-secondary text-muted-foreground rounded-2xl">
                Contact Admin for VR Creation
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              {[
                { i: Bed, v: p.bedrooms, l: "Beds" },
                { i: Bath, v: p.bathrooms, l: "Baths" },
                { i: Maximize, v: p.sqft, l: "SqFt" },
              ].map((s, idx) => (
                <div key={idx} className="bg-card border border-border p-4 rounded-2xl text-center shadow-sm">
                  <s.i className="w-4 h-4 mx-auto mb-2 text-primary opacity-60" />
                  <p className="text-sm font-black">{s.v || "N/A"}</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">{s.l}</p>
                </div>
              ))}
            </div>

            {/* --- AMENITIES & TAGS SECTION --- */}
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" /> Features & Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const allAmenities = Array.from(new Set([
                    ...(p.tags || []),
                    ...(p.features || [])
                  ])).filter(t => t && String(t).trim() !== "");

                  if (allAmenities.length === 0) {
                    return <p className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">Basic Utilities Included</p>;
                  }

                  return allAmenities.map((amenity) => (
                    <div 
                      key={amenity}
                      className="bg-secondary/40 border border-border/40 px-4 py-2 rounded-xl flex items-center gap-2 group hover:border-primary/30 transition-colors"
                    >
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <span className="text-[10px] font-black uppercase tracking-tight text-foreground">
                        {amenity}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => window.open(`tel:${p.phone}`)} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background font-black text-[10px] uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all">
                <Phone className="w-4 h-4" /> Call
              </button>
              <button
                onClick={handleChatRequest}
                disabled={requestLoading || hasRequested}
                className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95
                ${hasRequested ? "bg-green-500/10 text-green-500" : "bg-secondary hover:bg-secondary/80"}`}
              >
                {requestLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : hasRequested ? <CheckCircle2 className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                {hasRequested ? "Request Sent" : "Chat Now"}
              </button>
              <button className="col-span-2 flex items-center justify-center gap-2 py-4 rounded-2xl bg-secondary font-black text-[10px] uppercase tracking-widest hover:bg-secondary/80 active:scale-95 transition-all">
                <CalendarDays className="w-4 h-4" /> Schedule Visit
              </button>
            </div>

            <RatingSection propertyId={id!} adminRating={p.admin_rating} />
          </div>
        </div>

        <RecommendedSection currentProperty={p} />
      </main>
    </div>);};export default PropertyDetail;