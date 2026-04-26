import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarDays, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  landlordId: string;
  propertyTitle: string;
}

const ScheduleVisitDialog = ({ open, onClose, propertyId, landlordId, propertyTitle }: Props) => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!user) return toast.error("Please sign in");
    if (!date) return toast.error("Pick a date");
    const [h, m] = time.split(":").map(Number);
    const requestedAt = new Date(date);
    requestedAt.setHours(h, m, 0, 0);
    if (requestedAt < new Date()) return toast.error("Pick a future time");

    setSubmitting(true);
    const { error } = await supabase.from("scheduled_visits").insert({
      property_id: propertyId,
      tenant_id: user.id,
      landlord_id: landlordId,
      requested_at: requestedAt.toISOString(),
      notes: notes || null,
    });
    setSubmitting(false);
    if (error) toast.error("Failed: " + error.message);
    else { toast.success("Visit request sent!"); onClose(); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CalendarDays className="w-5 h-5 text-primary" /> Schedule a Visit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">{propertyTitle}</p>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              className={cn("p-3 pointer-events-auto rounded-md border")}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Time</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any specific questions?" className="w-full px-4 py-2 rounded-lg border border-border bg-background text-sm min-h-[60px]" />
          </div>
          <Button onClick={submit} disabled={submitting} className="w-full">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Visit Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleVisitDialog;