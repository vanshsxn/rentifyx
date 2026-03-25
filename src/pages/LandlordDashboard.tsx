import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, Trash2, Check, X, Plus, Image as ImageIcon, 
  Loader2, Edit3, Sparkles, MessageSquare, Clock, 
  CheckCircle2, AlertCircle, Calendar 
} from "lucide-react";
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
    setLoading(true);
    
    // Fetch Landlord's Properties
    const { data: props } = await supabase
      .from("properties")
      .select("*")
      .eq("landlord_id", user.id)
      .order("created_at", { ascending: false });

    setProperties(props || []);

    // Fetch Incoming Tenant Requests for these properties
    if (props && props.length > 0) {
      const propIds = props.map(p => p.id);
      const { data: reqs } = await supabase
        .from("tenant_requests")
        .select(`
          *,
          properties (
            title,
            image_url
          )
        `)
        .in("property_id", propIds)
        .order("created_at", { ascending: false });
        
      setRequests(reqs || []);
    }
    
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    const { error } = await supabase
      .from("tenant_requests")
      .update({ status: newStatus })
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Request marked as ${newStatus}`);
      fetchData(); // Refresh UI
    }
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      title: p.title,
      address: p.address,
      area: p.area,
      rent: p.rent.toString(),
      gallery_images: p.images?.join(", ") || p.image_url || "",
      bedrooms: (p.bedrooms || 1).toString(),
      bathrooms: (p.bathrooms || 1).toString(),
      sqft: (p.sqft || 0).toString(),
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

  if (loading && !showForm) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4 py-8">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Landlord Hub</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">© 2026 Made by MV Studios Japan</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>

      {/* TENANT REQUESTS SECTION (NEW) */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 px-2 text-primary">
          <MessageSquare className="w-4 h-4" /> Incoming Inquiries ({requests.length})
        </h2>
        <div className="grid gap-3">
          {requests.length === 0 ? (
            <div className="p-12 text-center bg-card/50 border border-dashed border-border rounded-[2rem]">
               <p className="text-[9px] font-black uppercase text-muted-foreground">No tenant requests yet</p>
            </div>
          ) : (
            requests.map((req) => (
              <motion.div 
                key={req.id} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border p-5 rounded-[1.8rem] flex flex-wrap md:flex-nowrap items-center justify-between gap-4 group hover:border-primary/30 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                    <img src={req.properties?.image_url || "/placeholder.jpg"} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-black uppercase tracking-tight truncate max-w-[120px]">{req.properties?.title}</span>
                      {req.urgent && <span className="text-[8px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black uppercase animate-pulse">Urgent</span>}
                    </div>
                    <p className="text-xs font-bold text-foreground line-clamp-1">{req.message || "Wants to discuss a rental"}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                       <span className="text-[9px] text-muted-foreground font-bold uppercase flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(req.created_at).toLocaleDateString()}</span>
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${req.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'}`}>
                         {req.status}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  {req.status === 'pending' && (
                    <>
                      <button onClick={() => updateRequestStatus(req.id, 'rejected')} className="p-3 rounded-xl bg-secondary text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                      <button onClick={() => updateRequestStatus(req.id, 'approved')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-foreground text-background text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                        <CheckCircle2 className="w-4 h-4" /> Accept
                      </button>
                    </>
                  )}
                  {req.status === 'approved' && (
                    <button onClick={() => window.open(`mailto:${req.contact_email || ''}`)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-secondary text-foreground text-[9px] font-black uppercase tracking-widest">
                       Contact Tenant
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* FORM SECTION (ADD/EDIT) */}
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} onSubmit={handleSubmit} className="bg-card border-2 border-primary/20 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-primary/20" />
            <div className="flex items-center justify-between border-b border-border pb-6">
              <div className="flex items-center gap-3">
                <Edit3 className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-black uppercase tracking-[0.1em]">{editingId ? "Modify Listing" : "Create New Listing"}</h3>
              </div>
              <button type="button" onClick={resetForm} className="p-2 hover:bg-secondary rounded-full transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Property Name</label>
                  <input required placeholder="e.g., Vansh's Premium PG" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-background/50 focus:border-primary transition-all outline-none text-sm font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Monthly Rent (₹)</label>
                  <input required type="number" placeholder="8000" value={form.rent} onChange={e => setForm({...form, rent: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-background/50 focus:border-primary outline-none text-sm font-bold" />
                </div>
                <div className="lg:col-span-3 space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Image Gallery (Comma Separated URLs)</label>
                  <textarea placeholder="https://image1.jpg, https://image2.jpg..." value={form.gallery_images} onChange={e => setForm({...form, gallery_images: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-background/50 text-xs min-h-[100px] outline-none focus:border-primary" />
                </div>
                <input placeholder="Full Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="px-5 py-4 rounded-2xl border border-border bg-background/50 text-sm font-medium" />
                <input placeholder="Area / Locality" value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="px-5 py-4 rounded-2xl border border-border bg-background/50 text-sm font-medium" />
                <input placeholder="VR Tour Link (Optional)" value={form.vr_url} onChange={e => setForm({...form, vr_url: e.target.value})} className="px-5 py-4 rounded-2xl border border-primary/30 bg-primary/5 text-sm font-black text-primary placeholder:text-primary/30" />
            </div>

            <div className="flex gap-4 pt-6">
              <button type="submit" className="flex-1 py-5 rounded-2xl bg-foreground text-background text-[11px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.01] active:scale-95 transition-all">
                {editingId ? "Update Property" : "Go Live Now"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* MY LISTINGS SECTION */}
      <section className="space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 px-2 text-primary">
          <Building2 className="w-4 h-4" /> Portfolio Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.length === 0 ? (
             <p className="text-[10px] font-black uppercase opacity-30 text-center col-span-2 py-20">You haven't listed any properties yet.</p>
          ) : (
            properties.map((p) => (
              <div key={p.id} className="flex items-center gap-5 bg-card border border-border p-5 rounded-[2rem] hover:border-primary/50 transition-all shadow-sm group relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
                  <img src={p.image_url || "/placeholder.jpg"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black uppercase tracking-tight truncate">{p.title}</h3>
                  <p className="text-[10px] font-bold text-muted-foreground mt-1 tracking-wide">₹{p.rent.toLocaleString()} · {p.area}</p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => handleEdit(p)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2.5 rounded-xl bg-secondary hover:bg-red-500 hover:text-white text-muted-foreground transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {p.has_vr && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/20">
                    <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <span className="text-[8px] font-black text-primary uppercase">3D Active</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default LandlordDashboard;