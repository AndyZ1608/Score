"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers";
import { AVATAR_COUNT, getAvatarPathById, getFallbackAvatarId, isValidAvatarId } from "@/lib/user-avatar";

export function AvatarPicker({
  userId,
  username,
  avatarId,
}: {
  userId: string;
  username: string;
  avatarId?: number | null;
}) {
  const { refresh } = useSession();
  const [selected, setSelected] = useState(isValidAvatarId(avatarId) ? avatarId : getFallbackAvatarId(userId ?? username));
  const [saving, setSaving] = useState<number | null>(null);

  async function chooseAvatar(nextAvatarId: number) {
    if (!isValidAvatarId(nextAvatarId)) return;
    setSaving(nextAvatarId);
    const response = await fetch("/api/users/me/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarId: nextAvatarId }),
    });
    const body = await response.json().catch(() => ({}));
    setSaving(null);

    if (!response.ok) {
      toast.error(body.error || "Unable to update avatar.");
      return;
    }

    setSelected(nextAvatarId);
    await refresh();
    toast.success("Avatar updated.");
  }

  return (
    <section className="rounded-2xl border border-emerald-500/25 bg-slate-950/80 p-5 shadow-lg shadow-emerald-950/20">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Choose your avatar</h2>
          <p className="text-sm font-medium text-emerald-100">Pick one of the local Score avatars. Your choice is saved after refresh.</p>
        </div>
        <span className="text-sm font-bold text-lime-300">Selected: #{selected}</span>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-10">
        {Array.from({ length: AVATAR_COUNT }, (_, index) => index + 1).map((nextAvatarId) => {
          const isSelected = selected === nextAvatarId;
          return (
            <button
              key={nextAvatarId}
              type="button"
              aria-label={`Choose avatar ${nextAvatarId}`}
              disabled={saving !== null}
              onClick={() => chooseAvatar(nextAvatarId)}
              className={`relative aspect-square rounded-full border-2 bg-slate-900 p-1 shadow-md transition hover:scale-105 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
                isSelected ? "border-white ring-4 ring-emerald-400" : "border-slate-700"
              }`}
            >
              <Image
                src={getAvatarPathById(nextAvatarId)}
                alt={`Avatar ${nextAvatarId}`}
                width={64}
                height={64}
                className="h-full w-full rounded-full object-cover"
              />
              {saving === nextAvatarId && <span className="absolute inset-0 rounded-full bg-slate-950/50" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
