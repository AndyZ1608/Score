"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getUserAvatarPath } from "@/lib/user-avatar";

function initials(name?: string) {
  return name?.trim().slice(0, 2).toUpperCase() || "SC";
}

const sizes = {
  sm: { wrapper: "h-8 w-8 text-xs", image: 32 },
  md: { wrapper: "h-10 w-10 text-sm", image: 40 },
  lg: { wrapper: "h-14 w-14 text-base", image: 56 },
};

export function UserAvatar({
  user,
  seed,
  name,
  avatarId,
  size = "md",
  className,
}: {
  user?: { id?: string | number | null; username?: string | null; avatarId?: number | null };
  seed?: string | number | null;
  name?: string | null;
  avatarId?: number | null;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const selectedSize = sizes[size];
  const avatarUser = user ?? { id: seed, username: name, avatarId };
  const displayName = avatarUser.username ?? name;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-emerald-100 font-black text-emerald-900 shadow-md ring-2 ring-emerald-400/35 dark:border-slate-900 dark:bg-emerald-950 dark:text-emerald-100",
        selectedSize.wrapper,
        className,
      )}
      title={displayName ?? "User avatar"}
    >
      {failed ? (
        <span>{initials(displayName ?? undefined)}</span>
      ) : (
        <Image
          src={getUserAvatarPath(avatarUser)}
          alt={`${displayName ?? "User"} avatar`}
          width={selectedSize.image}
          height={selectedSize.image}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
