import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isMatchVisibleForActiveProvider } from "@/lib/provider-config";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const match = await prisma.match.findUnique({
    where: { id },
    include: { predictions: { where: { userId: session.userId }, take: 1 } },
  });
  if (!match || !isMatchVisibleForActiveProvider(match)) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  const { predictions, ...detail } = match;
  return NextResponse.json({ match: { ...detail, prediction: predictions[0] ?? null } });
}
