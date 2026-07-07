import { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE, ADMIN_SESSION_MAX_AGE, createAdminToken, getAdminConfig } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const config = getAdminConfig();

  if (!config.configured || !config.username || !config.password || !config.secret) {
    return NextResponse.json(
      { error: "Admin credentials are not configured. Define ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SESSION_SECRET." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const username = String(body?.username || "").trim();
  const password = String(body?.password || "");

  if (username !== config.username || password !== config.password) {
    return NextResponse.json({ error: "ACCESS DENIED. Invalid credentials." }, { status: 401 });
  }

  const token = await createAdminToken(username, config.secret);
  const response = NextResponse.json({ ok: true });

  response.cookies.set(ADMIN_AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  return response;
}
