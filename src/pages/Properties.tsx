import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Star, MapPin, Bed, Bath, Maximize } from "lucide-react";
import { properties, areas, priceRanges, Property } from "@/data/mockData";

const Properties = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");

  const filterByPrice = (p: Property) => {
    if (selectedPrice === "All") return true;
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
        p.area.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-lg font-bold text-foreground">Browse Properties</h1>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or area..."
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

        <p className="text-sm text-muted-foreground">{filtered.length} properties found</p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-card border border-border rounded-2xl overflow-hidden card-shadow group cursor-pointer"
              onClick={() => navigate(`/property/${p.id}`)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 bg-card/90 backdrop-blur px-2.5 py-1 rounded-md text-xs font-bold text-primary shadow-sm">
                  ¥{p.rent.toLocaleString()}/mo
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-foreground">{p.title}</h3>
                  <div className="flex items-center gap-1 text-warning text-sm font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {p.rating}
                  </div>
                </div>
                <p className="flex items-center gap-1 text-muted-foreground text-xs">
                  <MapPin className="w-3 h-3" /> {p.address}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {p.bedrooms}</span>
                  <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {p.bathrooms}</span>
                  <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" /> {p.sqft} sqft</span>
                </div>
                <div className="flex gap-2 pt-1">
                  {p.features.slice(0, 3).map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-medium">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground text-sm">
            No properties match your filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
