import React from "react";
import { Siren, CheckCircle2, Lock, HelpCircle } from "lucide-react";

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
  
  // Use a switch or a direct mapping to ensure React components are stable
  const getStatusData = (statusStr: string) => {
    switch (statusStr) {
      case "booked":
        return { 
          label: "Booked", 
          cls: "bg-amber-500/10 text-amber-600 border-amber-500/30", 
          Icon: Lock 
        };
      case "unavailable":
        return { 
          label: "Unavailable", 
          cls: "bg-zinc-500/10 text-zinc-600 border-zinc-500/30", 
          Icon: Lock 
        };
      case "available":
      default:
        return { 
          label: "Available", 
          cls: "bg-green-500/10 text-green-600 border-green-500/30", 
          Icon: CheckCircle2 
        };
    }
  };

  const { label, cls, Icon } = getStatusData(s);

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${cls}`}>
      {Icon && <Icon className="w-3 h-3" />} 
      <span>{label}</span>
    </span>
  );
};