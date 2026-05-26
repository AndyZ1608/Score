import bcrypt from "bcryptjs";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface SessionData {
  userId?: string;
  username?: string;
}

function getSessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error("SESSION_SECRET must be configured with at least 32 characters");
  }
  return {
    password,
    cookieName: "score_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.SESSION_COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}

export async function requireAuth() {
  const session = await getSession();
  if (!session.userId || !session.username) redirect("/login");
  return { userId: session.userId, username: session.username };
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function comparePasswords(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
