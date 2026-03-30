import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, Users, Shield, Search, Loader2, Trash2, Star, TrendingUp, BarChart3 
} from "lucide-react";
import { toast } from "sonner";

interface PropertyRow {
  id: string;
  title: string;
  area: string;
  rent: number;
  rating: number;
  image_url: string | null;
  landlord_id: string;
}

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  role: 'landlord' | 'tenant' | 'admin';
  created_at: string;
}

const AdminDashboard = () => {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'properties' | 'users'>('properties');
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: props } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      setProperties((props as PropertyRow[]) || []);
      setUsers((profiles as UserRow[]) || []);
    } catch (error) {
      toast.error("Database sync failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Advanced Analytics & Trends
  const analytics = useMemo(() => {
    const total = properties.length;
    const avg = total ? (properties.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total) : 0;
    
    // Calculate rating distribution for the trend bar
    const highRated = properties.filter(p => p.rating >= 4.5).length;
    const midRated = properties.filter(p => p.rating >= 3.0 && p.rating < 4.5).length;
    const lowRated = properties.filter(p => p.rating < 3.0).length;

    return {
      avg: avg.toFixed(1),
      highPct: total ? (highRated / total) * 100 : 0,
      midPct: total ? (midRated / total) * 100 : 0,
      lowPct: total ? (lowRated / total) * 100 : 0,
      landlords: users.filter(u => u.role?.toLowerCase().trim() === 'landlord').length,
      tenants: users.filter(u => u.role?.toLowerCase().trim() === 'tenant').length,
    };
  }, [properties, users]);

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm("Permanent delete?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (!error) {
      toast.success("Property removed");
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
            <Shield className="w-10 h-10 text-primary" />
            Control Center
          </h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-green-500" /> Platform Rating Trend: <span className="text-foreground">{analytics.avg}/5.0</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={`Filter ${tab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-2xl text-[11px] font-bold uppercase w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="bg-secondary p-1 rounded-2xl flex border border-border">
            <button onClick={() => setTab('properties')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tab === 'properties' ? 'bg-background shadow-lg text-primary' : 'opacity-40'}`}>Units</button>
            <button onClick={() => setTab('users')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tab === 'users' ? 'bg-background shadow-lg text-primary' : 'opacity-40'}`}>Users</button>
          </div>
        </div>
      </div>

      {/* ANALYTICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Live Units" value={properties.length} sub="Active listings" icon={Building2} />
        
        {/* Rating Trend Card */}
        <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-yellow-500 transition-colors">Rating Trend</p>
              <p className="text-4xl font-black tracking-tighter mb-2">{analytics.avg}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[8px] font-black uppercase opacity-60">
                <span>Quality Distribution</span>
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

        <StatCard label="Total Landlords" value={analytics.landlords} sub="Supply side" icon={Users} />
        <StatCard label="Total Tenants" value={analytics.tenants} sub="Demand side" icon={Shield} />
      </div>

      {/* DATA TABLE */}
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Syncing Database...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary/30 border-b border-border">
                <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <th className="px-8 py-5">Property / Location</th>
                  <th className="px-8 py-5">Rating Trend</th>
                  <th className="px-8 py-5">Rent</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold uppercase">
                {tab === 'properties' ? (
                  filteredProperties.map(p => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <img src={p.image_url || "/placeholder.jpg"} className="w-12 h-12 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                          <div>
                            <p className="tracking-tight">{p.title}</p>
                            <p className="text-[8px] opacity-40 lowercase font-medium">{p.area}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-500/20">
                             <Star className="w-3 h-3 fill-yellow-500" />
                             <span className="font-black text-[10px]">{p.rating || "5.0"}</span>
                           </div>
                           {/* Small Micro-Trend Visualizer */}
                           <div className="flex gap-0.5 items-end h-4 w-12">
                              {[0.4, 0.7, 0.5, 0.9, p.rating / 5].map((h, i) => (
                                <div key={i} className={`w-1 rounded-full ${p.rating >= 4 ? 'bg-green-500/40' : 'bg-yellow-500/40'}`} style={{ height: `${h * 100}%` }} />
                              ))}
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-primary font-black">₹{p.rent.toLocaleString()}</td>
                      <td className="px-8 py-4 text-right">
                        <button onClick={() => handleDeleteProperty(p.id)} className="p-3 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* User rendering logic here */
                  null
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
  <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm hover:border-primary/30 transition-all group relative overflow-hidden">
    <div className="relative z-10">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 group-hover:text-primary transition-colors">{label}</p>
      <p className="text-4xl font-black tracking-tighter mb-1">{value || 0}</p>
      <p className="text-[8px] font-bold uppercase text-muted-foreground/50">{sub}</p>
    </div>
    {Icon && <Icon className="absolute -bottom-2 -right-2 w-20 h-20 text-muted-foreground/5 opacity-5 group-hover:opacity-100 transition-all duration-500" />}
  </div>
);

export default AdminDashboard;