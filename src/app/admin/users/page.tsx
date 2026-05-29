import { AdminTabs } from "@/components/admin-tabs";
import { AdminUsersList } from "@/components/admin-users-list";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    where: { role: "USER", isHidden: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      avatarId: true,
      createdAt: true,
      predictions: {
        select: { totalPoints: true, pointsResult: true, pointsExactScore: true },
      },
    },
  });

  const rows = users.map((user) => ({
    id: user.id,
    username: user.username,
    avatarId: user.avatarId,
    createdAt: user.createdAt.toISOString(),
    predictionCount: user.predictions.length,
    totalPoints: user.predictions.reduce((total, prediction) => total + prediction.totalPoints, 0),
    exactScores: user.predictions.filter((prediction) => prediction.pointsExactScore === 3).length,
    correctResults: user.predictions.filter((prediction) => prediction.pointsResult === 1).length,
  }));

  return (
    <div className="space-y-7 text-white">
      <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-6 shadow-xl">
        <h1 className="text-3xl font-black text-white">Admin Users</h1>
        <p className="mt-2 text-sm font-medium text-slate-300">Delete regular users and their predictions. Admin and hidden accounts are excluded.</p>
      </div>
      <AdminTabs active="users" />
      <AdminUsersList initialUsers={rows} />
    </div>
  );
}
