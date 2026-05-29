import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
  if (!admin || admin.role !== UserRole.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { role: UserRole.USER, isHidden: false },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      avatarId: true,
      createdAt: true,
      role: true,
      isHidden: true,
      predictions: {
        select: { totalPoints: true, pointsResult: true, pointsExactScore: true },
      },
    },
  });

  return NextResponse.json({
    users: users.map((user) => ({
      id: user.id,
      username: user.username,
      avatarId: user.avatarId,
      createdAt: user.createdAt,
      role: user.role,
      isHidden: user.isHidden,
      predictionCount: user.predictions.length,
      totalPoints: user.predictions.reduce((total, prediction) => total + prediction.totalPoints, 0),
      exactScores: user.predictions.filter((prediction) => prediction.pointsExactScore === 3).length,
      correctResults: user.predictions.filter((prediction) => prediction.pointsResult === 1).length,
    })),
  });
}
