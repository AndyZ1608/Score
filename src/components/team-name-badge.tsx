import { Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTeamFlag } from "@/lib/team-flags";

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
  const flag = getTeamFlag(teamName);
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
  const flagClass = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl sm:text-3xl",
  }[size];

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
      {flag ? (
        <span className={cn("shrink-0 leading-none", flagClass)} aria-label={`${teamName} flag`} role="img">
          {flag}
        </span>
      ) : (
        <Globe2 className="h-5 w-5 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden="true" />
      )}
      <span className="min-w-0 truncate">{teamName}</span>
    </span>
  );
}
