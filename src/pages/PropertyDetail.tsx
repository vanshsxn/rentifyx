import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft, Star, MapPin, Bed, Bath, Maximize,
  Phone, MessageCircle, CalendarDays, Share2,
  Heart, Sparkles, Building2, X, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import CubeLoader from "@/components/CubeLoader";

const RecommendedSection = ({ currentProperty }: { currentProperty: any }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecs = async () => {
      const { data } = await supabase.from("properties").select("*").neq("id", currentProperty.id).limit(4);
      if (data) setRecommendations(data.filter(d =>
        d.area === currentProperty.area ||
        (d.rent >= currentProperty.rent - 5000 && d.rent <= currentProperty.rent + 5000)
      ).slice(0, 4));
    };
    fetchRecs();
  }, [currentProperty]);

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
    </section>
  );
};

const RatingSection = ({ propertyId, adminRating }: { propertyId: string; adminRating: number | null }) => {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avgTenantRating, setAvgTenantRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [existingComment, setExistingComment] = useState("");

  useEffect(() => {
    const fetchRatings = async () => {
      const { data } = await supabase.from("property_ratings").select("rating, user_id, comment").eq("property_id", propertyId);
      if (data && data.length > 0) {
        const avg = data.reduce((s, r) => s + Number(r.rating), 0) / data.length;
        setAvgTenantRating(avg);
        setTotalReviews(data.length);
        // Check if current user already rated
        if (user) {
          const existing = data.find(r => r.user_id === user.id);
          if (existing) {
            setHasRated(true);
            setUserRating(Number(existing.rating));
            setExistingComment(existing.comment || "");
          }
        }
      }
    };
    fetchRatings();
  }, [propertyId, user]);

  const submitRating = async () => {
    if (!user) return toast.error("Sign in to leave a review");
    if (userRating === 0) return toast.error("Please select a star rating");
    if (hasRated) return toast.info("You've already rated this property");
    setIsSubmitting(true);
    const { error } = await supabase.from("property_ratings").insert({
      property_id: propertyId,
      user_id: user.id,
      rating: userRating,
      comment: comment,
    });
    if (error) {
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        toast.info("You've already rated this property");
        setHasRated(true);
      } else {
        toast.error("Rating failed: " + error.message);
      }
    } else {
      toast.success("Feedback submitted!");
      setHasRated(true);
      setExistingComment(comment);
      setComment("");
      const { data } = await supabase.from("property_ratings").select("rating").eq("property_id", propertyId);
      if (data && data.length > 0) {
        setAvgTenantRating(data.reduce((s, r) => s + Number(r.rating), 0) / data.length);
        setTotalReviews(data.length);
      }
    }
    setIsSubmitting(false);
  };

  const displayedRating = adminRating && avgTenantRating
    ? ((adminRating + avgTenantRating) / 2).toFixed(1)
    : avgTenantRating ? avgTenantRating.toFixed(1)
    : adminRating ? adminRating.toFixed(1)
    : "—";

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

      {hasRated ? (
        <div className="p-6 bg-card border border-border rounded-[2rem] shadow-sm text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-primary mx-auto" />
          <h3 className="text-sm font-black uppercase tracking-widest">You rated this</h3>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-6 h-6 ${star <= userRating ? "fill-orange-500 text-orange-500" : "text-muted-foreground opacity-30"}`} />
            ))}
          </div>
          {existingComment && <p className="text-xs text-muted-foreground italic">"{existingComment}"</p>}
        </div>
      ) : (
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
      )}
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
  const [hasRequested, setHasRequested] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    const getData = async () => {
      if (!id) return;
      const { data } = await supabase.from("properties").select("*").eq("id", id).single();
      if (data) {
        setP(data);
        if (user) {
          const [{ data: existingReq }, { data: fav }] = await Promise.all([
            supabase.from("tenant_requests").select("id").eq("property_id", id).eq("tenant_id", user.id).maybeSingle(),
            supabase.from("favorites").select("id").eq("property_id", id).eq("user_id", user.id).maybeSingle(),
          ]);
          if (existingReq) setHasRequested(true);
          if (fav) setIsFavorite(true);
        }
      }
      setLoading(false);
      window.scrollTo(0, 0);
    };
    getData();
  }, [id, user]);

  const toggleWishlist = async () => {
    if (!user) return toast.error("Please login to save favorites");
    if (isFavorite) {
      await supabase.from("favorites").delete().eq("property_id", id).eq("user_id", user.id);
      setIsFavorite(false);
      toast.success("Removed from Wishlist");
    } else {
      await supabase.from("favorites").insert({ property_id: id!, user_id: user.id });
      setIsFavorite(true);
      toast.success("Added to Wishlist");
    }
  };

  const handleChatRequest = async () => {
    if (!user) return toast.error("Please sign in to contact the landlord");
    if (hasRequested) return toast.info("Request already pending");
    setRequestLoading(true);
    const { error } = await supabase.from("tenant_requests").insert({
      property_id: id!,
      tenant_id: user.id,
      message: `Hi, I am interested in ${p.title}. Let's chat!`,
      status: "pending",
      urgent: false,
    });
    if (error) toast.error("Failed to send request");
    else { setHasRequested(true); toast.success("Request sent to Landlord!"); }
    setRequestLoading(false);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <CubeLoader />
    </div>
  );

  if (!p) return <div className="h-screen flex items-center justify-center font-black uppercase">Unit Not Found</div>;

  const displayImages = p.images && p.images.length > 0 ? p.images : [p.image_url || "/placeholder.svg"];

  const nextImg = () => setActiveImg(prev => (prev + 1) % displayImages.length);
  const prevImg = () => setActiveImg(prev => (prev - 1 + displayImages.length) % displayImages.length);

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

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
        {/* Myntra/Flipkart Style Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,380px] gap-6 md:gap-8 items-start mb-16">
          
          {/* Image Section - Myntra style */}
          <div className="space-y-3">
            {/* Main Image - Compact like Myntra */}
            <div className="relative aspect-[4/3] md:aspect-[16/10] bg-secondary rounded-2xl overflow-hidden border border-border group">
              <AnimatePresence mode="wait">
                {showVR ? (
                  <motion.div key="vr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative">
                    <iframe src={p.vr_url} className="w-full h-full border-none" allowFullScreen />
                    <button onClick={() => setShowVR(false)} className="absolute top-4 right-4 p-2 bg-foreground/60 hover:bg-foreground/80 text-background rounded-full backdrop-blur-md shadow-lg"><X className="w-5 h-5" /></button>
                  </motion.div>
                ) : (
                  <motion.img
                    key={activeImg}
                    src={displayImages[activeImg]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full object-cover"
                    alt={p.title}
                  />
                )}
              </AnimatePresence>

              {/* Navigation arrows */}
              {!showVR && displayImages.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Image counter badge */}
              {!showVR && (
                <div className="absolute bottom-3 right-3 bg-foreground/70 text-background backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold">
                  {activeImg + 1} / {displayImages.length}
                </div>
              )}

              {/* Price tag */}
              {!showVR && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-black shadow-lg">
                  ₹{p.rent.toLocaleString()}/mo
                </div>
              )}
            </div>

            {/* Thumbnail strip - horizontal like Myntra */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {displayImages.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => { setActiveImg(i); setShowVR(false); }}
                  className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all
                    ${i === activeImg && !showVR ? "border-primary shadow-md" : "border-border opacity-50 hover:opacity-100"}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`View ${i}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">{p.title}</h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />{p.address}
              </p>
            </div>

            {p.has_vr && p.vr_url ? (
              <button
                onClick={() => setShowVR(true)}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg transition-all
                  ${showVR ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground hover:scale-[1.02] active:scale-95"}`}
              >
                <Sparkles className="w-5 h-5" /> {showVR ? "Viewing AI VR" : "Launch 3D VR Tour"}
              </button>
            ) : (
              <div className="w-full py-4 text-center text-[10px] font-black uppercase bg-secondary text-muted-foreground rounded-2xl">
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

            {/* Amenities */}
            <div className="space-y-3 pt-4 border-t border-border/50">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-primary" /> Features & Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const allAmenities = Array.from(new Set([
                    ...(p.tags || []),
                    ...(p.features || [])
                  ])).filter((t: string) => t && String(t).trim() !== "");
                  if (allAmenities.length === 0) {
                    return <p className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest">Basic Utilities Included</p>;
                  }
                  return allAmenities.map((amenity: string) => (
                    <div key={amenity} className="bg-secondary/40 border border-border/40 px-3 py-1.5 rounded-xl flex items-center gap-2 group hover:border-primary/30 transition-colors">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      <span className="text-[10px] font-black uppercase tracking-tight">{amenity}</span>
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
                ${hasRequested ? "bg-primary/10 text-primary" : "bg-secondary hover:bg-secondary/80"}`}
              >
                {requestLoading ? <CubeLoader className="w-4 h-4" /> : hasRequested ? <CheckCircle2 className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
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
    </div>
  );
};

export default PropertyDetail;
