import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Edit3, Trash2, Check, X, Plus, Mail, Phone, Image, Video, MapPin } from "lucide-react";
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
    title: "", address: "", area: "", rent: "", image_url: "", bedrooms: "1", bathrooms: "1",
    sqft: "", features: "", phone: "", contact_email: "", video_url: "", vr_url: "",
  });

  const fetchData = async () => {
    if (!user) return;
    const [propRes, reqRes] = await Promise.all([
      supabase.from("properties").select("*").eq("landlord_id", user.id).order("created_at", { ascending: false }),
      supabase.from("tenant_requests").select("*").in(
        "property_id",
        (await supabase.from("properties").select("id").eq("landlord_id", user.id)).data?.map(p => p.id) || []
      ),
    ]);
    setProperties((propRes.data as PropertyRow[]) || []);
    setRequests((reqRes.data as RequestRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("properties").insert({
      landlord_id: user.id,
      title: form.title,
      address: form.address,
      area: form.area,
      rent: parseFloat(form.rent),
      image_url: form.image_url || null,
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
      toast.success("Property added!");
      setShowForm(false);
      setForm({ title: "", address: "", area: "", rent: "", image_url: "", bedrooms: "1", bathrooms: "1", sqft: "", features: "", phone: "", contact_email: "", video_url: "", vr_url: "" });
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Landlord Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome, {user?.email?.split("@")[0] ?? "Landlord"}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>

      {/* Add Property Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-xl p-6 space-y-4 card-shadow overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-foreground">Add New Property</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
              <input required placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
              <input required placeholder="Area (e.g. Clement Town)" value={form.area} onChange={e => setForm({...form, area: e.target.value})} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
              <input required type="number" placeholder="Rent (₹/mo)" value={form.rent} onChange={e => setForm({...form, rent: e.target.value})} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
              <input placeholder="Image URL" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
              <input placeholder="Video URL" value={form.video_url} onChange={e => setForm({...form, video_url: e.target.value})} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
              <input type="number" placeholder="Bedrooms" value={form.bedrooms} onChange={e => setForm({...form, bedrooms: e.target.value})} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
              <input type="number" placeholder="Bathrooms" value={form.bathrooms} onChange={e => setForm({...form, bathrooms: e.target.value})} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
              <input type="number" placeholder="Sq Ft" value={form.sqft} onChange={e => setForm({...form, sqft: e.target.value})} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
              <input placeholder="Features (comma separated)" value={form.features} onChange={e => setForm({...form, features: e.target.value})} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
              <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
              <input placeholder="Contact Email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
              <input placeholder="VR Tour URL (optional)" value={form.vr_url} onChange={e => setForm({...form, vr_url: e.target.value})} className="sm:col-span-2 px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90">Submit</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium">Cancel</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* My Properties */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> My Properties
        </h2>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
        ) : properties.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No properties yet</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">Click "Add Property" to list your first property.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {properties.map((p) => (
              <div key={p.id} className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 card-shadow">
                <img src={p.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&q=60"} alt={p.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{p.title}</h3>
                  <p className="text-xs text-muted-foreground">{p.area} · ₹{p.rent.toLocaleString()}/mo</p>
                  {!p.has_vr && (
                    <span className="text-[10px] text-orange-500 font-medium">No VR — Contact Admin for VR Creation</span>
                  )}
                </div>
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Incoming Requests */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Incoming Requests</h2>
        {requests.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-xl p-10 text-center">
            <p className="text-sm text-muted-foreground">No incoming requests yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {requests.map((r) => (
              <div key={r.id} className="bg-card border border-border rounded-lg p-4 card-shadow flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Request from tenant</p>
                  <p className="text-xs text-muted-foreground">{r.urgent ? "🔴 Urgent" : "Normal"} · {r.status}</p>
                  {r.message && <p className="text-xs text-muted-foreground mt-1">{r.message}</p>}
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleRequestAction(r.id, "accepted")} className="p-2 rounded-md bg-green-500/10 text-green-600 hover:bg-green-500/20">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRequestAction(r.id, "rejected")} className="p-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default LandlordDashboard;
