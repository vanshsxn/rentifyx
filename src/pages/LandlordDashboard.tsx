import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Trash2, Check, X, Plus, Image as ImageIcon, Loader2, Edit3, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const LandlordDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    title: "", address: "", area: "", rent: "", 
    gallery_images: "", bedrooms: "1", bathrooms: "1",
    sqft: "", features: "", phone: "", 
    contact_email: "", video_url: "", vr_url: "",
  });

  const fetchData = async () => {
    if (!user) return;
    const { data: props } = await supabase.from("properties").select("*").eq("landlord_id", user.id).order("created_at", { ascending: false });
    const { data: reqs } = await supabase.from("tenant_requests").select("*").in("property_id", props?.map(p => p.id) || []);
    setProperties(props || []);
    setRequests(reqs || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      address: p.address,
      area: p.area,
      rent: p.rent.toString(),
      gallery_images: p.images?.join(", ") || p.image_url || "",
      bedrooms: p.bedrooms.toString(),
      bathrooms: p.bathrooms.toString(),
      sqft: p.sqft.toString(),
      features: p.features?.join(", ") || "",
      phone: p.phone || "",
      contact_email: p.contact_email || "",
      video_url: p.video_url || "",
      vr_url: p.vr_url || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const imageArray = form.gallery_images.split(",").map(url => url.trim()).filter(url => url.startsWith("http"));
    const payload = {
      title: form.title,
      address: form.address,
      area: form.area,
      rent: parseFloat(form.rent),
      image_url: imageArray[0] || null,
      images: imageArray,
      bedrooms: parseInt(form.bedrooms),
      bathrooms: parseInt(form.bathrooms),
      sqft: parseInt(form.sqft) || 0,
      features: form.features.split(",").map(f => f.trim()).filter(Boolean),
      phone: form.phone || null,
      contact_email: form.contact_email || null,
      video_url: form.video_url || null,
      vr_url: form.vr_url || null,
      has_vr: !!form.vr_url,
    };

    const { error } = editingId 
      ? await supabase.from("properties").update(payload).eq("id", editingId)
      : await supabase.from("properties").insert({ ...payload, landlord_id: user.id });

    if (error) {
      toast.error("Operation failed", { description: error.message });
    } else {
      toast.success(editingId ? "Property updated!" : "Property added!");
      resetForm();
      fetchData();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ title: "", address: "", area: "", rent: "", gallery_images: "", bedrooms: "1", bathrooms: "1", sqft: "", features: "", phone: "", contact_email: "", video_url: "", vr_url: "" });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (!error) { toast.success("Property deleted"); fetchData(); }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Landlord Hub</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">© 2026 Made by MV Studios Japan</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} onSubmit={handleSubmit} className="bg-card border-2 border-primary/20 rounded-2xl p-8 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <Edit3 className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest">{editingId ? "Edit Property Details" : "List New Unit"}</h3>
            </div>
            {/* ... (Same grid inputs as previous code) ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input required placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="lg:col-span-2 px-4 py-3 rounded-xl border border-border bg-background text-sm" />
                <input required type="number" placeholder="Rent (₹)" value={form.rent} onChange={e => setForm({...form, rent: e.target.value})} className="px-4 py-3 rounded-xl border border-border bg-background text-sm" />
                <textarea placeholder="Gallery Images (Paste URLs separated by commas)" value={form.gallery_images} onChange={e => setForm({...form, gallery_images: e.target.value})} className="lg:col-span-3 px-4 py-3 rounded-xl border border-border bg-background text-sm min-h-[80px]" />
                <input placeholder="Full Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="px-4 py-3 rounded-xl border border-border bg-background text-sm" />
                <input placeholder="Area" value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="px-4 py-3 rounded-xl border border-border bg-background text-sm" />
                <input placeholder="VR URL" value={form.vr_url} onChange={e => setForm({...form, vr_url: e.target.value})} className="px-4 py-3 rounded-xl border border-primary/30 bg-primary/5 text-sm font-bold" />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 py-4 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                {editingId ? "Save Changes" : "Publish Listing"}
              </button>
              <button type="button" onClick={resetForm} className="px-8 py-4 rounded-xl bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <section className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 px-2"><Building2 className="w-4 h-4 text-primary" /> My Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((p) => (
            <div key={p.id} className="flex items-center gap-4 bg-card border border-border p-4 rounded-2xl hover:border-primary/50 transition-all shadow-sm group">
              <img src={p.image_url || "/placeholder.jpg"} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1">
                <h3 className="text-[12px] font-black uppercase tracking-tight truncate">{p.title}</h3>
                <p className="text-[10px] font-bold text-muted-foreground">₹{p.rent.toLocaleString()} · {p.area}</p>
                <div className="flex gap-2 mt-3">
                  {/* THE EDIT BUTTON */}
                  <button onClick={() => handleEdit(p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[9px] font-black uppercase tracking-tighter hover:bg-primary hover:text-white transition-all">
                    <Edit3 className="w-3 h-3" /> Edit Property
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {p.has_vr && <Sparkles className="w-4 h-4 text-primary animate-pulse mr-2" />}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandlordDashboard;