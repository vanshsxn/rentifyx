import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { CalendarDays, Check, X, Loader2, Clock, MapPin, MessageSquare, CheckCircle2, XCircle, Hourglass, ArrowRight, Ban } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Visit {
  id: string;
  property_id: string;
  tenant_id: string;
  landlord_id: string;
  requested_at: string;
  status: string;
  notes: string | null;
  landlord_response: string | null;
  property_title?: string;
  property_area?: string;
  other_name?: string;
}

const Visits = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const isLandlord = userRole === "landlord";

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    load();
  }, [user, userRole]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const col = isLandlord ? "landlord_id" : "tenant_id";
    const { data: v } = await supabase.from("scheduled_visits").select("*").eq(col, user.id).order("requested_at", { ascending: false });
    if (!v) { setVisits([]); setLoading(false); return; }

    const propIds = [...new Set(v.map((x) => x.property_id))];
    const otherIds = [...new Set(v.map((x) => (isLandlord ? x.tenant_id : x.landlord_id)))];
    const [{ data: props }, { data: profiles }] = await Promise.all([
      supabase.from("properties").select("id, title, area").in("id", propIds),
      supabase.from("profiles").select("id, full_name, email").in("id", otherIds),
    ]);

    setVisits(v.map((x) => ({
      ...x,
      property_title: props?.find((p) => p.id === x.property_id)?.title,
      property_area: props?.find((p) => p.id === x.property_id)?.area,
      other_name: profiles?.find((p) => p.id === (isLandlord ? x.tenant_id : x.landlord_id))?.full_name || profiles?.find((p) => p.id === (isLandlord ? x.tenant_id : x.landlord_id))?.email,
    })));
    setLoading(false);
  };

  const respond = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("scheduled_visits").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error("Update failed");
    else { toast.success(`Visit ${status}`); load(); }
  };

  const cancelRequest = async (id: string) => {
    if (!window.confirm("Cancel this visit request? The landlord will see it as cancelled.")) return;
    const { error } = await supabase
      .from("scheduled_visits")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error("Could not cancel: " + error.message);
    else { toast.success("Visit request cancelled"); load(); }
  };

  if (loading) return <div className="min-h-[400px] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter italic uppercase flex items-center gap-3">
          <CalendarDays className="w-7 h-7 text-primary" /> Scheduled Visits
        </h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
          {isLandlord ? "Visits requested for your properties" : "Your visit requests"}
        </p>
      </div>

      {visits.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-3xl p-16 text-center">
          <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No visits scheduled yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((v) => (
            <div key={v.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                    v.status === "approved" ? "bg-green-500/10 text-green-600" :
                    v.status === "rejected" ? "bg-red-500/10 text-red-600" :
                    v.status === "cancelled" ? "bg-zinc-500/10 text-zinc-600" :
                    "bg-amber-500/10 text-amber-600"
                  }`}>{v.status}</span>
                  <p className="text-xs font-black">{v.property_title}</p>
                </div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1 flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> {v.property_area}
                  <Clock className="w-3 h-3 ml-2" /> {format(new Date(v.requested_at), "PPp")}
                </p>
                <p className="text-[10px] mt-1">
                  {isLandlord ? "From: " : "Landlord: "}<span className="font-bold">{v.other_name}</span>
                </p>
                {v.notes && <p className="text-[11px] text-muted-foreground italic mt-2">"{v.notes}"</p>}
                {/* Tenant-facing details panel */}
                {!isLandlord && (
                  <div className={`mt-3 p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
                    v.status === "approved" ? "bg-green-500/5 border-green-500/30 text-green-700" :
                    v.status === "rejected" ? "bg-red-500/5 border-red-500/30 text-red-700" :
                    v.status === "cancelled" ? "bg-zinc-500/5 border-zinc-500/30 text-zinc-700" :
                    "bg-amber-500/5 border-amber-500/30 text-amber-700"
                  }`}>
                    {v.status === "approved" ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> :
                     v.status === "rejected" ? <XCircle className="w-4 h-4 mt-0.5 shrink-0" /> :
                     v.status === "cancelled" ? <Ban className="w-4 h-4 mt-0.5 shrink-0" /> :
                     <Hourglass className="w-4 h-4 mt-0.5 shrink-0" />}
                    <div className="space-y-1">
                      <p className="font-black uppercase tracking-widest text-[10px]">
                        {v.status === "approved" ? "Visit confirmed" :
                         v.status === "rejected" ? "Visit declined" :
                         v.status === "cancelled" ? "Request cancelled" :
                         "Awaiting landlord response"}
                      </p>
                      <p className="font-bold">
                        {v.status === "approved" && `Be at ${v.property_area} on ${format(new Date(v.requested_at), "PPpp")}.`}
                        {v.status === "rejected" && `The landlord couldn't accommodate ${format(new Date(v.requested_at), "PPp")}. Try another time.`}
                        {v.status === "cancelled" && `You cancelled this request for ${format(new Date(v.requested_at), "PPp")}.`}
                        {v.status === "pending" && `Requested for ${format(new Date(v.requested_at), "PPpp")} — landlord will respond soon.`}
                      </p>
                      {v.landlord_response && (
                        <p className="flex items-start gap-1.5 mt-1.5 italic opacity-90">
                          <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                          "{v.landlord_response}"
                        </p>
                      )}
                      <Link
                        to={`/property/${v.property_id}`}
                        className="inline-flex items-center gap-1 mt-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                      >
                        View listing <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
              {isLandlord && v.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={() => respond(v.id, "approved")} className="px-4 py-2 rounded-xl bg-green-500 text-white text-[10px] font-black uppercase flex items-center gap-1">
                    <Check className="w-3 h-3" /> Approve
                  </button>
                  <button onClick={() => respond(v.id, "rejected")} className="px-4 py-2 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase flex items-center gap-1">
                    <X className="w-3 h-3" /> Reject
                  </button>
                </div>
              )}
              {!isLandlord && v.status === "pending" && (
                <button
                  onClick={() => cancelRequest(v.id)}
                  className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-red-500 hover:text-white text-zinc-700 text-[10px] font-black uppercase flex items-center gap-1 transition-colors self-start"
                >
                  <Ban className="w-3 h-3" /> Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Visits;