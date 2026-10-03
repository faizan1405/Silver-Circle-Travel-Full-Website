import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const inputCls =
  "w-full rounded-xl border border-border bg-card px-4 py-3 text-base text-navy-deep outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-muted-foreground/70 focus:border-navy focus:ring-4 focus:ring-navy/10 disabled:opacity-60";

export const labelCls = "mb-1.5 block text-sm font-semibold text-navy-deep";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:bg-navy-deep hover:shadow-lift disabled:pointer-events-none disabled:opacity-60";

export const btnOutline =
  "inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-navy-deep transition-all duration-300 hover:border-navy/40 hover:bg-secondary disabled:pointer-events-none disabled:opacity-60";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground transition-all duration-300 hover:opacity-90 disabled:pointer-events-none disabled:opacity-60";

export const iconBtn =
  "inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors duration-300 hover:bg-secondary hover:text-navy-deep";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-border bg-card shadow-soft", className)}>{children}</div>;
}

export function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-destructive">{message}</p>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Panel className="p-8 text-center">
      <p className="font-display text-2xl text-navy-deep">{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className={cn(btnOutline, "mt-5")}>
          Try again
        </button>
      ) : null}
    </Panel>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Panel className="px-6 py-14 text-center">
      <p className="font-display text-3xl text-navy-deep">{title}</p>
      {children ? <div className="mt-3 text-muted-foreground">{children}</div> : null}
    </Panel>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Panel className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
    </Panel>
  );
}

const STATUS_STYLES: Record<string, string> = {
  New: "bg-gold/25 text-navy-deep",
  Contacted: "bg-navy/10 text-navy",
  Converted: "bg-sage/20 text-navy-deep",
  Closed: "bg-muted text-muted-foreground",
  Active: "bg-sage/20 text-navy-deep",
  Inactive: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", STATUS_STYLES[status] ?? "bg-muted")}>
      {status}
    </span>
  );
}

export function adminHead(title: string) {
  return {
    meta: [
      { title: `${title} | Silver Circle Travel Admin` },
      { name: "description", content: "Silver Circle Travel administration." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  };
}

export function formatDate(value: string, withTime = false) {
  const d = new Date(value);
  return d.toLocaleString("en-IN", withTime
    ? { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }
    : { day: "numeric", month: "short", year: "numeric" });
}

export function formatTravelDate(value: string) {
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [y, m] = value.split("-").map(Number);
    return new Date(y ?? 2000, (m ?? 1) - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  }
  return value || "—";
}
