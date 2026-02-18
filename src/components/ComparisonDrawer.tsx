import { Property } from "@/data/mockData";
import { X, Star, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface ComparisonDrawerProps {
  properties: Property[];
  onClose: () => void;
}

const ComparisonDrawer = ({ properties, onClose }: ComparisonDrawerProps) => {
  if (properties.length < 2) return null;

  const [a, b] = properties;

  const rows: { label: string; valA: string; valB: string }[] = [
    { label: "Rent", valA: `¥${a.rent.toLocaleString()}`, valB: `¥${b.rent.toLocaleString()}` },
    { label: "Rating", valA: `${a.rating}`, valB: `${b.rating}` },
    { label: "Distance", valA: a.distance, valB: b.distance },
    { label: "Size", valA: `${a.sqft} sqft`, valB: `${b.sqft} sqft` },
    { label: "Bedrooms", valA: `${a.bedrooms}`, valB: `${b.bedrooms}` },
    { label: "Features", valA: a.features.join(", "), valB: b.features.join(", ") },
  ];

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl shadow-elevated max-h-[60vh] overflow-y-auto"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Compare Properties</h3>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Header */}
          <div />
          {[a, b].map((p) => (
            <div key={p.id} className="text-center space-y-2">
              <img src={p.image} alt={p.title} className="w-full h-24 object-cover rounded-lg" />
              <p className="text-sm font-semibold text-foreground">{p.title}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" /> {p.area}
              </p>
            </div>
          ))}

          {/* Rows */}
          {rows.map((row) => (
            <>
              <div key={row.label} className="text-sm font-medium text-muted-foreground py-2 border-t border-border">
                {row.label}
              </div>
              <div className="text-sm text-foreground py-2 border-t border-border text-center">{row.valA}</div>
              <div className="text-sm text-foreground py-2 border-t border-border text-center">{row.valB}</div>
            </>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ComparisonDrawer;
