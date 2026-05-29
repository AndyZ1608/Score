"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { formatMatchDateTime } from "@/lib/date-format";

const DELETE_USER_TITLE = "X\u00f3a user?";
const DELETE_USER_BODY =
  "B\u1ea1n c\u00f3 ch\u1eafc ch\u1eafn mu\u1ed1n x\u00f3a user n\u00e0y kh\u00f4ng? H\u00e0nh \u0111\u1ed9ng n\u00e0y s\u1ebd x\u00f3a to\u00e0n b\u1ed9 prediction c\u1ee7a user v\u00e0 kh\u00f4ng th\u1ec3 ho\u00e0n t\u00e1c.";
const DELETE_PREDICTIONS_LABEL = "Predictions s\u1ebd b\u1ecb x\u00f3a:";

export interface AdminUserRow {
  id: string;
  username: string;
  avatarId?: number | null;
  createdAt: string | Date;
  predictionCount: number;
  totalPoints: number;
  exactScores: number;
  correctResults: number;
}

export function AdminUsersList({ initialUsers }: { initialUsers: AdminUserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [confirming, setConfirming] = useState<AdminUserRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteUser() {
    if (!confirming) return;
    setDeleting(true);
    setError(null);
    const response = await fetch(`/api/admin/users/${confirming.id}`, { method: "DELETE" });
    const body = await response.json().catch(() => ({}));
    setDeleting(false);

    if (!response.ok) {
      setError(body.error || "Unable to delete user.");
      return;
    }

    setUsers((current) => current.filter((user) => user.id !== confirming.id));
    toast.success(`Deleted user ${body.deletedUsername}. Predictions deleted: ${body.deletedPredictions}.`);
    setConfirming(null);
  }

  return (
    <>
      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-900/95 p-8 text-center text-slate-300">No regular users found.</div>
        ) : (
          users.map((user) => (
            <article key={user.id} className="rounded-2xl border border-slate-700 bg-slate-900/95 p-4 text-white shadow-lg shadow-slate-950/30">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="flex min-w-0 items-center gap-4">
                  <UserAvatar user={{ id: user.id, username: user.username, avatarId: user.avatarId }} size="md" />
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black text-white">{user.username}</h2>
                    <p className="text-sm font-medium text-slate-300">Created: {formatMatchDateTime(user.createdAt)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setConfirming(user);
                  }}
                  className="bg-red-600 font-black text-white hover:bg-red-500"
                >
                  Delete user
                </Button>
              </div>
              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
                <Metric label="Predictions" value={user.predictionCount} />
                <Metric label="Total points" value={user.totalPoints} />
                <Metric label="Exact scores" value={user.exactScores} />
                <Metric label="Correct results" value={user.correctResults} />
              </div>
            </article>
          ))
        )}
      </div>

      {confirming && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-user-title" className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 text-white shadow-2xl">
            <h2 id="delete-user-title" className="text-2xl font-black text-white">{DELETE_USER_TITLE}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">{DELETE_USER_BODY}</p>
            <div className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-100">
              <p><strong>Username:</strong> {confirming.username}</p>
              <p><strong>{DELETE_PREDICTIONS_LABEL}</strong> {confirming.predictionCount}</p>
            </div>
            {error && <p className="mt-4 rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-sm font-semibold text-red-100">{error}</p>}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" disabled={deleting} onClick={() => setConfirming(null)} className="border-slate-600 bg-slate-950 text-white hover:bg-slate-800">
                Cancel
              </Button>
              <Button type="button" disabled={deleting} onClick={deleteUser} className="bg-red-600 font-black text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300">
                {deleting ? "Deleting..." : "Yes, delete user"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}
