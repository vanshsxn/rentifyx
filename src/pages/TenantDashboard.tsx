import { useState } from "react";
import { Search } from "lucide-react";
import { properties, areas, priceRanges, Property } from "@/data/mockData";
import PropertyCard from "@/components/PropertyCard";
import ComparisonDrawer from "@/components/ComparisonDrawer";
import BudgetAnalyzer from "@/components/BudgetAnalyzer";
import SlideToRequest from "@/components/SlideToRequest";
import PropertyDetailModal from "@/components/PropertyDetailModal";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
const TenantDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);
  const [urgent, setUrgent] = useState(false);
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
      (searchQuery === "" || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.area.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const compareProperties = properties.filter((p) => compareIds.includes(p.id));

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev));
  };

  const handleInterestFromDetail = (property: Property) => {
    setDetailProperty(null);
    setTimeout(() => setSelectedProperty(property), 200);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Find Your Home</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse properties and find the perfect fit.</p>
      </div>

      {/* Search & Filters */}
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
        <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
          {areas.map((a) => <option key={a} value={a}>{a === "All" ? "All Areas" : a}</option>)}
        </select>
        <select value={selectedPrice} onChange={(e) => setSelectedPrice(e.target.value)} className="px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20">
          {priceRanges.map((p) => <option key={p} value={p}>{p === "All" ? "All Prices" : p}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              isCompare={compareIds.includes(p.id)}
              onCompareToggle={toggleCompare}
              onInterest={setSelectedProperty}
              onViewDetail={setDetailProperty}
              compareDisabled={compareIds.length >= 2}
            />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
              No properties match your filters.
            </div>
          )}
        </div>
        <div className="space-y-4">
          <BudgetAnalyzer />
        </div>
      </div>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={detailProperty}
        open={!!detailProperty}
        onClose={() => setDetailProperty(null)}
        onInterest={handleInterestFromDetail}
      />

      {/* Interest Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProperty(null)}
          >
            <motion.div
              className="bg-card rounded-2xl border border-border p-6 w-full max-w-sm shadow-elevated space-y-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h3 className="font-semibold text-foreground">{selectedProperty.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">¥{selectedProperty.rent.toLocaleString()}/mo · {selectedProperty.area}</p>
              </div>
              <SlideToRequest
                urgent={urgent}
                onUrgentChange={setUrgent}
                onComplete={() => {
                  toast.success("Request sent!", {
                    description: `Your ${urgent ? "urgent " : ""}request for ${selectedProperty.title} has been submitted.`,
                  });
                  setTimeout(() => setSelectedProperty(null), 1200);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {compareIds.length === 2 && (
          <ComparisonDrawer properties={compareProperties} onClose={() => setCompareIds([])} />
        )}
      </AnimatePresence>
    </div>
  );};
export default TenantDashboard;
