import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2, Trash2, X, Plus, Loader2, Edit3, 
  Sparkles, Zap, Droplets, Wifi, Car, Shield, Wind, Dumbbell, User, Settings, 
  LogOut, ChevronDown, Star
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const LandlordDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [properties, setProperties] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const availableTags = [
    { id: "WiFi", icon: Wifi },
    { id: "Parking", icon: Car },
    { id: "Drinking Water", icon: Droplets },
    { id: "AC", icon: Wind },
    { id: "CCTV", icon: Shield },
    { id: "Gym", icon: Dumbbell },
    { id: "Power Backup", icon: Zap },
  ];

  const [form, setForm] = useState({
    title: "", address: "", area: "", rent: "", gallery_images: "",
    bedrooms: "1", bathrooms: "1", sqft: "", tags: [] as string[],
    phone: "", contact_email: "", video_url: "", vr_url: "",
  });

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("landlord_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setProperties(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const toggleTag = (tagId: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId) ? prev.tags.filter(t => t !== tagId) : [...prev.tags, tagId]
    }));
  };

  const handleEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      title: p.title, address: p.address, area: p.area, rent: p.rent.toString(),
      gallery_images: p.images?.join(", ") || p.image_url || "",
      bedrooms: (p.bedrooms || 1).toString(), bathrooms: (p.bathrooms || 1).toString(),
      sqft: (p.sqft || "").toString(), tags: p.features || [], phone: p.phone || "",
      contact_email: p.contact_email || "", video_url: p.video_url || "", vr_url: p.vr_url || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    const imageArray = form.gallery_images.split(",").map(url => url.trim()).filter(url => url.startsWith("http"));
    
    const payload = {
      title: form.title, address: form.address, area: form.area, rent: parseFloat(form.rent),
      image_url: imageArray[0] || null, images: imageArray, bedrooms: parseInt(form.bedrooms),
      bathrooms: parseInt(form.bathrooms), sqft: parseInt(form.sqft) || 0, features: form.tags,
      phone: form.phone || null, contact_email: form.contact_email || null, video_url: form.video_url || null,
      vr_url: form.vr_url || null, has_vr: !!form.vr_url,
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
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ 
      title: "", address: "", area: "", rent: "", gallery_images: "", 
      bedrooms: "1", bathrooms: "1", sqft: "", tags: [], 
      phone: "", contact_email: "", video_url: "", vr_url: "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this listing?")) return;
    await supabase.from("properties").delete().eq("id", id);
    fetchData();
  };

  const handleLogout = async () => {
    // Brackets bypass strict property check for older type definitions
    await (supabase.auth as any).signOut();
    navigate("/auth");
  };

  if (loading && !showForm) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-12 max-w-6xl mx-auto px-4 py-8">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase italic leading-none">Properties</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Management Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => { resetForm(); setShowForm(true); }} className="px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-xl">
            <Plus className="w-4 h-4" /> Add New
          </button>

          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 bg-card border border-border/50 p-1.5 pr-4 rounded-[1.5rem] hover:shadow-lg transition-all group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <User className="w-5 h-5" />
              </div>
              <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="absolute right-0 mt-3 w-48 bg-card border border-border/50 rounded-[2rem] shadow-2xl p-3 z-50">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 rounded-xl transition-all">
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* FORM SECTION */}
      <AnimatePresence>
        {showForm && (
          <motion.form initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} onSubmit={handleSubmit} className="bg-card border-2 border-primary/20 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"><Edit3 className="w-5 h-5 text-primary" /></div>
                <h3 className="text-lg font-black uppercase tracking-[0.1em]">{editingId ? "Update Listing" : "List Property"}</h3>
              </div>
              <button type="button" onClick={resetForm} className="p-2 hover:bg-secondary rounded-full"><X className="w-5 h-5"/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                <input required placeholder="Modern Apartment" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-background/50 outline-none text-sm font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Rent (₹)</label>
                <input required type="number" value={form.rent} onChange={e => setForm({...form, rent: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-background/50 outline-none text-sm font-bold" />
              </div>
              
              <div className="lg:col-span-3 space-y-4 pt-4 border-t border-border">
                <label className="text-[9px] font-black uppercase tracking-widest text-primary ml-1">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all border ${form.tags.includes(tag.id) ? "bg-primary border-primary text-white" : "bg-transparent border-border text-muted-foreground"}`}>
                      <tag.icon className="w-3.5 h-3.5" /> {tag.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Images (CSV)</label>
                <textarea value={form.gallery_images} onChange={e => setForm({...form, gallery_images: e.target.value})} className="w-full px-5 py-4 rounded-2xl border border-border bg-background/50 text-xs min-h-[80px] outline-none" />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-5 rounded-2xl bg-foreground text-background text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Publish Listing"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* PORTFOLIO GRID */}
      <section className="space-y-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 px-2 text-primary">
          <Building2 className="w-4 h-4" /> Active Portfolio ({properties.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((p) => (
            <div key={p.id} className="flex items-center gap-5 bg-card border border-border p-5 rounded-[2.5rem] hover:border-primary/50 transition-all shadow-sm group">
              <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden relative">
                <img src={p.image_url || "/placeholder.jpg"} className="w-full h-full object-cover" alt="property" />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500" />
                  <span className="text-[8px] font-black text-white">{p.rating || "5.0"}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-black uppercase truncate">{p.title}</h3>
                <p className="text-[10px] font-bold text-primary">₹{p.rent.toLocaleString()}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleEdit(p)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-2.5 rounded-xl bg-secondary hover:bg-red-500 hover:text-white text-muted-foreground transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandlordDashboard;