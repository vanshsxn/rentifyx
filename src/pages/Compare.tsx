import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Bed, Bath, Maximize, X, Plus, Check, Loader2 } from "lucide-react";

const Compare = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const ids = params.get("ids")?.split(",").filter(Boolean) || [];
  const [allProps, setAllProps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("properties").select("*");
      setAllProps(data || []);
      setLoading(false);
    })();
  }, []);

  const selected = allProps.filter((p) => ids.includes(p.id));

  const toggle = (id: string) => {
    const set = new Set(ids);
    if (set.has(id)) set.delete(id);
    else if (set.size < 4) set.add(id);
    setParams({ ids: Array.from(set).join(",") });
  };

  if (loading) return <div className="min-h-[400px] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const fields = [
    { label: "Rent", get: (p: any) => `₹${p.rent.toLocaleString()}` },
    { label: "Rating", get: (p: any) => `${p.rating || 0} ⭐` },
    { label: "Area", get: (p: any) => p.area },
    { label: "Bedrooms", get: (p: any) => p.bedrooms || "—" },
    { label: "Bathrooms", get: (p: any) => p.bathrooms || "—" },
    { label: "Sqft", get: (p: any) => p.sqft || "—" },
    { label: "Furnish", get: (p: any) => p.furnish_type || "—" },
    { label: "Status", get: (p: any) => p.availability_status || "available" },
    { label: "Emergency", get: (p: any) => (p.is_emergency ? "✓" : "—") },
    { label: "VR Tour", get: (p: any) => (p.has_vr ? "✓" : "—") },
    { label: "Amenities", get: (p: any) => Array.from(new Set([...(p.features || []), ...(p.tags || [])])).join(", ") || "—" },
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-secondary"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="text-2xl font-black tracking-tighter italic uppercase">Compare Properties</h1>
      </div>

      {selected.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-3xl p-10 text-center mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pick up to 4 properties below to compare</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-card border border-border rounded-2xl mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-left text-[10px] font-black uppercase text-muted-foreground w-32">Feature</th>
                {selected.map((p) => (
                  <th key={p.id} className="p-4 min-w-[200px]">
                    <div className="space-y-2">
                      <img src={p.image_url || "/placeholder.svg"} className="w-full aspect-video object-cover rounded-lg" />
                      <p className="text-xs font-black uppercase truncate">{p.title}</p>
                      <button onClick={() => toggle(p.id)} className="text-[9px] font-bold text-red-500 flex items-center gap-1"><X className="w-3 h-3" /> Remove</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((f) => (
                <tr key={f.label} className="border-b border-border/50">
                  <td className="p-3 text-[10px] font-black uppercase text-muted-foreground">{f.label}</td>
                  {selected.map((p) => (
                    <td key={p.id} className="p-3 text-xs font-bold">{f.get(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="text-sm font-black uppercase tracking-widest mb-4">Add to comparison ({selected.length}/4)</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {allProps.map((p) => {
          const isSel = ids.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              disabled={!isSel && selected.length >= 4}
              className={`relative text-left bg-card border rounded-2xl overflow-hidden transition-all ${isSel ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"} disabled:opacity-40`}
            >
              <div className="aspect-video relative">
                <img src={p.image_url || "/placeholder.svg"} className="w-full h-full object-cover" />
                {isSel && <div className="absolute inset-0 bg-primary/30 flex items-center justify-center"><Check className="w-8 h-8 text-white" /></div>}
              </div>
              <div className="p-3">
                <p className="text-[11px] font-black uppercase truncate">{p.title}</p>
                <p className="text-[10px] text-primary font-black">₹{p.rent.toLocaleString()}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default Compare;