import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-800/60", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-8 w-36" />
      <div className="flex gap-2 items-center pt-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3">
      <div className="flex gap-4 p-3 border-b border-zinc-800">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 p-4 border-b border-zinc-800/50">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-panel p-6 rounded-xl border border-zinc-800/80 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="h-64 flex items-end gap-3 pt-6 px-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1.5 items-center">
            <Skeleton
              className="w-full rounded-t"
              style={{ height: `${25 + ((i * 17) % 65)}%` }}
            />
            <Skeleton className="h-3 w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}
