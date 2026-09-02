import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().email().max(254), password: z.string().min(12).max(256) });

export async function POST(request: Request) {
  const input = registerSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Data pendaftaran tidak valid. Password minimal 12 karakter." }, { status: 400 });

  const email = input.data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
  const user = await prisma.user.create({ data: { name: input.data.name, email, passwordHash: await bcrypt.hash(input.data.password, 12) } });
  const token = await createSessionToken({ userId: user.id, email: user.email, role: user.role });
  const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } }, { status: 201 });
  response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}
