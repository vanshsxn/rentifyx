import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
}

const EmergencyBookingModal = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  const [props, setProps] = useState<any[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      supabase.from("properties").select("id, title, area").limit(50).then(({ data }) => {
        setProps(data || []);
        if (data?.[0]) setPropertyId(data[0].id);
      });
    }
  }, [open]);

  const submit = async () => {
    if (!user || !propertyId) return;
    setSubmitting(true);
    const { error } = await supabase.from("tenant_requests").insert({
      tenant_id: user.id,
      property_id: propertyId,
      message: message || "URGENT: Emergency booking request",
      urgent: true,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit", { description: error.message });
    } else {
      toast.success("🚨 Emergency request sent! Landlord will be notified immediately.");
      onClose();
      setMessage("");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl w-full max-w-md p-7 pointer-events-auto shadow-2xl">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-3">
                    <Zap className="text-red-600 w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800">Emergency Booking</h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">Priority handled within 30 min</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                    Property
                  </label>
                  <select
                    value={propertyId}
                    onChange={e => setPropertyId(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl text-sm font-bold outline-none"
                  >
                    {props.map(p => (
                      <option key={p.id} value={p.id}>{p.title} — {p.area}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">
                    Reason (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Need to move in within 24 hours..."
                    rows={3}
                    className="w-full p-3 bg-slate-50 rounded-xl text-sm outline-none resize-none"
                  />
                </div>
                <button
                  onClick={submit}
                  disabled={submitting || !propertyId}
                  className="w-full py-3.5 bg-red-600 text-white rounded-xl font-black text-sm hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  Send Emergency Request
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmergencyBookingModal;
