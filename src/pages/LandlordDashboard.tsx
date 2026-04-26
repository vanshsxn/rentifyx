import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2, Trash2, X, Plus, Loader2, Edit3, Sparkles, Zap, Droplets, Wifi, 
  Car, Shield, Wind, Dumbbell, User, Settings, LogOut, ChevronDown, Star, 
  Phone, Mail, MapPin, Maximize, Siren, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PropertyMap, { LocationPicker, MapMarkerData } from "@/components/PropertyMap";
import { EmergencyBadge, AvailabilityPill } from "@/components/StatusBadges";

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

  const [extras, setExtras] = useState({
    is_emergency: false,
    availability_status: "available" as "available" | "booked" | "unavailable",
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("properties")
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
      title: p.title || "",
      address: p.address || "",
      area: p.area || "",
      rent: p.rent?.toString() || "",
      gallery_images: p.images?.join(", ") || p.image_url || "",
      bedrooms: (p.bedrooms || 1).toString(),
      bathrooms: (p.bathrooms || 1).toString(),
      sqft: (p.sqft || "").toString(),
      tags: p.features || [],
      phone: p.phone || "",
      contact_email: p.contact_email || "",
      video_url: p.video_url || "",
      vr_url: p.vr_url || "",
    });
    // Set map extras immediately
    setExtras({
      is_emergency: !!p.is_emergency,
      availability_status: p.availability_status || "available",
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Map validation
    if (!extras.latitude || !extras.longitude) {
      toast.error("Location Required", { description: "Please pin your property on the map before deploying." });
      return;
    }

    setIsSubmitting(true);
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
      features: form.tags,
      phone: form.phone || null,
      contact_email: form.contact_email || null,
      video_url: form.video_url || null,
      vr_url: form.vr_url || null,
      has_vr: !!form.vr_url,
      landlord_id: user.id,
      latitude: extras.latitude,
      longitude: extras.longitude,
      is_emergency: extras.is_emergency,
      availability_status: extras.availability_status,
      rating: 0 // Resetting static rating to 0 as requested
    };

    const { error } = editingId 
      ? await supabase.from("properties").update(payload).eq("id", editingId)
      : await supabase.from("properties").insert([payload]);

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
    setExtras({ is_emergency: false, availability_status: "available", latitude: null, longitude: null });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this listing permanently?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) toast.error("Could not delete");
    else {
      toast.success("Listing removed");
      fetchData();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading && !showForm) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Portfolio...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-card border border-border/50 p-8 rounded-[3rem] shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Management</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1">Live Portfolio Tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => { resetForm(); setShowForm(true); }} className="px-8 py-4 rounded-2xl bg-foreground text-background text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Listing
          </button>
          <button onClick={() => navigate("/chat")} className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors border border-border/50 text-muted-foreground mr-2 relative group">
            <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center hover:bg-border transition-colors border border-border/50 text-muted-foreground">
              <User className="w-6 h-6" />
            </button>
            <AnimatePresence>
              {showUserMenu && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-4 w-56 bg-card border border-border rounded-3xl shadow-2xl p-2 z-50">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 rounded-2xl transition-all group">
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500">End Session</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* FORM OVERLAY */}
      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 20 }} 
            onSubmit={handleSubmit} 
            className="bg-card border-2 border-primary/20 rounded-[3rem] p-10 space-y-10 shadow-2xl overflow-hidden relative"
          >
            <div className="flex items-center justify-between border-b border-border pb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                  <Edit3 className="w-6 h-6 text-primary" /> {editingId ? "Modify Asset" : "Register Property"}
                </h3>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Ensure all details are accurate for AI filtering.</p>
              </div>
              <button type="button" onClick={resetForm} className="w-12 h-12 flex items-center justify-center hover:bg-secondary rounded-2xl transition-colors"><X className="w-6 h-6"/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Asset Name</label>
                  <input required placeholder="Luxury PG / BHK Name" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-6 py-5 rounded-[1.5rem] border border-border bg-background outline-none text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Area / Landmark</label>
                    <input required placeholder="DLF Phase 3" value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="w-full px-6 py-5 rounded-[1.5rem] border border-border bg-background outline-none text-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Address</label>
                    <input required placeholder="House No, Street..." value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-6 py-5 rounded-[1.5rem] border border-border bg-background outline-none text-sm font-bold" />
                  </div>
                </div>
              </div>

              <div className="space-y-6 bg-secondary/30 p-6 rounded-[2rem] border border-border/50">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary">Monthly Rent (₹)</label>
                  <input required type="number" value={form.rent} onChange={e => setForm({...form, rent: e.target.value})} className="w-full px-6 py-5 rounded-[1.5rem] border border-primary/20 bg-background outline-none text-lg font-black text-primary" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Sqft</label>
                    <input type="number" placeholder="800" value={form.sqft} onChange={e => setForm({...form, sqft: e.target.value})} className="w-full p-4 rounded-xl border border-border bg-background text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-muted-foreground">Phone</label>
                    <input placeholder="Mobile" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full p-4 rounded-xl border border-border bg-background text-xs font-bold" />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 space-y-4 pt-4 border-t border-border">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Feature Tags
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableTags.map((tag) => (
                    <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)} className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase transition-all border-2 ${form.tags.includes(tag.id) ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" : "bg-transparent border-border text-muted-foreground hover:border-primary/50"}`}>
                      <tag.icon className="w-4 h-4" /> {tag.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Maximize className="w-4 h-4" /> VR/360 Virtual Tour URL</label>
                  <input placeholder="https://..." value={form.vr_url} onChange={e => setForm({...form, vr_url: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-border bg-background text-xs font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Image Gallery (Links separated by comma)</label>
                  <textarea placeholder="Paste image links..." value={form.gallery_images} onChange={e => setForm({...form, gallery_images: e.target.value})} className="w-full px-6 py-4 rounded-2xl border border-border bg-background text-xs min-h-[100px] font-bold" />
                </div>
              </div>

              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">Booking Status</label>
                    <select value={extras.availability_status} onChange={(e) => setExtras({ ...extras, availability_status: e.target.value as any })} className="w-full px-6 py-4 rounded-2xl border border-border bg-background text-xs font-black uppercase">
                      <option value="available">Available</option>
                      <option value="booked">Booked</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                  <button type="button" onClick={() => setExtras({ ...extras, is_emergency: !extras.is_emergency })} className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all ${extras.is_emergency ? "bg-red-500/10 border-red-500 text-red-600" : "bg-background border-border text-muted-foreground"}`}>
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Siren className="w-4 h-4" /> Emergency Booking</span>
                    <span className={`w-10 h-6 rounded-full p-1 transition-colors ${extras.is_emergency ? "bg-red-500" : "bg-border"}`}>
                      <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${extras.is_emergency ? "translate-x-4" : ""}`} />
                    </span>
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Map Location
                  </label>
                  <LocationPicker
                    lat={extras.latitude}
                    lng={extras.longitude}
                    onChange={(lat, lng) => setExtras({ ...extras, latitude: lat, longitude: lng })}
                    height="250px"
                  />
                  {extras.latitude && extras.longitude ? (
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest">✓ Pinned at {extras.latitude.toFixed(4)}, {extras.longitude.toFixed(4)}</p>
                  ) : (
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">⚠ Location required - click map to pin</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !extras.latitude}
                className="flex-1 py-6 rounded-[2rem] bg-foreground text-background text-xs font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl"
              >
                {isSubmitting ? "Deploying..." : editingId ? "Update Asset" : "Deploy Listing"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* PORTFOLIO MAP VIEW */}
      {properties.some(p => p.latitude && p.longitude) && (
        <section className="space-y-4">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-muted-foreground px-4">
            <MapPin className="w-4 h-4 text-primary" /> Active Locations Map
          </h2>
          <PropertyMap
            height="400px"
            markers={properties
              .filter(p => p.latitude && p.longitude)
              .map(p => ({
                id: p.id,
                lat: p.latitude,
                lng: p.longitude,
                title: p.title,
                rent: p.rent,
                isEmergency: p.is_emergency,
                onClick: () => handleEdit(p)
              })) as MapMarkerData[]}
          />
        </section>
      )}

      {/* PORTFOLIO GRID */}
      <section className="space-y-8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3 text-muted-foreground px-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Asset Inventory ({properties.length})
        </h2>
        
        {properties.length === 0 ? (
          <div className="py-32 text-center bg-card border border-dashed border-border rounded-[3rem]">
            <Building2 className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Empty Inventory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {properties.map((p) => (
              <motion.div layout key={p.id} className="group bg-card border border-border p-6 rounded-[3rem] hover:border-primary/50 transition-all shadow-sm flex flex-col sm:flex-row items-center gap-8">
                <div className="w-full sm:w-40 h-40 rounded-[2.5rem] overflow-hidden relative flex-shrink-0">
                  <img src={p.image_url || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="property" />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-[10px] font-black text-white">{p.rating > 0 ? p.rating.toFixed(1) : "New"}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-black uppercase tracking-tighter truncate">{p.title}</h3>
                      {p.is_emergency && <EmergencyBadge />}
                      <AvailabilityPill status={p.availability_status} />
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3 h-3 text-primary" /> {p.area}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/50 pt-4">
                    <p className="text-lg font-black text-primary italic">₹{p.rent?.toLocaleString()}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-secondary hover:bg-red-500 hover:text-white text-muted-foreground transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <footer className="py-12 text-center opacity-20">
        <p className="text-[9px] font-black uppercase tracking-[0.5em]">Systems Optimized by MV Studios Japan</p>
      </footer>
    </div>
  );
};

export default LandlordDashboard;