import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const predictions = await prisma.prediction.findMany({
    where: { userId: session.userId },
    include: { match: true },
    orderBy: { match: { kickoffTime: "asc" } },
  });
  return NextResponse.json({ predictions });
}
