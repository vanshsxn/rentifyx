import React from "react";
import { Siren, CheckCircle2, Lock, Clock } from "lucide-react";

/**
 * STRICLY REACT 18 COMPLIANT
 * This file avoids any 'use' hooks or dynamic context to prevent 
 * build-time transpilation errors.
 */

interface BadgeProps {
  size?: "xs" | "sm" | "md";
}

export const EmergencyBadge = ({ size = "sm" }: BadgeProps) => {
  // Define sizes as a standard object to avoid logic inside the return
  const sizeMap = {
    xs: { container: "text-[8px] px-1.5 py-0.5", icon: 10 },
    sm: { container: "text-[9px] px-2 py-1", icon: 12 },
    md: { container: "text-[10px] px-3 py-1.5", icon: 14 },
  };

  const config = sizeMap[size] || sizeMap.sm;

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-md font-black uppercase tracking-widest bg-red-500 text-white shadow-md ${config.container}`}
    >
      <Siren size={config.icon} strokeWidth={3} />
      <span>Emergency</span>
    </span>
  );
};

export const AvailabilityPill = ({ status }: { status?: string | null }) => {
  // Normalize status safely
  const s = (status || "available").toLowerCase();
  
  // Explicit conditional rendering to avoid 'E.use' transpilation
  if (s === "booked" || s === "unavailable") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border bg-amber-500/10 text-amber-600 border-amber-500/30">
        <Lock size={12} strokeWidth={3} />
        <span>Booked</span>
      </span>
    );
  }

  if (s === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border bg-blue-500/10 text-blue-600 border-blue-500/30">
        <Clock size={12} strokeWidth={3} />
        <span>Pending</span>
      </span>
    );
  }

  // Default: Available
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border bg-green-500/10 text-green-600 border-green-500/30">
      <CheckCircle2 size={12} strokeWidth={3} />
      <span>Available</span>
    </span>
  );
};