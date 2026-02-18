import { Property } from "@/data/mockData";
import { Star, MapPin, Bed, Bath } from "lucide-react";

interface PropertyCardProps {
  property: Property;
  isCompare?: boolean;
  onCompareToggle?: (id: string) => void;
  onInterest?: (property: Property) => void;
  compareDisabled?: boolean;
}

const PropertyCard = ({ property, isCompare, onCompareToggle, onInterest, compareDisabled }: PropertyCardProps) => {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden transition-all duration-300 hover:card-shadow-hover card-shadow group">
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-foreground text-xs font-semibold px-2.5 py-1 rounded-md">
          {property.listed}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground leading-tight">{property.title}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" /> {property.address}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">¥{property.rent.toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
          <span className="flex items-center gap-1 text-sm text-warning">
            <Star className="w-3.5 h-3.5 fill-current" /> {property.rating}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {property.bedrooms}B</span>
          <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {property.bathrooms}Ba</span>
          <span>{property.sqft} sqft</span>
          <span className="ml-auto">{property.distance}</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {onCompareToggle && (
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={isCompare}
                disabled={compareDisabled && !isCompare}
                onChange={() => onCompareToggle(property.id)}
                className="rounded border-border accent-primary w-3.5 h-3.5"
              />
              Compare
            </label>
          )}
          {onInterest && (
            <button
              onClick={() => onInterest(property)}
              className="ml-auto text-xs font-medium text-primary hover:underline"
            >
              Interested →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
