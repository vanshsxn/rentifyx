import { useState } from "react";
import { properties, tenantRequests } from "@/data/mockData";
import { Building2, Edit3, Trash2, Check, X, AlertTriangle, Mail, Phone, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const LandlordDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState(tenantRequests);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  // In production this would come from DB filtered by user. For now, show empty for new users.
  const [myProperties] = useState<typeof properties>([]);

  const handleAccept = (id: string) => {
    const req = requests.find((r) => r.id === id);
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "accepted" } : r)));
    setRevealedIds((prev) => [...prev, id]);
    toast.success("Request accepted!", {
      description: `${req?.tenantName}'s contact details are now visible.`,
    });
  };

  const handleReject = (id: string) => {
    const req = requests.find((r) => r.id === id);
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
    toast("Request rejected", {
      description: `${req?.tenantName}'s request for ${req?.propertyTitle} was declined.`,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Landlord Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome, {user?.email?.split("@")[0] ?? "Landlord"}
          </p>
        </div>
      </div>

      {/* My Properties - Empty State */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> My Properties
        </h2>

        {myProperties.length === 0 ? (
          <div className="bg-card border border-border border-dashed rounded-xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No properties yet</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Once the backend is connected, you'll be able to list your properties here and manage tenant requests.
            </p>
            <button className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold transition-opacity hover:opacity-90 active:scale-[0.98]">
              Add Your First Property
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {myProperties.map((p) => (
              <div key={p.id} className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 card-shadow">
                <img src={p.image} alt={p.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{p.title}</h3>
                  <p className="text-xs text-muted-foreground">{p.area} · ¥{p.rent.toLocaleString()}/mo</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Incoming Requests - Empty */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Incoming Requests</h2>
        <div className="bg-card border border-border border-dashed rounded-xl p-10 text-center">
          <p className="text-sm text-muted-foreground">No incoming requests yet. They'll appear here when tenants express interest.</p>
        </div>
      </section>
    </div>
  );
};

export default LandlordDashboard;
