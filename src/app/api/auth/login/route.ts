import { NextResponse } from "next/server";
import { comparePasswords, getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (!user || !(await comparePasswords(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }
  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  await session.save();
  return NextResponse.json({ user: { id: user.id, username: user.username, createdAt: user.createdAt } });
}
