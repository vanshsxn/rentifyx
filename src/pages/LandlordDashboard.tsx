import { useState } from "react";
import { properties, tenantRequests, TenantRequest } from "@/data/mockData";
import { Building2, Edit3, Trash2, Eye, EyeOff, Check, X, AlertTriangle, Mail, Phone } from "lucide-react";

const LandlordDashboard = () => {
  const [requests, setRequests] = useState(tenantRequests);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const landlordProperties = properties.filter((p) => p.landlordId === "l1");

  const handleAccept = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "accepted" } : r)));
    setRevealedIds((prev) => [...prev, id]);
  };

  const handleReject = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Landlord Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your properties and tenant requests.</p>
      </div>

      {/* My Properties */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> My Properties
        </h2>
        <div className="grid gap-3">
          {landlordProperties.map((p) => (
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
      </section>

      {/* Incoming Requests */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Incoming Requests</h2>
        <div className="grid gap-3">
          {requests.map((r) => {
            const isRevealed = revealedIds.includes(r.id);
            return (
              <div key={r.id} className="bg-card border border-border rounded-lg p-4 card-shadow space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                      {r.tenantName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{r.propertyTitle} · {r.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.urgent && (
                      <span className="flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-md">
                        <AlertTriangle className="w-3 h-3" /> Urgent
                      </span>
                    )}
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                      r.status === "accepted" ? "bg-success/10 text-success"
                      : r.status === "rejected" ? "bg-destructive/10 text-destructive"
                      : "bg-secondary text-muted-foreground"
                    }`}>
                      {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Contact info */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {isRevealed ? r.tenantEmail : "••••••@••••.com"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {isRevealed ? r.tenantPhone : "+81 ••-••••-••••"}
                  </span>
                </div>

                {/* Actions */}
                {r.status === "pending" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAccept(r.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium gradient-primary text-primary-foreground transition-all hover:opacity-90"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept & Reveal
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default LandlordDashboard;
