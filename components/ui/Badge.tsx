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
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.badgeClass,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dotClass)}
        />
      )}
      {config.label}
    </span>
  );
}

export function RoleBadge({ role }: { role: string | null | undefined }) {
  const normalized = (role || "member").toLowerCase();
  let badgeColor = "bg-zinc-800 text-zinc-300 border-zinc-700";
  if (normalized === "owner") {
    badgeColor = "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
  } else if (normalized === "admin") {
    badgeColor = "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border",
        badgeColor
      )}
    >
      {normalized}
    </span>
  );
}
