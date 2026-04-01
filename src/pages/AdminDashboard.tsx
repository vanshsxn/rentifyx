import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2, Users, Shield, Search, Loader2, Trash2, Star, TrendingUp, BarChart3, Save
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PropertyRow {
  id: string;
  title: string;
  area: string;
  rent: number;
  rating: number;
  admin_rating: number | null;
  image_url: string | null;
  landlord_id: string;
}

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"properties" | "users">("properties");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRating, setEditingRating] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: props }, { data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("properties").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      setProperties((props as PropertyRow[]) || []);
      setUsers((profiles as UserRow[]) || []);

      const roleMap: Record<string, string> = {};
      (roles || []).forEach((r: any) => { roleMap[r.user_id] = r.role; });
      setUserRoles(roleMap);
    } catch {
      toast.error("Database sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const analytics = useMemo(() => {
    const total = properties.length;
    const avg = total ? (properties.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total) : 0;
    const highRated = properties.filter(p => p.rating >= 4.5).length;
    const midRated = properties.filter(p => p.rating >= 3.0 && p.rating < 4.5).length;
    const lowRated = properties.filter(p => p.rating < 3.0).length;
    const landlords = Object.values(userRoles).filter(r => r === "landlord").length;
    const tenants = Object.values(userRoles).filter(r => r === "tenant").length;

    return {
      avg: avg.toFixed(1),
      highPct: total ? (highRated / total) * 100 : 0,
      midPct: total ? (midRated / total) * 100 : 0,
      lowPct: total ? (lowRated / total) * 100 : 0,
      landlords,
      tenants,
    };
  }, [properties, userRoles]);

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm("Permanent delete?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (!error) {
      toast.success("Property removed");
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSetAdminRating = async (propertyId: string) => {
    const val = parseFloat(ratingValue);
    if (isNaN(val) || val < 1 || val > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }
    const { error } = await supabase
      .from("properties")
      .update({ admin_rating: val })
      .eq("id", propertyId);

    if (error) {
      toast.error("Failed to update rating");
    } else {
      toast.success("Admin base rating set!");
      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, admin_rating: val } : p));
      setEditingRating(null);
      setRatingValue("");
    }
  };

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 bg-background min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
            <Shield className="w-8 md:w-10 h-8 md:h-10 text-primary" />
            Control Center
          </h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-green-500" /> Platform Rating: <span className="text-foreground">{analytics.avg}/5.0</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group flex-1 md:flex-initial">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Filter ${tab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-2xl text-[11px] font-bold uppercase w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="bg-secondary p-1 rounded-2xl flex border border-border">
            <button onClick={() => setTab("properties")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tab === "properties" ? "bg-background shadow-lg text-primary" : "opacity-40"}`}>Units</button>
            <button onClick={() => setTab("users")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tab === "users" ? "bg-background shadow-lg text-primary" : "opacity-40"}`}>Users</button>
          </div>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Live Units" value={properties.length} sub="Active listings" icon={Building2} />
        <div className="bg-card border border-border p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Rating Trend</p>
              <p className="text-3xl md:text-4xl font-black tracking-tighter mb-2">{analytics.avg}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[8px] font-black uppercase opacity-60">
                <span>Distribution</span>
                <span>{Math.round(analytics.highPct)}% Top</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full flex overflow-hidden">
                <div style={{ width: `${analytics.highPct}%` }} className="bg-green-500 h-full" />
                <div style={{ width: `${analytics.midPct}%` }} className="bg-yellow-500 h-full" />
                <div style={{ width: `${analytics.lowPct}%` }} className="bg-red-500 h-full" />
              </div>
            </div>
          </div>
          <BarChart3 className="absolute -bottom-2 -right-2 w-20 h-20 text-muted-foreground/5 opacity-20" />
        </div>
        <StatCard label="Landlords" value={analytics.landlords} sub="Supply side" icon={Users} />
        <StatCard label="Tenants" value={analytics.tenants} sub="Demand side" icon={Shield} />
      </div>

      {/* TABLE */}
      <div className="bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Syncing...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary/30 border-b border-border">
                <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {tab === "properties" ? (
                    <>
                      <th className="px-6 md:px-8 py-5">Property</th>
                      <th className="px-6 md:px-8 py-5">Admin Rating</th>
                      <th className="px-6 md:px-8 py-5">Displayed</th>
                      <th className="px-6 md:px-8 py-5">Rent</th>
                      <th className="px-6 md:px-8 py-5 text-right">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 md:px-8 py-5">User</th>
                      <th className="px-6 md:px-8 py-5">Role</th>
                      <th className="px-6 md:px-8 py-5">Joined</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold uppercase">
                {tab === "properties" ? (
                  filteredProperties.map(p => {
                    // Weighted avg: (admin_rating + tenant_rating) / 2
                    const displayedRating = p.admin_rating
                      ? ((p.admin_rating + (p.rating || 0)) / 2).toFixed(1)
                      : (p.rating || 0).toFixed(1);

                    return (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors group">
                        <td className="px-6 md:px-8 py-4">
                          <div className="flex items-center gap-4">
                            <img src={p.image_url || "/placeholder.svg"} className="w-12 h-12 rounded-2xl object-cover" />
                            <div>
                              <p className="tracking-tight">{p.title}</p>
                              <p className="text-[8px] opacity-40 lowercase font-medium">{p.area}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-4">
                          {editingRating === p.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.1"
                                min="1"
                                max="5"
                                value={ratingValue}
                                onChange={(e) => setRatingValue(e.target.value)}
                                className="w-16 px-2 py-1 rounded-lg border border-primary bg-primary/5 text-xs font-black text-center focus:outline-none"
                                autoFocus
                              />
                              <button onClick={() => handleSetAdminRating(p.id)} className="p-1.5 bg-primary text-primary-foreground rounded-lg">
                                <Save className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingRating(p.id); setRatingValue((p.admin_rating || "").toString()); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all"
                            >
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              <span className="font-black text-[10px] text-yellow-600">{p.admin_rating?.toFixed(1) || "Set"}</span>
                            </button>
                          )}
                        </td>
                        <td className="px-6 md:px-8 py-4">
                          <div className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20">
                            <Star className="w-3 h-3 fill-green-500" />
                            <span className="font-black text-[10px]">{displayedRating}</span>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-4 text-primary font-black">₹{p.rent.toLocaleString()}</td>
                        <td className="px-6 md:px-8 py-4 text-right">
                          <button onClick={() => handleDeleteProperty(p.id)} className="p-3 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-2xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                      <td className="px-6 md:px-8 py-4">
                        <div>
                          <p className="tracking-tight">{u.full_name || "Unknown"}</p>
                          <p className="text-[8px] opacity-40 lowercase font-medium">{u.email}</p>
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-4">
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${
                          userRoles[u.id] === "landlord" ? "bg-primary/10 text-primary" :
                          userRoles[u.id] === "admin" ? "bg-destructive/10 text-destructive" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {userRoles[u.id] || "tenant"}
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-4 text-[9px] opacity-50">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, icon: Icon }: any) => (
  <div className="bg-card border border-border p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm hover:border-primary/30 transition-all group relative overflow-hidden">
    <div className="relative z-10">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl md:text-4xl font-black tracking-tighter mb-1">{value || 0}</p>
      <p className="text-[8px] font-bold uppercase text-muted-foreground/50">{sub}</p>
    </div>
    {Icon && <Icon className="absolute -bottom-2 -right-2 w-20 h-20 text-muted-foreground/5 opacity-5 group-hover:opacity-100 transition-all duration-500" />}
  </div>
);

export default AdminDashboard;
