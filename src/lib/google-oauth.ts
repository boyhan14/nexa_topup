import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const GOOGLE_OAUTH_STATE_COOKIE = "nexatopup_google_oauth_state";
export const GOOGLE_OAUTH_NEXT_COOKIE = "nexatopup_google_oauth_next";
export const GOOGLE_OAUTH_MODE_COOKIE = "nexatopup_google_oauth_mode";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";
const COOKIE_MAX_AGE_SECONDS = 10 * 60;

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
};

export type GoogleProfile = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
};

export function getGoogleOAuthConfig(requestUrl: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.APP_URL || new URL(requestUrl).origin;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || new URL("/api/auth/google/callback", appUrl).toString();

  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret, redirectUri };
}

export function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export function createGoogleState() {
  return randomBytes(32).toString("base64url");
}

export function createGoogleAuthorizeUrl(config: NonNullable<ReturnType<typeof getGoogleOAuthConfig>>, state: string) {
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");
  return url;
}

export function setGoogleOAuthCookies(response: NextResponse, state: string, next: string, mode: string) {
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  };
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, options);
  response.cookies.set(GOOGLE_OAUTH_NEXT_COOKIE, next, options);
  response.cookies.set(GOOGLE_OAUTH_MODE_COOKIE, mode === "register" ? "register" : "login", options);
}

export function clearGoogleOAuthCookies(response: NextResponse) {
  const options = { httpOnly: true, path: "/", maxAge: 0 };
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", options);
  response.cookies.set(GOOGLE_OAUTH_NEXT_COOKIE, "", options);
  response.cookies.set(GOOGLE_OAUTH_MODE_COOKIE, "", options);
}

export async function getStoredGoogleOAuthState() {
  const cookieStore = await cookies();
  return {
    state: cookieStore.get(GOOGLE_OAUTH_STATE_COOKIE)?.value ?? null,
    next: safeNextPath(cookieStore.get(GOOGLE_OAUTH_NEXT_COOKIE)?.value ?? null),
    mode: cookieStore.get(GOOGLE_OAUTH_MODE_COOKIE)?.value === "register" ? "register" : "login",
  };
}

export async function exchangeGoogleCodeForProfile(config: NonNullable<ReturnType<typeof getGoogleOAuthConfig>>, code: string) {
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
    }),
  });

  const token = (await tokenResponse.json().catch(() => null)) as GoogleTokenResponse | null;
  if (!tokenResponse.ok || !token?.access_token) throw new Error(token?.error ?? "Google token exchange failed.");

  const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  const profile = (await profileResponse.json().catch(() => null)) as GoogleProfile | null;
  if (!profileResponse.ok || !profile?.sub || !profile.email) throw new Error("Google profile request failed.");

  return profile;
}
