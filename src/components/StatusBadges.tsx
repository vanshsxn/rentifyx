import React from "react";
import { Siren, CheckCircle2, Lock, Clock } from "lucide-react";

export const EmergencyBadge = ({ size = "sm" }: { size?: "xs" | "sm" | "md" }) => {
  const cls = 
    size === "xs" ? "text-[8px] px-1.5 py-0.5" : 
    size === "md" ? "text-[10px] px-3 py-1.5" : 
    "text-[9px] px-2 py-1";
    
  return (
    <span className={`inline-flex items-center gap-1 rounded-md font-black uppercase tracking-widest bg-red-500 text-white shadow-md ${cls}`}>
      <Siren className={size === "md" ? "w-3.5 h-3.5" : "w-3 h-3"} /> 
      <span>Emergency</span>
    </span>
  );
};

export const AvailabilityPill = ({ status }: { status?: string | null }) => {
  const s = (status || "available").toLowerCase();
  
  let IconComponent = CheckCircle2;
  let label = "Available";
  let colorCls = "bg-green-500/10 text-green-600 border-green-500/30";

  if (s === "booked") {
    IconComponent = Lock;
    label = "Booked";
    colorCls = "bg-amber-500/10 text-amber-600 border-amber-500/30";
  } else if (s === "unavailable") {
    IconComponent = Lock;
    label = "Unavailable";
    colorCls = "bg-zinc-500/10 text-zinc-600 border-zinc-500/30";
  } else if (s === "pending") {
    IconComponent = Clock;
    label = "Pending";
    colorCls = "bg-blue-500/10 text-blue-600 border-blue-500/30";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${colorCls}`}>
      <IconComponent className="w-3 h-3" />
      <span>{label}</span>
    </span>
  );
};