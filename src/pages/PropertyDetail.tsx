import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { properties } from "@/data/mockData";
import { ArrowLeft, Star, MapPin, Bed, Bath, Maximize, Phone, MessageCircle, CalendarDays, Flag, Share2, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const galleryImages = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
];

// Demo properties from Landing page with their own VR links
const demoVRLinks: Record<string, string> = {
  demo1: "https://planner5d.onelink.me/stDT/b877t36o",
};

const defaultVR = "https://planner5d.onelink.me/stDT/6erw1eh0";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [showVR, setShowVR] = useState(false);
  const [vrLoaded, setVrLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Merge demo properties from landing with mockData properties
  const demoProperties = [
    {
      id: "demo1", title: "Vansh's PG", address: "Indira Nagar, Near Metro", area: "Indira Nagar",
      rent: 8500, rating: 4.8, image: "https://i.pinimg.com/736x/20/ae/95/20ae95fbe2c97934e0d3a733b150a403.jpg",
      bedrooms: 1, bathrooms: 1, sqft: 350, features: ["Wi-Fi", "Food"], landlordId: "l1", distance: "5 min walk", listed: "2 days ago",
    },
    {
      id: "demo2", title: "HAHA PG RENT", address: "Gomti Nagar, Fully Furnished", area: "Gomti Nagar",
      rent: 1000, rating: 4.5, image: "https://th.bing.com/th/id/OIP.LHgJIlJhOTi0PDPo1VhAyQHaFj?o=7&cb=defcache2&rm=3&defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3",
      bedrooms: 1, bathrooms: 1, sqft: 300, features: ["AC", "Parking"], landlordId: "l2", distance: "3 min walk", listed: "1 week ago",
    },
    {
      id: "demo3", title: "Anshuman's homes", address: "Hazratganj, Shared Room", area: "Hazratganj",
      rent: 6000, rating: 4.2, image: "https://tse1.mm.bing.net/th/id/OIP.ewl35_kvZqZzn5ttlL0qWQHaFj?cb=defcache2&defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3",
      bedrooms: 1, bathrooms: 1, sqft: 280, features: ["Cleaning"], landlordId: "l3", distance: "7 min walk", listed: "3 days ago",
    },
  ];

  const allProperties = [...properties, ...demoProperties];
  const property = allProperties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Property not found</p>
          <button onClick={() => navigate("/")} className="text-primary text-sm font-medium hover:underline">Go Home</button>
        </div>
      </div>
    );
  }

  const images = [property.image, ...galleryImages.filter((img) => img !== property.image).slice(0, 3)];
  const vrUrl = demoVRLinks[property.id] || defaultVR;

  const handleShare = async () => {
    try {
      await navigator.share({ title: property.title, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-sm font-semibold text-foreground truncate mx-4">{property.title}</h1>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => { setIsFavorite(!isFavorite); toast.success(isFavorite ? "Removed from favorites" : "Added to favorites"); }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Image Gallery / VR */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-2xl overflow-hidden">
          {showVR ? (
            <div className="w-full aspect-video bg-secondary relative">
              {!vrLoaded && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-secondary">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground font-medium">VR is loading, please wait...</p>
                  </div>
                </div>
              )}
              <iframe
                src={vrUrl}
                className="w-full h-full border-none"
                allow="xr-spatial-tracking; fullscreen"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                allowFullScreen
                title="VR Property View"
                onLoad={() => setVrLoaded(true)}
                loading="lazy"
              />
              {/* Hide Planner5D branding overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-background pointer-events-none" />
            </div>
          ) : (
            <img src={images[activeImg]} alt={property.title} className="w-full aspect-video object-cover" />
          )}
          <button
            onClick={() => { setShowVR(!showVR); if (!showVR) setVrLoaded(false); }}
            className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm text-xs font-semibold text-foreground shadow-sm hover:bg-card transition-colors"
          >
            <Maximize className="w-3.5 h-3.5 text-primary" />
            {showVR ? "Photos" : "Try VR"}
          </button>
        </motion.div>

        {/* Thumbnails */}
        {!showVR && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                  i === activeImg ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        {/* Title + Price */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{property.title}</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {property.address}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ₹{property.rent.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </span>
            <span className="flex items-center gap-1 text-sm text-warning font-medium">
              <Star className="w-4 h-4 fill-current" /> {property.rating}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Bed, label: "Bedrooms", value: property.bedrooms },
            { icon: Bath, label: "Bathrooms", value: property.bathrooms },
            { icon: Maximize, label: "Sq Ft", value: property.sqft },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-secondary rounded-xl p-4 text-center">
              <Icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-semibold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Features</h4>
          <div className="flex flex-wrap gap-2">
            {property.features.map((f) => (
              <span key={f} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-muted-foreground">{f}</span>
            ))}
          </div>
        </div>

        {/* Map */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Location</h4>
          <div className="bg-secondary rounded-xl h-44 flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center">
              <MapPin className="w-6 h-6 mx-auto mb-1 opacity-40" />
              <p>Map — {property.distance} from station</p>
              <p className="text-xs mt-1 opacity-60">{property.address}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => toast.info("Calling landlord...")}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity active:scale-[0.97]"
          >
            <Phone className="w-4 h-4" /> Call
          </button>
          <button
            onClick={() => toast.info("Opening chat...")}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-accent transition-colors active:scale-[0.97]"
          >
            <MessageCircle className="w-4 h-4" /> Message
          </button>
          <button
            onClick={() => toast.info("Scheduling visit...")}
            className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-secondary text-foreground text-xs font-semibold hover:bg-accent transition-colors active:scale-[0.97]"
          >
            <CalendarDays className="w-4 h-4" /> Schedule
          </button>
        </div>

        <button
          onClick={() => toast.info("Report submitted. Thank you!")}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
        >
          <Flag className="w-4 h-4" /> Report this listing
        </button>
      </div>
    </div>
  );
};

export default PropertyDetail;
