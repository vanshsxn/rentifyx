import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Trash2, Check, X, Plus, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface PropertyRow {
  id: string;
  title: string;
  address: string;
  area: string;
  rent: number;
  image_url: string | null;
  images: string[] | null; // Added array support
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  features: string[];
  has_vr: boolean;
  vr_url: string | null;
  phone: string | null;
  contact_email: string | null;
  video_url: string | null;
  created_at: string;
}

interface RequestRow {
  id: string;
  urgent: boolean;
  status: string;
  message: string | null;
  created_at: string;
  tenant_id: string;
  property_id: string;
}

const LandlordDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    title: "", address: "", area: "", rent: "", 
    gallery_images: "", // New field for comma-separated URLs
    bedrooms: "1", bathrooms: "1",
    sqft: "", features: "", phone: "", 
    contact_email: "", video_url: "", vr_url: "",
  });

  const fetchData = async () => {
    if (!user) return;
    const { data: props, error: propErr } = await supabase
      .from("properties")
      .select("*")
      .eq("landlord_id", user.id)
      .order("created_at", { ascending: false });

    if (propErr) return toast.error("Error fetching properties");

    const propIds = props?.map(p => p.id) || [];
    const { data: reqs } = await supabase
      .from("tenant_requests")
      .select("*")
      .in("property_id", propIds);

    setProperties((props as PropertyRow[]) || []);
    setRequests((reqs as RequestRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Convert comma-separated string to clean array
    const imageArray = form.gallery_images
      .split(",")
      .map(url => url.trim())
      .filter(url => url.startsWith("http"));

    const { error } = await supabase.from("properties").insert({
      landlord_id: user.id,
      title: form.title,
      address: form.address,
      area: form.area,
      rent: parseFloat(form.rent),
      image_url: imageArray[0] || null, // First image is the thumbnail
      images: imageArray, // The full gallery array
      bedrooms: parseInt(form.bedrooms),
      bathrooms: parseInt(form.bathrooms),
      sqft: parseInt(form.sqft) || 0,
      features: form.features.split(",").map(f => f.trim()).filter(Boolean),
      phone: form.phone || null,
      contact_email: form.contact_email || null,
      video_url: form.video_url || null,
      vr_url: form.vr_url || null,
      has_vr: !!form.vr_url,
    });

    if (error) {
      toast.error("Failed to add property", { description: error.message });
    } else {
      toast.success("Property added with gallery!");
      setShowForm(false);
      setForm({ 
        title: "", address: "", area: "", rent: "", 
        gallery_images: "", bedrooms: "1", bathrooms: "1", 
        sqft: "", features: "", phone: "", contact_email: "", 
        video_url: "", vr_url: "" 
      });
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) toast.error("Delete failed");
    else { toast.success("Property deleted"); fetchData(); }
  };

  const handleRequestAction = async (id: string, status: string) => {
    await supabase.from("tenant_requests").update({ status }).eq("id", id);
    toast.success(`Request ${status}`);
    fetchData();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">Landlord Hub</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Management Portal · {user?.email}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-2xl p-8 space-y-6 shadow-xl"
          >
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <ImageIcon className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest">List New Unit</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5 lg:col-span-2">
                 <label className="text-[10px] font-black uppercase tracking-tighter ml-1">Title</label>
                 <input required placeholder="E.g. Luxury Penthouse" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm" />
              </div>
              
              <div className="space-y-1.5">
                 <label className="text-[10px] font-black uppercase tracking-tighter ml-1">Rent (₹)</label>
                 <input required type="number" placeholder="15000" value={form.rent} onChange={e => setForm({...form, rent: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm" />
              </div>

              <div className="space-y-1.5 lg:col-span-3">
                 <label className="text-[10px] font-black uppercase tracking-tighter ml-1 text-primary">Gallery Images (Paste multiple URLs separated by commas)</label>
                 <textarea placeholder="https://image1.jpg, https://image2.jpg..." value={form.gallery_images} onChange={e => setForm({...form, gallery_images: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm min-h-[100px]" />
              </div>

              <input required placeholder="Full Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="px-4 py-3 rounded-xl border border-border bg-background text-sm" />
              <input required placeholder="Area (City/Locality)" value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="px-4 py-3 rounded-xl border border-border bg-background text-sm" />
              <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="px-4 py-3 rounded-xl border border-border bg-background text-sm" />
              <input type="number" placeholder="Beds" value={form.bedrooms} onChange={e => setForm({...form, bedrooms: e.target.value})} className="px-4 py-3 rounded-xl border border-border bg-background text-sm" />
              <input type="number" placeholder="Baths" value={form.bathrooms} onChange={e => setForm({...form, bathrooms: e.target.value})} className="px-4 py-3 rounded-xl border border-border bg-background text-sm" />
              <input type="number" placeholder="Sq Ft" value={form.sqft} onChange={e => setForm({...form, sqft: e.target.value})} className="px-4 py-3 rounded-xl border border-border bg-background text-sm" />
              <input placeholder="Features (e.g. WiFi, Parking)" value={form.features} onChange={e => setForm({...form, features: e.target.value})} className="md:col-span-2 px-4 py-3 rounded-xl border border-border bg-background text-sm" />
              <input placeholder="VR Link" value={form.vr_url} onChange={e => setForm({...form, vr_url: e.target.value})} className="px-4 py-3 rounded-xl border border-primary/30 bg-primary/5 text-sm" />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 py-4 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Publish Listing</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-8 py-4 rounded-xl bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest">Discard</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Properties Column */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2 px-2">
            <Building2 className="w-4 h-4 text-primary" /> Active Units ({properties.length})
          </h2>
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : properties.map((p) => (
              <div key={p.id} className="group flex items-center gap-4 bg-card border border-border p-3 rounded-2xl hover:border-primary/50 transition-all shadow-sm">
                <img src={p.image_url || "/placeholder.jpg"} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="text-[11px] font-black uppercase tracking-tight truncate">{p.title}</h3>
                  <p className="text-[10px] font-bold text-muted-foreground">₹{p.rent.toLocaleString()} · {p.images?.length || 1} Images</p>
                </div>
                <button onClick={() => handleDelete(p.id)} className="p-2.5 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Requests Column */}
        <section className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.3em] px-2">Incoming Requests</h2>
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${r.urgent ? "bg-red-500 text-white" : "bg-primary/10 text-primary"}`}>
                      {r.urgent ? "Urgent" : "Standard"}
                    </span>
                    <p className="text-[11px] font-bold mt-2">{r.message || "No message provided"}</p>
                  </div>
                  {r.status === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => handleRequestAction(r.id, "accepted")} className="p-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20"><Check className="w-4 h-4" /></button>
                      <button onClick={() => handleRequestAction(r.id, "rejected")} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandlordDashboard;