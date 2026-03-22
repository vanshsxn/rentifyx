import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, SlidersHorizontal } from "lucide-react";
import { properties, areas, priceRanges, Property } from "@/data/mockData";
import { motion } from "framer-motion";
const Properties = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialBudget = searchParams.get("budget") || "All";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState(initialBudget);
  const filterByPrice = (p: Property) => {
    if (selectedPrice === "All") return true;
    if (selectedPrice === "Under ₹5,000") return p.rent < 5000;
    if (selectedPrice === "₹5,000 - ₹8,000") return p.rent >= 5000 && p.rent <= 8000;
    if (selectedPrice === "₹8,000 - ₹15,000") return p.rent >= 8000 && p.rent <= 15000;
    if (selectedPrice === "Over ₹15,000") return p.rent > 15000;
    // fallback for Japanese yen ranges
    if (selectedPrice === "Under ¥80,000") return p.rent < 80000;
    if (selectedPrice === "¥80,000 - ¥150,000") return p.rent >= 80000 && p.rent <= 150000;
    if (selectedPrice === "¥150,000 - ¥250,000") return p.rent >= 150000 && p.rent <= 250000;
    if (selectedPrice === "Over ¥250,000") return p.rent > 250000;
    return true;
  };
  const filtered = properties.filter(
    (p) =>
      (selectedArea === "All" || p.area === selectedArea) &&
      filterByPrice(p) &&
      (searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Browse Properties</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, area, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {areas.map((a) => (
                <option key={a} value={a}>{a === "All" ? "All Areas" : a}</option>
              ))}
            </select>
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {priceRanges.map((p) => (
                <option key={p} value={p}>{p === "All" ? "All Prices" : p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <p className="text-sm text-muted-foreground mb-6">{filtered.length} properties found</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-card border border-border rounded-2xl overflow-hidden card-shadow group cursor-pointer"
              onClick={() => navigate(`/property/${p.id}`)}
            >
              <div className="relative h-48 overflow-hidden">
                <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute top-3 right-3 bg-card/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-primary shadow-sm">
                  ₹{p.rent.toLocaleString()}/mo
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-foreground">{p.title}</h3>
                <p className="text-xs text-muted-foreground">{p.address}</p>
                <div className="flex gap-2 pt-1">
                  {p.features.slice(0, 3).map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium">{f}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">No properties match your filters.</div>
        )}
      </div>
    </div>
  );
};
export default Properties;
