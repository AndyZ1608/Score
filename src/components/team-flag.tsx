/* eslint-disable @next/next/no-img-element */
import { getTeamFlagInfo } from "@/lib/team-flags";
import { cn } from "@/lib/utils";

type TeamFlagProps = {
  teamName: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function TeamFlag({ teamName, className, size = "md" }: TeamFlagProps) {
  const flag = getTeamFlagInfo(teamName);
  const sizeClass = {
    sm: "h-4 w-6 text-[10px]",
    md: "h-5 w-7 text-xs",
    lg: "h-7 w-10 text-sm",
  }[size];

  if (!flag) {
    return (
      <span
        title={`No flag for ${teamName}`}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-sm bg-slate-200 text-slate-600 ring-1 ring-black/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10",
          sizeClass,
          className,
        )}
      >
        <span aria-hidden="true">?</span>
        <span className="sr-only">No flag for {teamName}</span>
      </span>
    );
  }

  return (
    <img
      src={flag.flagUrl}
      alt={`${flag.name} flag`}
      title={`${flag.name} flag`}
      loading="lazy"
      referrerPolicy="no-referrer"
      className={cn("shrink-0 rounded-sm object-cover shadow-sm ring-1 ring-black/10", sizeClass, className)}
    />
  );
}
