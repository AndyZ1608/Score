"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useSession } from "@/components/providers";
import { UserAvatar } from "@/components/user-avatar";
import { AVATAR_COUNT, getAvatarPathById, getFallbackAvatarId, isValidAvatarId } from "@/lib/user-avatar";

export function AvatarPicker({
  userId,
  username,
  avatarId,
  size = "md",
}: {
  userId: string;
  username: string;
  avatarId?: number | null;
  size?: "sm" | "md" | "lg";
}) {
  const { refresh } = useSession();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(isValidAvatarId(avatarId) ? avatarId : getFallbackAvatarId(userId ?? username));
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSelected(isValidAvatarId(avatarId) ? avatarId : getFallbackAvatarId(userId ?? username));
  }, [avatarId, userId, username]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function chooseAvatar(nextAvatarId: number) {
    if (!isValidAvatarId(nextAvatarId)) return;
    setSaving(nextAvatarId);
    setError(null);
    const response = await fetch("/api/users/me/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarId: nextAvatarId }),
    });
    const body = await response.json().catch(() => ({}));
    setSaving(null);

    if (!response.ok) {
      setError(body.error || "Unable to update avatar.");
      return;
    }

    setSelected(nextAvatarId);
    await refresh();
    setOpen(false);
    toast.success("Avatar updated.");
  }

  return (
    <>
      <button
        type="button"
        aria-label="Change avatar"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950"
      >
        <UserAvatar user={{ id: userId, username, avatarId: selected }} size={size} />
      </button>

      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" onMouseDown={() => setOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="avatar-picker-title"
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-white p-6 text-slate-950 shadow-2xl dark:bg-slate-900 dark:text-white"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="avatar-picker-title" className="text-2xl font-black">Choose your avatar</h2>
                <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">Pick one of the available Score avatars.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-200 px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
                Close
              </button>
            </div>

            {error && <p className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-400/40 dark:bg-red-400/10 dark:text-red-100">{error}</p>}

            <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {Array.from({ length: AVATAR_COUNT }, (_, index) => index + 1).map((nextAvatarId) => {
                const isSelected = selected === nextAvatarId;
                return (
                  <button
                    key={nextAvatarId}
                    type="button"
                    aria-label={`Choose avatar ${nextAvatarId}`}
                    disabled={saving !== null}
                    onClick={() => chooseAvatar(nextAvatarId)}
                    className={`relative aspect-square rounded-full border bg-white p-1 shadow-sm transition hover:scale-105 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-950 ${
                      isSelected ? "border-white ring-4 ring-emerald-400" : "border-slate-200 dark:border-slate-700"
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
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
