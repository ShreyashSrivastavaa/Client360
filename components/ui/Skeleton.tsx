import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[4px] bg-[#eaeaea]", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-4 rounded-[8px] border border-[#eaeaea] space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-3 rounded-full" />
      </div>
      <Skeleton className="h-7 w-32" />
      <div className="flex gap-2 items-center pt-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-2">
      <div className="flex gap-4 p-3 border-b border-[#eaeaea] bg-[#f7f7f7]">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 p-3 border-b border-[#e1e1e1]">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white p-4 rounded-[8px] border border-[#eaeaea] space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="h-56 flex items-end gap-2 pt-4 px-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col gap-1 items-center">
            <Skeleton
              className="w-full rounded-[2px]"
              style={{ height: `${20 + ((i * 19) % 70)}%` }}
            />
            <Skeleton className="h-2.5 w-5" />
          </div>
        ))}
      </div>
    </div>
  );
}
