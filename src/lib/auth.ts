import "server-only";

import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
export { createSessionToken, SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true, email: true, name: true, role: true, isBanned: true } });
  if (!user || user.isBanned) return null;
  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!allowedRoles.includes(user.role)) redirect("/");
  return user;
}
