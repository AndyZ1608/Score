import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { formatMatchDateTime } from "@/lib/date-format";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, username: true, role: true } });
  if (!admin || admin.role !== UserRole.ADMIN) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (id === admin.id) return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, username: true, role: true } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.role === UserRole.ADMIN) return NextResponse.json({ error: "Cannot delete admin user" }, { status: 403 });

  const deletedPredictions = await prisma.$transaction(async (tx) => {
    const predictions = await tx.prediction.deleteMany({ where: { userId: target.id } });
    await tx.user.delete({ where: { id: target.id } });
    return predictions.count;
  });

  console.log(`Admin ${admin.username} deleted user ${target.username}, predictions deleted: ${deletedPredictions}`);
  await sendTelegramMessage(`User deleted by admin\nAdmin: ${admin.username}\nDeleted user: ${target.username}\nPredictions deleted: ${deletedPredictions}\nTime: ${formatMatchDateTime(new Date())}`);

  return NextResponse.json({
    success: true,
    deletedUserId: target.id,
    deletedUsername: target.username,
    deletedPredictions,
  });
}
