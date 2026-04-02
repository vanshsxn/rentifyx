import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2, Users, Shield, Search, Loader2, Trash2, Star, Save, X, Zap, Mail, Calendar
} from "lucide-react";
import { toast } from "sonner";

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
      // 1. Fetch properties, profiles (users), and roles in parallel
      const [propsRes, profilesRes, rolesRes] = await Promise.all([
        supabase.from("properties").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);

      if (propsRes.error) throw propsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setProperties((propsRes.data as PropertyRow[]) || []);
      setUsers((profilesRes.data as UserRow[]) || []);

      // 2. Map roles to IDs for quick lookup
      const roleMap: Record<string, string> = {};
      (rolesRes.data || []).forEach((r: any) => { 
        roleMap[r.user_id] = r.role; 
      });
      setUserRoles(roleMap);

    } catch (error: any) {
      console.error("Fetch Error:", error);
      toast.error("Database sync failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteProperty = async (propertyId: string) => {
    if (!window.confirm("Are you sure? This action is permanent.")) return;

    const { error } = await supabase.from("properties").delete().eq("id", propertyId);

    if (error) {
      toast.error("Delete failed: Restricted by database policy");
    } else {
      toast.success("Asset Purged");
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    }
  };

  const handleSetAdminRating = async (propertyId: string) => {
    const val = parseFloat(ratingValue);
    if (isNaN(val) || val < 1 || val > 5) {
      toast.error("Rating must be 1-5");
      return;
    }
    
    const { error } = await supabase.from("properties").update({ admin_rating: val }).eq("id", propertyId);

    if (error) {
      toast.error("Update failed");
    } else {
      toast.success("Rating Boosted");
      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, admin_rating: val } : p));
      setEditingRating(null);
    }
  };

  // Improved filtering for both tabs
  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    (u.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (u.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 space-y-10 font-sans selection:bg-primary selection:text-white">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-end gap-6 border-b border-black/5 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.4em]">
            <Shield className="w-4 h-4" /> System Administrator
          </div>
          <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
            Control <span className="text-primary">Center.</span>
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
            Global Asset Management & User Verification
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative group w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={`Search ${tab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-6 py-3.5 bg-white border border-black/5 rounded-2xl text-[11px] font-bold uppercase w-full shadow-sm outline-none focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>

          <div className="bg-white p-1.5 rounded-2xl flex border border-black/5 shadow-sm">
            <button 
              onClick={() => setTab("properties")} 
              className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all ${tab === "properties" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-slate-50"}`}
            >
              Assets
            </button>
            <button 
              onClick={() => setTab("users")} 
              className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all ${tab === "users" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-slate-50"}`}
            >
              Users
            </button>
          </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Assets" value={properties.length} icon={Building2} color="text-blue-600" />
        <StatCard label="Active Recruits" value={users.length} icon={Users} color="text-purple-600" />
        <StatCard label="Premium Picks" value={properties.filter(p => (p.admin_rating || 0) >= 4).length} icon={Zap} color="text-amber-600" />
      </div>

      {/* MAIN DATA TABLE */}
      <div className="bg-white border border-black/5 rounded-[3rem] overflow-hidden shadow-xl min-h-[400px]">
        {loading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Syncing...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-black/5">
                <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                  {tab === "properties" ? (
                    <>
                      <th className="px-10 py-7">Listing Identity</th>
                      <th className="px-10 py-7">Admin Override</th>
                      <th className="px-10 py-7">Metric Score</th>
                      <th className="px-10 py-7 text-right">Action</th>
                    </>
                  ) : (
                    <>
                      <th className="px-10 py-7">User Profile</th>
                      <th className="px-10 py-7">Access Level</th>
                      <th className="px-10 py-7">Registration Date</th>
                      <th className="px-10 py-7 text-right">Status</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold uppercase">
                {tab === "properties" ? (
                  filteredProperties.map(p => {
                    const finalRating = p.admin_rating
                      ? ((p.admin_rating + (p.rating || 0)) / 2).toFixed(1)
                      : (p.rating || 0).toFixed(1);

                    return (
                      <tr key={p.id} className="border-b border-black/[0.03] hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <img src={p.image_url || "/placeholder.svg"} className="w-12 h-12 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all shadow-sm" />
                            <div>
                              <p className="font-black italic tracking-tight">{p.title}</p>
                              <p className="text-[9px] opacity-40 lowercase font-medium">{p.area}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          {editingRating === p.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                autoFocus type="number" step="0.1" value={ratingValue}
                                onChange={(e) => setRatingValue(e.target.value)}
                                className="w-16 px-2 py-2 bg-white border-2 border-primary rounded-xl text-center font-black outline-none"
                              />
                              <button onClick={() => handleSetAdminRating(p.id)} className="p-2 bg-primary text-white rounded-xl shadow-md"><Save className="w-4 h-4" /></button>
                              <button onClick={() => setEditingRating(null)} className="p-2 bg-slate-100 rounded-xl"><X className="w-4 h-4" /></button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingRating(p.id); setRatingValue(p.admin_rating?.toString() || ""); }}
                              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500/5 text-amber-600 border border-amber-500/10 hover:bg-amber-500/10 transition-all font-black"
                            >
                              <Star className={`w-3.5 h-3.5 ${p.admin_rating ? 'fill-amber-500' : ''}`} /> {p.admin_rating?.toFixed(1) || "BOOST"}
                            </button>
                          )}
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 w-fit px-3 py-1.5 rounded-xl border border-emerald-100 font-black">
                            {finalRating}
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button onClick={() => handleDeleteProperty(p.id)} className="p-3 text-destructive hover:bg-destructive/10 rounded-2xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-black/[0.03] hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-black italic tracking-tight">{u.full_name || "Anonymous User"}</p>
                            <p className="text-[9px] opacity-40 lowercase flex items-center gap-1"><Mail className="w-2 h-2" /> {u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest ${userRoles[u.id] === 'admin' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-500'}`}>
                          {userRoles[u.id] || "TENANT"}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-slate-400 font-medium">
                        <div className="flex items-center gap-2 text-[10px]">
                           <Calendar className="w-3 h-3" />
                           {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {!loading && (tab === "properties" ? filteredProperties : filteredUsers).length === 0 && (
              <div className="py-20 text-center text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                No records found matching your query
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Stat Card
const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white border border-black/5 p-8 rounded-[2.5rem] shadow-sm flex items-center justify-between group hover:border-primary/20 transition-all">
    <div>
      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{label}</p>
      <h3 className="text-4xl font-black italic tracking-tighter">{value}</h3>
    </div>
    <div className={`w-14 h-14 bg-slate-50 ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default AdminDashboard;