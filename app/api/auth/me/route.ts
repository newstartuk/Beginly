import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/custom-auth";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "No token." }, { status: 401 });

    const payload = verifySessionToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPabase_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // Look up the specific session by id (stored in JWT) to handle multi-session users
    const { data: session } = await supabase
      .from("custom_sessions")
      .select("id")
      .eq("id", payload.sessionId)
      .maybeSingle();
    if (!session) return NextResponse.json({ error: "No active session." }, { status: 401 });

    // Get user email
    const { data: customUser } = await supabase
      .from("custom_users")
      .select("email")
      .eq("user_id", payload.userId)
      .maybeSingle();

    if (!customUser) return NextResponse.json({ error: "User not found." }, { status: 404 });

    // Check if they have a profile
    const { data: profile } = await supabase
      .from("arrival_profiles")
      .select("id")
      .eq("user_id", payload.userId)
      .maybeSingle();

    return NextResponse.json({
      user: { id: payload.userId, email: customUser.email },
      hasProfile: !!profile,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("/api/auth/me error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
