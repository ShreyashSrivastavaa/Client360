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
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-xs font-normal border border-[#eaeaea] bg-white text-[#1a1a1a]",
        className
      )}
    >
      {showDot && (
        <span
          className={cn("w-[6px] h-[6px] rounded-full shrink-0", config.dotClass)}
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
      className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.21px] border border-[#eaeaea] bg-[#f7f7f7] text-[#6f6f6f]"
    >
      {normalized}
    </span>
  );
}
