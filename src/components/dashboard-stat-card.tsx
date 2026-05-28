import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  emerald: {
    card: "border-emerald-200/80 bg-white/95 shadow-emerald-950/10 dark:border-emerald-500/30 dark:bg-slate-950/90",
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
    accent: "from-emerald-500 to-lime-400",
  },
  amber: {
    card: "border-amber-200/80 bg-white/95 shadow-amber-950/10 dark:border-amber-500/30 dark:bg-slate-950/90",
    icon: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
    accent: "from-amber-500 to-yellow-300",
  },
  sky: {
    card: "border-sky-200/80 bg-white/95 shadow-sky-950/10 dark:border-sky-500/30 dark:bg-slate-950/90",
    icon: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
    accent: "from-sky-500 to-cyan-300",
  },
  rose: {
    card: "border-rose-200/80 bg-white/95 shadow-rose-950/10 dark:border-rose-500/30 dark:bg-slate-950/90",
    icon: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
    accent: "from-rose-500 to-orange-300",
  },
};

export function DashboardStatCard({
  label,
  value,
  description,
  icon: Icon,
  variant,
}: {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  variant: keyof typeof variants;
}) {
  const styles = variants[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 shadow-xl backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl",
        styles.card,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", styles.accent)} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
          <p className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
          <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className={cn("rounded-xl p-3 shadow-sm", styles.icon)}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
