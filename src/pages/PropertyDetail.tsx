import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowLeft, Star, MapPin, Bed, Bath, Maximize, Phone, MessageCircle,
  Share2, Heart, Flag, Calendar, ExternalLink
} from "lucide-react";
import { properties } from "@/data/mockData";
import { toast } from "sonner";

const galleryImages = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
];

// Also include demo properties from landing for matching
const demoProperties = [
  {
    id: "demo1",
    title: "Vansh's PG",
    address: "Indira Nagar, Near Metro",
    area: "Indira Nagar",
    rent: 8500,
    rating: 4.8,
    image: "https://i.pinimg.com/736x/20/ae/95/20ae95fbe2c97934e0d3a733b150a403.jpg",
    bedrooms: 1,
    bathrooms: 1,
    sqft: 350,
    features: ["Wi-Fi", "Food", "Laundry", "24/7 Security"],
    landlordId: "l1",
    distance: "5 min walk",
    listed: "2 days ago",
  },
  {
    id: "demo2",
    title: "HAHA PG RENT",
    address: "Gomti Nagar, Fully Furnished",
    area: "Gomti Nagar",
    rent: 1000,
    rating: 4.5,
    image: "https://th.bing.com/th/id/OIP.LHgJIlJhOTi0PDPo1VhAyQHaFj?o=7&cb=defcache2&rm=3&defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3",
    bedrooms: 1,
    bathrooms: 1,
    sqft: 300,
    features: ["AC", "Parking", "Power Backup"],
    landlordId: "l2",
    distance: "3 min walk",
    listed: "1 week ago",
  },
  {
    id: "demo3",
    title: "Anshuman's homes",
    address: "Hazratganj, Shared Room",
    area: "Hazratganj",
    rent: 6000,
    rating: 4.2,
    image: "https://tse1.mm.bing.net/th/id/OIP.ewl35_kvZqZzn5ttlL0qWQHaFj?cb=defcache2&defcache=1&rs=1&pid=ImgDetMain&o=7&rm=3",
    bedrooms: 1,
    bathrooms: 1,
    sqft: 280,
    features: ["Cleaning", "Near Market"],
    landlordId: "l3",
    distance: "7 min walk",
    listed: "3 days ago",
  },
];

const allProperties = [...properties, ...demoProperties];

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);
  const [showVR, setShowVR] = useState(false);
  const [liked, setLiked] = useState(false);

  const property = allProperties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Property not found.</p>
          <button onClick={() => navigate(-1)} className="text-primary text-sm font-medium hover:underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const images = [property.image, ...galleryImages.filter((img) => img !== property.image).slice(0, 3)];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLiked(!liked);
                toast.success(liked ? "Removed from favorites" : "Added to favorites");
              }}
              className={`p-2 rounded-lg border border-border hover:bg-secondary transition-colors ${liked ? "text-red-500" : "text-muted-foreground"}`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard");
              }}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Image Gallery / VR */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden"
        >
          {showVR ? (
            <div className="w-full aspect-video bg-muted rounded-2xl overflow-hidden">
              <iframe
                src="https://planner5d.onelink.me/stDT/6erw1eh0"
                className="w-full h-full border-none"
                allow="fullscreen; accelerometer; gyroscope"
                allowFullScreen
                title="VR Property View"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            </div>
          ) : (
            <img
              src={images[activeImg]}
              alt={property.title}
              className="w-full aspect-video object-cover rounded-2xl"
            />
          )}

          <button
            onClick={() => setShowVR(!showVR)}
            className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-card/90 backdrop-blur-sm text-xs font-semibold text-foreground shadow-sm hover:bg-card transition-colors"
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
                className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeImg ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Property Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{property.title}</h1>
              <p className="flex items-center gap-1.5 text-muted-foreground text-sm mt-2">
                <MapPin className="w-4 h-4" /> {property.address}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <span className="text-2xl font-bold text-primary">
                  ¥{property.rent.toLocaleString()}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </span>
                <span className="flex items-center gap-1 text-sm text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-current" /> {property.rating}
                </span>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                  <Calendar className="w-3 h-3 inline mr-1" />{property.listed}
                </span>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Bed, label: "Bedrooms", value: property.bedrooms },
                { icon: Bath, label: "Bathrooms", value: property.bathrooms },
                { icon: Maximize, label: "Sq Ft", value: property.sqft },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
                  <Icon className="w-5 h-5 mx-auto text-primary mb-2" />
                  <p className="text-lg font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Features */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Features & Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.features.map((f) => (
                  <span key={f} className="text-xs px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground font-medium">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Location</h3>
              <div className="bg-card border border-border rounded-xl h-48 flex items-center justify-center text-muted-foreground text-sm">
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">{property.distance} from station</p>
                  <p className="text-xs mt-1 opacity-60">{property.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Contact Actions */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-5 space-y-4 sticky top-20"
            >
              <h3 className="font-semibold text-foreground">Contact Landlord</h3>
              <p className="text-xs text-muted-foreground">
                Get in touch to schedule a visit or ask questions about this property.
              </p>

              <button
                onClick={() => toast.success("Calling landlord...", { description: "Connecting you now." })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
              >
                <Phone className="w-4 h-4" /> Call Now
              </button>

              <button
                onClick={() => toast.success("Opening chat...", { description: "Message sent to landlord." })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-semibold transition-colors hover:bg-secondary/80 active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4" /> Send Message
              </button>

              <button
                onClick={() => toast.success("Visit request sent!", { description: "The landlord will confirm shortly." })}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-foreground text-sm font-semibold transition-colors hover:bg-secondary active:scale-[0.98]"
              >
                <Calendar className="w-4 h-4" /> Schedule Visit
              </button>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => toast.info("Property reported", { description: "Our team will review this listing." })}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
                <button
                  onClick={() => setShowVR(true)}
                  className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Virtual Tour
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-12">
        <p className="text-xs text-muted-foreground text-center">© 2026 Made by MV Studios Japan.</p>
      </footer>
    </div>
  );
};

export default PropertyDetail;
