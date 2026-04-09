import { useEffect, useState } from "react";import { supabase } from "@/integrations/supabase/client";import { Building2, Users, Shield, Search, Loader2, Trash2, Star, Save, X, Mail, Calendar}from "lucide-react";import { toast } from "sonner";
interface PropertyRow {id: string;title: string;area: string;rent: number;rating: number;admin_rating: number | null;image_url: string | null;landlord_id: string;}
interface UserRow {id: string;full_name: string | null;email: string | null;created_at: string;}
const AdminDashboard = () => {const [properties, setProperties] = useState<PropertyRow[]>([]);const [users, setUsers] = useState<UserRow[]>([]);const [userRoles, setUserRoles] = useState<Record<string, string>>({});const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);const [tab, setTab] = useState<"properties" | "users">("properties");const [searchQuery, setSearchQuery] = useState("");
  const [editingRating, setEditingRating] = useState<string | null>(null);const [ratingValue, setRatingValue] = useState("");
  const fetchData = async () => {setLoading(true);
    try {const [{ data: props }, { data: profiles }, { data: roles }] = await Promise.all([supabase.from("properties").select("*").order("created_at", { ascending: false }),supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),]);setProperties((props as PropertyRow[]) || []);setUsers((profiles as UserRow[]) || []);
      const roleMap: Record<string, string> = {};(roles || []).forEach((r: any) => { roleMap[r.user_id] = r.role; });setUserRoles(roleMap);} catch (err) {toast.error("Database sync failed");} finally {setLoading(false);}};useEffect(() => { fetchData(); }, []);
  const handleDeleteProperty = async (propertyId: string) => {if (!confirm("Delete this property?")) return;    setIsDeleting(propertyId);
    try {const { error } = await supabase.from("properties").delete().eq("id", propertyId); if (error) throw error;
      toast.success("Property deleted");setProperties(prev => prev.filter(p => p.id !== propertyId));} catch (err: any) {toast.error(err.message);} finally {
      setIsDeleting(null);}};
  const handleDeleteUser = async (userId: string) => {if (!confirm("Delete this user? This may affect their listings.")) return;setIsDeleting(userId);
    try {const { error } = await supabase.from("profiles").delete().eq("id", userId);if (error) throw error;toast.success("User removed");setUsers(prev => prev.filter(u => u.id !== userId));} catch (err: any) {toast.error(err.message);
    } finally {setIsDeleting(null); }};
  const handleSetAdminRating = async (propertyId: string) => {const val = parseFloat(ratingValue);if (isNaN(val) || val < 1 || val > 5) {toast.error("Rating must be 1-5");
      return;}
    const { error } = await supabase.from("properties").update({ admin_rating: val }).eq("id", propertyId);
    if (error) toast.error("Failed to update");
    else {toast.success("Rating updated");setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, admin_rating: val } : p));setEditingRating(null); }  };
  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||p.area.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUsers = users.filter(u =>
    (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||(u.email || "").toLowerCase().includes(searchQuery.toLowerCase())  );
  return (
    <div className="p-4 md:p-8 space-y-8 bg-background min-h-screen font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
            <Shield className="w-8 md:w-10 h-8 md:h-10 text-primary" />
            Control Center
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group flex-1 md:flex-initial">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Filter ${tab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-2xl text-[11px] font-bold uppercase w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="bg-secondary p-1 rounded-2xl flex border border-border">
            <button onClick={() => {setTab("properties"); setSearchQuery("");}} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tab === "properties" ? "bg-background shadow-lg text-primary" : "opacity-40"}`}>Properties</button>
            <button onClick={() => {setTab("users"); setSearchQuery("");}} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tab === "users" ? "bg-background shadow-lg text-primary" : "opacity-40"}`}>Users</button>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Syncing Database...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary/30 border-b border-border">
                <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {tab === "properties" ? (
                    <>
                      <th className="px-6 md:px-8 py-5">Landlord Property</th>
                      <th className="px-6 md:px-8 py-5 text-amber-500">Admin Override</th>
                      <th className="px-6 md:px-8 py-5">Tenant Rating</th>
                      <th className="px-6 md:px-8 py-5">Final Displayed</th>
                      <th className="px-6 md:px-8 py-5 text-right">Action</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 md:px-8 py-5">User Details</th>
                      <th className="px-6 md:px-8 py-5">Role</th>
                      <th className="px-6 md:px-8 py-5">Joined Date</th>
                      <th className="px-6 md:px-8 py-5 text-right">Action</th>
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
                      <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                        <td className="px-6 md:px-8 py-4">
                          <div className="flex items-center gap-4">
                            <img src={p.image_url || "/placeholder.svg"} className="w-10 h-10 rounded-xl object-cover" />
                            <div>
                              <p className="tracking-tight">{p.title}</p>
                              <p className="text-[8px] opacity-40 lowercase font-medium">{p.area}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 md:px-8 py-4">
                          {editingRating === p.id ? (
                            <div className="flex items-center gap-2">
                              <input type="number" step="0.1" value={ratingValue} onChange={(e) => setRatingValue(e.target.value)} className="w-12 bg-background border rounded px-1" autoFocus />
                              <button onClick={() => handleSetAdminRating(p.id)} className="text-primary"><Save className="w-4 h-4"/></button>
                            </div>
                          ) : (
                            <button onClick={() => {setEditingRating(p.id); setRatingValue(p.admin_rating?.toString() || "");}} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                              <Star className="w-3 h-3 fill-amber-500" /> {p.admin_rating?.toFixed(1) || "SET"}
                            </button>
                          )}
                        </td>
                        <td className="px-6 md:px-8 py-4 opacity-50">{p.rating?.toFixed(1) || "0.0"}</td>
                        <td className="px-6 md:px-8 py-4 text-green-600 font-black">{finalRating}</td>
                        <td className="px-6 md:px-8 py-4 text-right">
                          <button onClick={() => handleDeleteProperty(p.id)} disabled={isDeleting === p.id} className="text-destructive p-2 hover:bg-destructive/10 rounded-xl">
                            {isDeleting === p.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                      <td className="px-6 md:px-8 py-4">
                        <div className="flex flex-col">
                          <span className="tracking-tight text-[12px]">{u.full_name || "Anonymous User"}</span>
                          <span className="text-[9px] opacity-40 lowercase flex items-center gap-1 font-medium">
                            <Mail className="w-2.5 h-2.5" /> {u.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 md:px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black border ${userRoles[u.id] === 'admin' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-secondary border-border opacity-60'}`}>
                          {userRoles[u.id] || "User"}
                        </span>
                      </td>
                      <td className="px-6 md:px-8 py-4 opacity-40 font-medium lowercase flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 md:px-8 py-4 text-right">
                        <button onClick={() => handleDeleteUser(u.id)} disabled={isDeleting === u.id} className="text-destructive p-2 hover:bg-destructive/10 rounded-xl">
                          {isDeleting === u.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
                        </button>
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
  );};export default AdminDashboard;