import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { audit } from "@/lib/audit";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import {
  clearGoogleOAuthCookies,
  exchangeGoogleCodeForProfile,
  getGoogleOAuthConfig,
  getStoredGoogleOAuthState,
} from "@/lib/google-oauth";
import { prisma } from "@/lib/prisma";

function authErrorRedirect(requestUrl: string, mode: string, message: string) {
  const path = mode === "register" ? "/register" : "/login";
  return NextResponse.redirect(new URL(`${path}?error=${encodeURIComponent(message)}`, requestUrl));
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const stored = await getStoredGoogleOAuthState();
  const config = getGoogleOAuthConfig(request.url);

  if (!config) {
    const response = authErrorRedirect(request.url, stored.mode, "Google login belum dikonfigurasi.");
    clearGoogleOAuthCookies(response);
    return response;
  }

  if (!code || !state || state !== stored.state) {
    const response = authErrorRedirect(request.url, stored.mode, "Sesi login Google tidak valid. Coba lagi.");
    clearGoogleOAuthCookies(response);
    return response;
  }

  try {
    const profile = await exchangeGoogleCodeForProfile(config, code);
    if (!profile.email_verified) {
      const response = authErrorRedirect(request.url, stored.mode, "Email Google belum terverifikasi.");
      clearGoogleOAuthCookies(response);
      return response;
    }

    const email = profile.email.trim().toLowerCase();
    const name = profile.name?.trim() || email.split("@")[0] || "Google User";
    const user = await prisma.$transaction(async (tx) => {
      const linkedUser = await tx.user.findUnique({ where: { googleId: profile.sub } });
      if (linkedUser) return linkedUser;

      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        if (existingUser.googleId && existingUser.googleId !== profile.sub) throw new Error("GOOGLE_ACCOUNT_CONFLICT");
        return tx.user.update({ where: { id: existingUser.id }, data: { googleId: profile.sub } });
      }

      return tx.user.create({
        data: {
          email,
          googleId: profile.sub,
          name,
          role: Role.USER,
        },
      });
    });

    if (user.isBanned) {
      const response = authErrorRedirect(request.url, stored.mode, "Akun ini tidak dapat digunakan.");
      clearGoogleOAuthCookies(response);
      return response;
    }

    const token = await createSessionToken({ userId: user.id, email: user.email, role: user.role });
    if (user.role !== Role.USER) await audit(user.id, "LOGIN_GOOGLE", "User", user.id, { email: user.email, role: user.role });

    const destination = user.role === Role.SUPER_ADMIN ? "/admin" : stored.next;
    const response = NextResponse.redirect(new URL(destination, request.url));
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    clearGoogleOAuthCookies(response);
    return response;
  } catch (error) {
    const message = error instanceof Error && error.message === "GOOGLE_ACCOUNT_CONFLICT"
      ? "Akun Google ini sudah terhubung ke akun lain."
      : "Login Google gagal. Coba lagi.";
    const response = authErrorRedirect(request.url, stored.mode, message);
    clearGoogleOAuthCookies(response);
    return response;
  }
}
