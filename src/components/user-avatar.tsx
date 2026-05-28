"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getUserAvatar } from "@/lib/user-avatar";

function initials(name?: string) {
  return name?.trim().slice(0, 2).toUpperCase() || "SC";
}

const sizes = {
  sm: { wrapper: "h-8 w-8 text-xs", image: 32 },
  md: { wrapper: "h-10 w-10 text-sm", image: 40 },
  lg: { wrapper: "h-14 w-14 text-base", image: 56 },
};

export function UserAvatar({
  seed,
  name,
  size = "md",
  className,
}: {
  seed?: string | number | null;
  name?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const selectedSize = sizes[size];

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-emerald-100 font-black text-emerald-900 shadow-md ring-2 ring-emerald-400/35 dark:border-slate-900 dark:bg-emerald-950 dark:text-emerald-100",
        selectedSize.wrapper,
        className,
      )}
      title={name ?? "User avatar"}
    >
      {failed ? (
        <span>{initials(name ?? undefined)}</span>
      ) : (
        <Image
          src={getUserAvatar(seed ?? name)}
          alt={`${name ?? "User"} avatar`}
          width={selectedSize.image}
          height={selectedSize.image}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
