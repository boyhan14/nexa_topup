import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";

export async function POST() {
  const user = await getCurrentUser();
  if (user && user.role !== "USER") await audit(user.id, "LOGOUT", "User", user.id);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
