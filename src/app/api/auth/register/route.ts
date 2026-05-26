import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  try {
    const user = await prisma.user.create({
      data: { username: parsed.data.username, passwordHash: await hashPassword(parsed.data.password) },
      select: { id: true, username: true, createdAt: true },
    });
    const session = await getSession();
    session.userId = user.id;
    session.username = user.username;
    await session.save();
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create account" }, { status: 500 });
  }
}
