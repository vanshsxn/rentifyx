import React from "react";
import { Siren, CheckCircle2, Lock, Clock } from "lucide-react";

// Standard function components are less likely to trigger "smart" compiler hooks
export function EmergencyBadge() {
  return (
    <div className="inline-flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-md shadow-md animate-pulse">
      <Siren size={12} strokeWidth={3} />
      <span className="text-[9px] font-black uppercase tracking-widest">Emergency</span>
    </div>
  );
}

export function AvailabilityPill({ status }: { status?: string | null }) {
  // We use the data FROM Supabase here
  const val = (status || "available").toLowerCase();

  if (val === "booked" || val === "unavailable") {
    return (
      <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-md">
        <Lock size={12} strokeWidth={2} />
        <span className="text-[9px] font-black uppercase tracking-widest">Booked</span>
      </div>
    );
  }

  if (val === "pending") {
    return (
      <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-md">
        <Clock size={12} strokeWidth={2} />
        <span className="text-[9px] font-black uppercase tracking-widest">Pending</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-md">
      <CheckCircle2 size={12} strokeWidth={2} />
      <span className="text-[9px] font-black uppercase tracking-widest">Available</span>
    </div>
  );
}