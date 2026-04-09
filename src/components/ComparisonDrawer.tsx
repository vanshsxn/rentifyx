import { X, Star, MapPin, Bed, Bath, Maximize, IndianRupee, Trophy, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ComparisonProperty {
  id: string;
  title: string;
  area: string;
  address?: string;
  rent: number;
  rating: number | null;
  image_url?: string | null;
  image?: string;
  distance?: string;
  sqft?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  features?: string[];
  tags?: string[];
}

interface ComparisonDrawerProps {
  properties: ComparisonProperty[];
  onClose: () => void;
}

const ComparisonDrawer = ({ properties, onClose }: ComparisonDrawerProps) => {
  if (properties.length < 2) return null;
  const [a, b] = properties;

  const getWinner = (valA: number, valB: number, lowerBetter = false) => {
    if (valA === valB) return "tie";
    return lowerBetter ? (valA < valB ? "a" : "b") : (valA > valB ? "a" : "b");
  };

  const rows: { label: string; icon: any; valA: string; valB: string; winner: string }[] = [
    { label: "Monthly Rent", icon: IndianRupee, valA: `₹${a.rent.toLocaleString()}`, valB: `₹${b.rent.toLocaleString()}`, winner: getWinner(a.rent, b.rent, true) },
    { label: "Rating", icon: Star, valA: `${a.rating || 0}`, valB: `${b.rating || 0}`, winner: getWinner(a.rating || 0, b.rating || 0) },
    { label: "Size", icon: Maximize, valA: `${a.sqft || "N/A"} sqft`, valB: `${b.sqft || "N/A"} sqft`, winner: getWinner(a.sqft || 0, b.sqft || 0) },
    { label: "Bedrooms", icon: Bed, valA: `${a.bedrooms || 0}`, valB: `${b.bedrooms || 0}`, winner: getWinner(a.bedrooms || 0, b.bedrooms || 0) },
    { label: "Bathrooms", icon: Bath, valA: `${a.bathrooms || 0}`, valB: `${b.bathrooms || 0}`, winner: getWinner(a.bathrooms || 0, b.bathrooms || 0) },
  ];

  const aScore = rows.filter(r => r.winner === "a").length;
  const bScore = rows.filter(r => r.winner === "b").length;
  const overallWinner = aScore > bScore ? "a" : bScore > aScore ? "b" : "tie";

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t-2 border-primary/20 rounded-t-[2.5rem] shadow-2xl max-h-[75vh] overflow-y-auto"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* Handle bar */}
        <div className="w-12 h-1 bg-border rounded-full mx-auto mb-6" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight">Property Duel</h3>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Side-by-side comparison</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-secondary hover:bg-destructive/10 hover:text-destructive transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Property Cards Header */}
        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 mb-6">
          {[a, b].map((p, idx) => (
            <motion.div 
              key={p.id} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-2xl overflow-hidden border-2 transition-colors ${
                overallWinner === (idx === 0 ? "a" : "b") ? "border-primary shadow-lg shadow-primary/10" : "border-border"
              }`}
              style={{ order: idx === 0 ? 0 : 2 }}
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img src={p.image_url || p.image || "/placeholder.svg"} alt={p.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 space-y-1.5">
                <h4 className="text-sm font-black uppercase truncate">{p.title}</h4>
                <p className="text-[9px] text-muted-foreground font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-primary" /> {p.area}
                </p>
              </div>
              {overallWinner === (idx === 0 ? "a" : "b") && (
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-xl flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase">Winner</span>
                </div>
              )}
            </motion.div>
          ))}
          <div className="flex items-center justify-center" style={{ order: 1 }}>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">VS</div>
          </div>
        </div>

        {/* Comparison Rows */}
        <div className="space-y-2">
          {rows.map((row, idx) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="grid grid-cols-3 items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors"
            >
              <div className={`text-center font-black text-sm ${row.winner === "a" ? "text-primary" : ""}`}>
                {row.winner === "a" && <span className="text-[8px] block text-primary mb-0.5">★</span>}
                {row.valA}
              </div>
              <div className="flex items-center justify-center gap-2">
                <row.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{row.label}</span>
              </div>
              <div className={`text-center font-black text-sm ${row.winner === "b" ? "text-primary" : ""}`}>
                {row.winner === "b" && <span className="text-[8px] block text-primary mb-0.5">★</span>}
                {row.valB}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features comparison */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {[a, b].map((p) => (
            <div key={p.id} className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">Amenities</p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {[...(p.features || []), ...(p.tags || [])].filter(Boolean).map((f) => (
                  <span key={f} className="px-2.5 py-1 bg-secondary rounded-lg text-[8px] font-bold uppercase border border-border">
                    {f}
                  </span>
                ))}
                {[...(p.features || []), ...(p.tags || [])].filter(Boolean).length === 0 && (
                  <span className="text-[9px] text-muted-foreground italic">None listed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ComparisonDrawer;
