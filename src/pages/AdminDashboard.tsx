import { trendingAreas, rentAverages, flaggedListings } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertTriangle, Shield } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Analytics and fraud detection center.</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trending Areas */}
        <div className="bg-card border border-border rounded-lg p-5 card-shadow space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Trending Areas
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendingAreas}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="area" tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0 0% 100%)",
                  border: "1px solid hsl(214 32% 91%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="hsl(239 84% 67%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Rent */}
        <div className="bg-card border border-border rounded-lg p-5 card-shadow space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" /> Average Rent by Area
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={rentAverages}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 32% 91%)" />
              <XAxis dataKey="area" tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [`¥${value.toLocaleString()}`, "Avg Rent"]}
                contentStyle={{
                  backgroundColor: "hsl(0 0% 100%)",
                  border: "1px solid hsl(214 32% 91%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="avgRent" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fraud Detection */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-destructive" /> Fraud Detection Center
        </h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden card-shadow">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Listing</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Area</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Rent</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Fraud Score</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Reason</th>
                </tr>
              </thead>
              <tbody>
                {flaggedListings.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.title} className="w-10 h-10 rounded-md object-cover" />
                        <span className="font-medium text-foreground">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.area}</td>
                    <td className="px-4 py-3 text-foreground">¥{item.rent.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                        item.fraudScore >= 8
                          ? "bg-destructive/10 text-destructive"
                          : item.fraudScore >= 6
                          ? "bg-warning/10 text-warning"
                          : "bg-secondary text-muted-foreground"
                      }`}>
                        <AlertTriangle className="w-3 h-3" />
                        {item.fraudScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.fraudReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
