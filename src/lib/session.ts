import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "nexatopup_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;
const roles = ["SUPER_ADMIN", "ADMIN", "STAFF", "USER"] as const;
type SessionPayload = { email: string; role: (typeof roles)[number]; userId: string };

function sessionKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${SESSION_DURATION_SECONDS}s`).sign(sessionKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, sessionKey());
    if (typeof payload.userId !== "string" || typeof payload.email !== "string" || !roles.includes(payload.role as SessionPayload["role"])) return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
