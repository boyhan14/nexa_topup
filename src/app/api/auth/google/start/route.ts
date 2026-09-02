import { NextResponse } from "next/server";
import {
  createGoogleAuthorizeUrl,
  createGoogleState,
  getGoogleOAuthConfig,
  safeNextPath,
  setGoogleOAuthCookies,
} from "@/lib/google-oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") === "register" ? "register" : "login";
  const fallbackPath = mode === "register" ? "/register" : "/login";
  const config = getGoogleOAuthConfig(request.url);

  if (!config) {
    const errorUrl = new URL(fallbackPath, request.url);
    errorUrl.searchParams.set("error", "Google login belum dikonfigurasi.");
    return NextResponse.redirect(errorUrl);
  }

  const state = createGoogleState();
  const next = safeNextPath(url.searchParams.get("next"));
  const response = NextResponse.redirect(createGoogleAuthorizeUrl(config, state));
  setGoogleOAuthCookies(response, state, next, mode);
  return response;
}
