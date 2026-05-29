import { TeamFlag } from "@/components/team-flag";
import { cn } from "@/lib/utils";

export function TeamNameBadge({
  teamName,
  align = "center",
  size = "md",
  className,
}: {
  teamName: string;
  align?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const alignClass = {
    left: "justify-start text-left",
    center: "justify-center text-center",
    right: "justify-end text-right",
  }[align];
  const sizeClass = {
    sm: "gap-2 px-2.5 py-2 text-xs",
    md: "gap-2.5 px-3 py-2.5 text-sm",
    lg: "gap-3 px-4 py-3 text-base sm:text-lg",
  }[size];
  const flagSize = size === "lg" ? "lg" : size === "sm" ? "sm" : "md";

  return (
    <span
      className={cn(
        "inline-flex min-w-0 max-w-full items-center rounded-xl border border-slate-200 bg-white/95 font-semibold text-slate-950 shadow-sm ring-1 ring-black/5 backdrop-blur dark:border-slate-700 dark:bg-slate-950/85 dark:text-white dark:ring-white/10",
        alignClass,
        sizeClass,
        className,
      )}
      title={teamName}
    >
      <TeamFlag teamName={teamName} size={flagSize} />
      <span className="min-w-0 truncate">{teamName}</span>
    </span>
  );
}
