import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact "21–40 of 1,098 · ‹ 2 / 55 ›" footer used by long console lists. */
export function ConsolePager({
  page,
  pageCount,
  total,
  pageSize,
  onPage,
  isAr,
  className,
}: {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
  isAr: boolean;
  className?: string;
}) {
  if (total <= pageSize) return null;
  const nf = new Intl.NumberFormat(isAr ? "ar-SA-u-nu-latn" : "en-US");
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const Prev = isAr ? ChevronRight : ChevronLeft;
  const Next = isAr ? ChevronLeft : ChevronRight;
  const btn =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--console-hairline)] bg-card text-foreground transition-colors hover:bg-[var(--console-canvas)] focus-visible:outline-2 focus-visible:outline-ring active:scale-95 disabled:pointer-events-none disabled:opacity-40";
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-muted-foreground",
        className,
      )}
    >
      <span className="tabular-nums">
        {isAr
          ? `${nf.format(from)}–${nf.format(to)} من ${nf.format(total)}`
          : `${nf.format(from)}–${nf.format(to)} of ${nf.format(total)}`}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={btn}
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          aria-label={isAr ? "الصفحة السابقة" : "Previous page"}
        >
          <Prev className="h-4 w-4" />
        </button>
        <span className="min-w-16 text-center font-semibold tabular-nums text-foreground">
          {nf.format(page)} / {nf.format(pageCount)}
        </span>
        <button
          type="button"
          className={btn}
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
          aria-label={isAr ? "الصفحة التالية" : "Next page"}
        >
          <Next className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
