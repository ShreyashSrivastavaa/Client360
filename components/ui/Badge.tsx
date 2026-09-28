import React from "react";
import { cn, getClassificationConfig } from "@/lib/utils";

interface ClassificationBadgeProps {
  classification: string | null | undefined;
  className?: string;
  showDot?: boolean;
}

export function ClassificationBadge({
  classification,
  className,
  showDot = true,
}: ClassificationBadgeProps) {
  const config = getClassificationConfig(classification);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[100px] text-[11px] font-mono uppercase tracking-[0.22px] border border-[#e0e0e0] bg-[#ffffff] text-[#272727]",
        className
      )}
    >
      {showDot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotClass)}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}

export function RoleBadge({ role }: { role: string | null | undefined }) {
  const normalized = (role || "member").toLowerCase();

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-[100px] text-[11px] font-mono uppercase tracking-[0.22px] border border-[#e0e0e0] bg-[#f6f6f6] text-[#5d5d5d]"
    >
      {normalized}
    </span>
  );
}

export function StatusPill({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-[100px] text-[11px] font-mono uppercase tracking-[0.22px] border border-[#e0e0e0] bg-[#ffffff] text-[#5d5d5d]",
        className
      )}
    >
      {label}
    </span>
  );
}
