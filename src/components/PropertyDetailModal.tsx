import { Property } from "@/data/mockData";
import { X, Star, MapPin, Bed, Bath, Maximize, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PropertyDetailModalProps {
  property: Property | null;
  open: boolean;
  onClose: () => void;
  onInterest?: (property: Property) => void;
}

const galleryImages = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
];

const PropertyDetailModal = ({ property, open, onClose, onInterest }: PropertyDetailModalProps) => {
  const [activeImg, setActiveImg] = useState(0);
  const [showVR, setShowVR] = useState(false);

  if (!property) return null;

  const images = [property.image, ...galleryImages.filter((img) => img !== property.image).slice(0, 3)];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="relative">
          {/* Main Image / VR View */}
          {showVR ? (
            <div className="w-full aspect-video bg-foreground/5">
              <iframe
                src="https://planner5d.onelink.me/stDT/6erw1eh0"
                className="w-full h-full border-none"
                allowFullScreen
                title="VR Property View"
              />
            </div>
          ) : (
            <img
              src={images[activeImg]}
              alt={property.title}
              className="w-full aspect-video object-cover"
            />
          )}

          {/* VR Toggle */}
          <button
            onClick={() => setShowVR(!showVR)}
            className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm text-xs font-semibold text-foreground shadow-sm hover:bg-card transition-colors"
          >
            <Maximize className="w-3.5 h-3.5 text-primary" />
            {showVR ? "Photos" : "Try VR"}
          </button>
        </div>

        {/* Thumbnail Strip */}
        {!showVR && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-colors ${
                  i === activeImg ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-5 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">{property.title}</DialogTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5" /> {property.address}
            </p>
          </DialogHeader>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ¥{property.rent.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </span>
            <span className="flex items-center gap-1 text-sm text-warning font-medium">
              <Star className="w-4 h-4 fill-current" /> {property.rating}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary rounded-lg p-3 text-center">
              <Bed className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-semibold text-foreground">{property.bedrooms}</p>
              <p className="text-xs text-muted-foreground">Bedrooms</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <Bath className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-semibold text-foreground">{property.bathrooms}</p>
              <p className="text-xs text-muted-foreground">Bathrooms</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <Maximize className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-semibold text-foreground">{property.sqft}</p>
              <p className="text-xs text-muted-foreground">Sq Ft</p>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Features</h4>
            <div className="flex flex-wrap gap-2">
              {property.features.map((f) => (
                <span key={f} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-muted-foreground">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Map Placeholder */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Location</h4>
            <div className="bg-secondary rounded-lg h-40 flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center">
                <MapPin className="w-6 h-6 mx-auto mb-1 opacity-40" />
                <p>Map — {property.distance} from station</p>
                <p className="text-xs mt-1 opacity-60">{property.address}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {onInterest && (
              <button
                onClick={() => onInterest(property)}
                className="flex-1 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]"
              >
                I'm Interested →
              </button>
            )}
            <button
              onClick={() => setShowVR(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors active:scale-[0.98]"
            >
              <Maximize className="w-4 h-4 text-primary" /> Try VR
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailModal;
