import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(256) });

export async function POST(request: Request) {
  const input = loginSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Email dan password tidak valid." }, { status: 400 });

  const email = input.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  const validPassword = user?.passwordHash ? await bcrypt.compare(input.data.password, user.passwordHash) : false;
  if (!user || !validPassword || user.isBanned) return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });

  const token = await createSessionToken({ userId: user.id, email: user.email, role: user.role });
  if (user.role !== "USER") await audit(user.id, "LOGIN", "User", user.id, { email: user.email, role: user.role });
  const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}
