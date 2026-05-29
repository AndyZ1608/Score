import { Prisma, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMatchDateTime } from "@/lib/date-format";
import { sendTelegramMessage } from "@/lib/telegram";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  try {
    const user = await prisma.user.create({
      data: { username: parsed.data.username, passwordHash: await hashPassword(parsed.data.password), role: UserRole.USER, isHidden: false },
      select: { id: true, username: true, role: true, avatarId: true, createdAt: true },
    });
    const session = await getSession();
    session.userId = user.id;
    session.username = user.username;
    session.role = user.role;
    session.avatarId = user.avatarId;
    await session.save();
    await sendTelegramMessage(`🟢 New Score registration\n👤 Username: ${user.username}\n🕒 Time: ${formatMatchDateTime(user.createdAt)}`);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create account" }, { status: 500 });
  }
}
