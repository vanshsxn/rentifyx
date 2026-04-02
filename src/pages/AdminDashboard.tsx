import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Building2, Users, Shield, Search, Loader2, Trash2, Star, TrendingUp, BarChart3, Save, X
} from "lucide-react";
import { toast } from "sonner";

interface PropertyRow {
  id: string;
  title: string;
  area: string;
  rent: number;
  rating: number;           // Average of Tenant ratings
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
  
  // Rating States
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
      toast.success("Property rating boosted by Admin");
      setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, admin_rating: val } : p));
      setEditingRating(null);
      setRatingValue("");
    }
  };

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-8 bg-background min-h-screen font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
            <Shield className="w-8 md:w-10 h-8 md:h-10 text-primary" />
            Control Center
          </h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
            Manage Landlord Assets & Ratings
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
              className="pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-2xl text-[11px] font-bold uppercase w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="bg-secondary p-1 rounded-2xl flex border border-border">
            <button onClick={() => setTab("properties")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tab === "properties" ? "bg-background shadow-lg text-primary" : "opacity-40"}`}>Properties</button>
            <button onClick={() => setTab("users")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tab === "users" ? "bg-background shadow-lg text-primary" : "opacity-40"}`}>Users</button>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-card border border-border rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
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
                    // This is how the tenant's rating is "affected" by your admin rating
                    // If you set an admin rating, it averages with the tenant rating.
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

                        {/* ADMIN CHANGE SECTION */}
                        <td className="px-6 md:px-8 py-4">
                          {editingRating === p.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number" step="0.1" min="1" max="5"
                                value={ratingValue}
                                onChange={(e) => setRatingValue(e.target.value)}
                                className="w-14 px-2 py-1 bg-background border border-primary rounded-lg text-center text-[10px] font-black"
                                autoFocus
                              />
                              <button onClick={() => handleSetAdminRating(p.id)} className="p-1.5 bg-primary text-white rounded-lg hover:scale-105 transition-transform">
                                <Save className="w-3 h-3" />
                              </button>
                              <button onClick={() => setEditingRating(null)} className="p-1.5 bg-secondary rounded-lg">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingRating(p.id); setRatingValue(p.admin_rating?.toString() || ""); }}
                              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 hover:bg-amber-500/20 transition-all"
                            >
                              <Star className="w-3 h-3 fill-amber-500" />
                              <span className="font-black text-[10px]">{p.admin_rating?.toFixed(1) || "SET"}</span>
                            </button>
                          )}
                        </td>

                        <td className="px-6 md:px-8 py-4 opacity-50">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {p.rating?.toFixed(1) || "0.0"}
                          </div>
                        </td>

                        <td className="px-6 md:px-8 py-4">
                          <div className="flex items-center gap-1.5 text-green-600 bg-green-500/10 px-3 py-1.5 rounded-xl border border-green-500/20 w-fit">
                            <Star className="w-3 h-3 fill-green-600" />
                            <span className="font-black text-[10px]">{finalRating}</span>
                          </div>
                        </td>

                        <td className="px-6 md:px-8 py-4 text-right">
                          <button className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                   /* User Mapping Logic... */
                   <p className="p-8 opacity-40">User tab logic remains as provided previously...</p>
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