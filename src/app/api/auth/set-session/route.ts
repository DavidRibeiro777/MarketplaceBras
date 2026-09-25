// src/app/api/auth/set-session/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json();
    if (!access_token) {
      return NextResponse.json({ error: "Missing access_token" }, { status: 400 });
    }
    // Set HttpOnly cookies for Supabase auth (same names the middleware expects)
    const cookieOptions = {
      httpOnly: true,
      path: "/",
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    };
    const cookieStore = await cookies();
    cookieStore.set("sb-access-token", access_token, cookieOptions);
    if (refresh_token) {
      cookieStore.set("sb-refresh-token", refresh_token, cookieOptions);
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Set session error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
