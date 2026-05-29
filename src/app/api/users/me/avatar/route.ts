import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvatarPathById, isValidAvatarId } from "@/lib/user-avatar";

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const avatarId = body?.avatarId;
  if (!isValidAvatarId(avatarId)) {
    return NextResponse.json({ error: "Invalid avatarId. Must be an integer between 1 and 20." }, { status: 400 });
  }

  await prisma.user.update({ where: { id: session.userId }, data: { avatarId } });
  session.avatarId = avatarId;
  await session.save();

  return NextResponse.json({
    success: true,
    avatarId,
    avatarUrl: getAvatarPathById(avatarId),
  });
}
