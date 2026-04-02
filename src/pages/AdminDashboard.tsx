import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2, Users, Shield, Search, Loader2, Trash2, Star, TrendingUp, Save, X, Globe, Zap, ArrowUpRight
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
  is_featured?: boolean;
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

  const handleDeleteProperty = async (propertyId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this property permanently?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("properties").delete().eq("id", propertyId);

    if (error) {
      toast.error("Delete failed: Check RLS policies");
    } else {
      toast.success("Property removed from database");
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    }
  };

  const handleSetAdminRating = async (propertyId: string) => {
    const val = parseFloat(ratingValue);
    if (isNaN(val) || val < 1 || val > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }
    
    const { error } = await supabase.from("properties").update({ admin_rating: val }).eq("id", propertyId);

    if (error) {
      toast.error("Failed to update rating");
    } else {
      toast.success("Admin rating synchronized");
      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, admin_rating: val } : p));
      setEditingRating(null);
      setRatingValue("");
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from("properties").update({ is_featured: !current }).eq("id", id);
    if (!error) {
      setProperties(prev => prev.map(p => p.id === id ? { ...p, is_featured: !current } : p));
      toast.success(current ? "Removed from Featured" : "Promoted to Featured");
    }
  };

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total Assets", value: properties.length, icon: Building2, color: "text-primary" },
    { label: "Active Users", value: users.length, icon: Users, color: "text-blue-500" },
    { label: "Market Volume", value: `₹${(properties.reduce((acc, curr) => acc + curr.rent, 0) / 100000).toFixed(1)}L`, icon: TrendingUp, color: "text-emerald-500" },
  ];

  return (
    <div className="p-6 md:p-12 space-y-10 bg-background min-h-screen font-sans selection:bg-primary selection:text-white">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-primary">
            <Shield className="w-6 h-6" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Internal Operations</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">
            Admin <span className="text-primary">Console.</span>
          </h1>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder={`Search ${tab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 bg-secondary/50 border border-border/50 rounded-2xl text-[12px] font-bold uppercase w-full focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
          </div>
          <div className="bg-secondary/80 backdrop-blur-md p-1.5 rounded-2xl flex border border-border/50 shadow-inner">
            <button onClick={() => setTab("properties")} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase transition-all ${tab === "properties" ? "bg-background shadow-xl text-primary scale-105" : "opacity-40 hover:opacity-100"}`}>Assets</button>
            <button onClick={() => setTab("users")} className={`px-8 py-3 rounded-xl text-[11px] font-black uppercase transition-all ${tab === "users" ? "bg-background shadow-xl text-primary scale-105" : "opacity-40 hover:opacity-100"}`}>Users</button>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            key={s.label} className="bg-card border border-border/50 p-8 rounded-[2.5rem] shadow-xl space-y-4 hover:border-primary/30 transition-all group"
          >
            <div className={`w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <h3 className="text-3xl font-black italic uppercase tracking-tighter">{s.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MAIN DATA TABLE */}
      <div className="bg-card border border-border/50 rounded-[3rem] overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />
        
        {loading ? (
          <div className="py-32 flex flex-col items-center gap-6">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse">Synchronizing Core...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary/20 border-b border-border/50">
                <tr className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  {tab === "properties" ? (
                    <>
                      <th className="px-10 py-7">Listing Detail</th>
                      <th className="px-10 py-7">Admin Rating</th>
                      <th className="px-10 py-7">User Score</th>
                      <th className="px-10 py-7">Status</th>
                      <th className="px-10 py-7 text-right">Operations</th>
                    </>
                  ) : (
                    <>
                      <th className="px-10 py-7">Account Identity</th>
                      <th className="px-10 py-7">Access Level</th>
                      <th className="px-10 py-7">Onboarding Date</th>
                      <th className="px-10 py-7 text-right">Control</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="text-[12px] font-bold uppercase">
                {tab === "properties" ? (
                  filteredProperties.map((p, i) => (
                    <motion.tr 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      key={p.id} className="border-b border-border/30 hover:bg-primary/[0.02] transition-colors group"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                            <img src={p.image_url || "/placeholder.svg"} className="w-14 h-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all duration-500 shadow-lg" />
                            {p.is_featured && <div className="absolute -top-2 -right-2 bg-primary p-1 rounded-lg shadow-lg"><Zap className="w-3 h-3 text-white fill-white" /></div>}
                          </div>
                          <div className="space-y-1">
                            <p className="text-[14px] font-black tracking-tight group-hover:text-primary transition-colors">{p.title}</p>
                            <p className="text-[9px] text-muted-foreground tracking-widest flex items-center gap-1.5"><Globe className="w-3 h-3" /> {p.area}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-10 py-6">
                        {editingRating === p.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number" step="0.1" min="1" max="5"
                              value={ratingValue}
                              onChange={(e) => setRatingValue(e.target.value)}
                              className="w-16 px-3 py-2 bg-background border-2 border-primary rounded-xl text-center font-black"
                              autoFocus
                            />
                            <button onClick={() => handleSetAdminRating(p.id)} className="p-2 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
                              <Save className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingRating(null)} className="p-2 bg-secondary rounded-xl"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setEditingRating(p.id); setRatingValue(p.admin_rating?.toString() || ""); }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition-all font-black text-[11px]"
                          >
                            <Star className={`w-3.5 h-3.5 ${p.admin_rating ? 'fill-amber-500' : ''}`} />
                            {p.admin_rating?.toFixed(1) || "BOOST"}
                          </button>
                        )}
                      </td>

                      <td className="px-10 py-6 opacity-40">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          {p.rating?.toFixed(1) || "0.0"}
                        </div>
                      </td>

                      <td className="px-10 py-6">
                         <button 
                           onClick={() => toggleFeatured(p.id, p.is_featured || false)}
                           className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest border transition-all ${p.is_featured ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-secondary border-border text-muted-foreground hover:border-primary/50'}`}
                         >
                           {p.is_featured ? "FEATURED" : "STANDARD"}
                         </button>
                      </td>

                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                           <button className="p-2.5 bg-secondary text-muted-foreground hover:text-primary rounded-xl transition-all"><ArrowUpRight className="w-4 h-4" /></button>
                           <button 
                             onClick={() => handleDeleteProperty(p.id)}
                             className="p-2.5 text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  users.map((u, i) => (
                    <motion.tr 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      key={u.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="px-10 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[14px] font-black tracking-tight uppercase italic">{u.full_name || "New Recruit"}</span>
                          <span className="text-[9px] opacity-40 lowercase font-medium tracking-widest">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] ${userRoles[u.id] === 'admin' ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground border border-border'}`}>
                          {userRoles[u.id] || "TENANT"}
                        </span>
                      </td>
                      <td className="px-10 py-6 opacity-40 font-medium text-[10px] tracking-widest">
                        {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button className="text-[10px] font-black text-primary hover:underline underline-offset-4 tracking-widest">EDIT PERMISSIONS</button>
                      </td>
                    </motion.tr>
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

export default AdminDashboard;