import { Skeleton } from "@/components/ui/skeleton";

export function AdminTabSkeleton({
  type = "table",
  cardCount = 4,
}: {
  type?: "table" | "grid" | "form" | "overview";
  cardCount?: number;
}) {
  return (
    <div className="space-y-6 animate-pulse p-1 sm:p-2">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 bg-muted/60" />
          <Skeleton className="h-7 w-64 bg-muted/80" />
          <Skeleton className="h-4 w-96 max-w-full bg-muted/40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 bg-muted/60" />
          <Skeleton className="h-9 w-32 bg-primary/20" />
        </div>
      </div>

      {/* KPI Stats / Metric Cards */}
      {cardCount > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: cardCount }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border/50 bg-card/60 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-20 bg-muted/60" />
                <Skeleton className="h-7 w-7 rounded-lg bg-muted/40" />
              </div>
              <Skeleton className="h-7 w-16 bg-muted/80" />
              <Skeleton className="h-3 w-28 bg-muted/40" />
            </div>
          ))}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 rounded-xl border border-border/40 bg-card/40">
        <Skeleton className="h-9 w-full sm:w-80 bg-muted/50 rounded-lg" />
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Skeleton className="h-9 w-24 bg-muted/40 rounded-lg" />
          <Skeleton className="h-9 w-28 bg-muted/40 rounded-lg" />
        </div>
      </div>

      {/* Main Content Area: Table / Grid / Form */}
      {type === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border/50 bg-card/60 p-4 space-y-3">
              <Skeleton className="h-36 w-full rounded-lg bg-muted/50" />
              <Skeleton className="h-5 w-3/4 bg-muted/70" />
              <Skeleton className="h-3.5 w-full bg-muted/40" />
              <Skeleton className="h-3.5 w-2/3 bg-muted/40" />
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <Skeleton className="h-4 w-16 bg-muted/50" />
                <Skeleton className="h-7 w-20 bg-muted/60 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : type === "form" ? (
        <div className="rounded-xl border border-border/50 bg-card/60 p-6 space-y-5 max-w-3xl">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 bg-muted/60" />
            <Skeleton className="h-10 w-full bg-muted/40 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-muted/60" />
            <Skeleton className="h-28 w-full bg-muted/40 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-muted/60" />
              <Skeleton className="h-10 w-full bg-muted/40 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-muted/60" />
              <Skeleton className="h-10 w-full bg-muted/40 rounded-lg" />
            </div>
          </div>
        </div>
      ) : (
        /* Table Skeleton */
        <div className="rounded-xl border border-border/50 bg-card/60 overflow-hidden">
          <div className="p-3 bg-muted/30 border-b border-border/50 flex items-center justify-between">
            <Skeleton className="h-4 w-32 bg-muted/60" />
            <Skeleton className="h-4 w-20 bg-muted/50" />
          </div>
          <div className="divide-y divide-border/30">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton className="h-9 w-9 rounded-full bg-muted/50 shrink-0" />
                  <div className="space-y-1.5 min-w-0">
                    <Skeleton className="h-4 w-40 max-w-full bg-muted/70" />
                    <Skeleton className="h-3 w-28 max-w-full bg-muted/40" />
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                  <Skeleton className="h-6 w-16 rounded-full bg-muted/40" />
                  <Skeleton className="h-6 w-20 rounded-full bg-muted/40" />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Skeleton className="h-8 w-8 rounded-lg bg-muted/40" />
                  <Skeleton className="h-8 w-8 rounded-lg bg-muted/40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
