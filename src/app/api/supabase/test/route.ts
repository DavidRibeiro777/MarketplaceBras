// src/app/api/supabase/test/route.ts
import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

/**
 * Simple endpoint to verify Supabase connection and session handling.
 * It returns the current user's id and email (if logged in) or a message
 * indicating that no session was found.
 */
export async function GET(request: Request) {
  // Supabase reads the session from cookies automatically.
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Supabase getUser error:", error);
    return NextResponse.json({ success: false, message: "Supabase error", detail: error.message }, { status: 500 });
  }

  if (data?.user) {
    const { id, email } = data.user;
    return NextResponse.json({ success: true, user: { id, email } });
  }

  return NextResponse.json({ success: true, user: null, message: "No active session" });
}
