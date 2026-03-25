import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building2, Users, Shield, Eye, Trash2, 
  UserRound, UserCheck, Search, Loader2, X 
} from "lucide-react";
import { toast } from "sonner";

interface PropertyRow {
  id: string;
  title: string;
  area: string;
  rent: number;
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
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    const { data: props } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setProperties((props as PropertyRow[]) || []);
    setUsers((profiles as UserRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm("Delete this property permanently?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (!error) {
      toast.success("Property removed");
      setProperties(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Delete this user and all their data?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (!error) {
      toast.success("User deleted");
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  // --- Filtering Logic ---
  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Platform Control</h1>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Master Administrator Access</p>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder={`Search ${tab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-2xl text-[11px] font-bold uppercase w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="bg-secondary p-1 rounded-2xl flex border border-border">
            <button onClick={() => {setTab('properties'); setSearchQuery("");}} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tab === 'properties' ? 'bg-background shadow-lg text-primary' : 'opacity-40'}`}>Units</button>
            <button onClick={() => {setTab('users'); setSearchQuery("");}} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tab === 'users' ? 'bg-background shadow-lg text-primary' : 'opacity-40'}`}>Users</button>
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Listings" value={properties.length} sub="Live properties" />
        <StatCard label="Landlords" value={users.filter(u=>u.role==='landlord').length} sub="Verified hosts" />
        <StatCard label="Tenants" value={users.filter(u=>u.role==='tenant').length} sub="Active seekers" />
        <StatCard label="Coverage" value={new Set(properties.map(p=>p.area)).size} sub="Targeted areas" />
      </div>

      {/* User Role Filters (Only show on Users Tab) */}
      {tab === 'users' && (
        <div className="flex gap-2">
          {['all', 'landlord', 'tenant'].map((r) => (
            <button 
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border transition-all ${roleFilter === r ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:border-primary'}`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Syncing Database...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-secondary/30 border-b border-border">
                <tr className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <th className="px-8 py-5">{tab === 'properties' ? 'Listing Details' : 'Identity'}</th>
                  <th className="px-8 py-5">{tab === 'properties' ? 'Location' : 'Status'}</th>
                  <th className="px-8 py-5">{tab === 'properties' ? 'Revenue' : 'Joined'}</th>
                  <th className="px-8 py-5 text-right">Control</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold uppercase">
                {tab === 'properties' ? (
                  filteredProperties.map(p => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors group">
                      <td className="px-8 py-4 flex items-center gap-4">
                        <img src={p.image_url || ""} className="w-12 h-12 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                        <span className="tracking-tight">{p.title}</span>
                      </td>
                      <td className="px-8 py-4 text-muted-foreground">{p.area}</td>
                      <td className="px-8 py-4 text-primary font-black">₹{p.rent.toLocaleString()}</td>
                      <td className="px-8 py-4 text-right">
                        <button onClick={() => handleDeleteProperty(p.id)} className="p-3 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                      <td className="px-8 py-4">
                        <p className="font-black tracking-tight">{u.full_name || 'Incognito User'}</p>
                        <p className="text-[9px] text-muted-foreground lowercase font-medium">{u.email}</p>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full text-[8px] border ${u.role === 'landlord' ? 'bg-blue-500/5 border-blue-500/20 text-blue-600' : 'bg-green-500/5 border-green-500/20 text-green-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-8 py-4 text-right">
                        <button onClick={() => handleDeleteUser(u.id)} className="p-3 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {(tab === 'properties' ? filteredProperties : filteredUsers).length === 0 && (
              <div className="py-20 text-center text-[10px] font-black uppercase text-muted-foreground tracking-widest">No results found for "{searchQuery}"</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub }: any) => (
  <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm hover:border-primary/30 transition-all group">
    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 group-hover:text-primary transition-colors">{label}</p>
    <p className="text-4xl font-black tracking-tighter mb-1">{value}</p>
    <p className="text-[8px] font-bold uppercase text-muted-foreground/50">{sub}</p>
  </div>
);

export default AdminDashboard;