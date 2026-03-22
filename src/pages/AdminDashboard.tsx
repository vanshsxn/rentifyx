import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Users, AlertTriangle, Shield, Phone, Mail, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PropertyRow {
  id: string;
  title: string;
  address: string;
  area: string;
  rent: number;
  image_url: string | null;
  has_vr: boolean;
  vr_url: string | null;
  phone: string | null;
  contact_email: string | null;
  landlord_id: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [properties, setProperties] = useState<PropertyRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
      setProperties((data as PropertyRow[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  // Compute area stats
  const areaStats = properties.reduce((acc, p) => {
    acc[p.area] = (acc[p.area] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const trendingData = Object.entries(areaStats).map(([area, count]) => ({ area, count })).sort((a, b) => b.count - a.count);

  const rentByArea = properties.reduce((acc, p) => {
    if (!acc[p.area]) acc[p.area] = { total: 0, count: 0 };
    acc[p.area].total += Number(p.rent);
    acc[p.area].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);
  const rentData = Object.entries(rentByArea).map(([area, v]) => ({ area, avgRent: Math.round(v.total / v.count) }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor all properties and landlord data.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 card-shadow text-center">
          <Building2 className="w-5 h-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{properties.length}</p>
          <p className="text-xs text-muted-foreground">Total Properties</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 card-shadow text-center">
          <Eye className="w-5 h-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{properties.filter(p => p.has_vr).length}</p>
          <p className="text-xs text-muted-foreground">With VR</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 card-shadow text-center">
          <Users className="w-5 h-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{new Set(properties.map(p => p.landlord_id)).size}</p>
          <p className="text-xs text-muted-foreground">Landlords</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 card-shadow text-center">
          <Shield className="w-5 h-5 mx-auto text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{Object.keys(areaStats).length}</p>
          <p className="text-xs text-muted-foreground">Areas</p>
        </div>
      </div>

      {/* Charts */}
      {trendingData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-5 card-shadow space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Properties by Area</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-lg p-5 card-shadow space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Avg Rent by Area</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={rentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="area" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, "Avg Rent"]} />
                <Bar dataKey="avgRent" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* All Properties Table with Contact Info */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">All Properties (with contact info)</h2>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden card-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Property</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Area</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Rent</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">VR</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Phone</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p) => (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.image_url || "https://via.placeholder.com/40"} alt="" className="w-10 h-10 rounded-md object-cover" />
                          <span className="font-medium text-foreground">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.area}</td>
                      <td className="px-4 py-3 text-foreground">₹{Number(p.rent).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${p.has_vr ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-500"}`}>
                          {p.has_vr ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{p.phone || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{p.contact_email || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
