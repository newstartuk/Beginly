import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const JWT_SECRET = process.env.CUSTOM_AUTH_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    const normalisedEmail = email.trim().toLowerCase();

    // Fetch custom user from our table — use service role key (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: customUser, error: dbError } = await supabase
      .from("custom_users")
      .select("user_id, email, password_hash")
      .eq("email", normalisedEmail)
      .maybeSingle();

    if (dbError) throw new Error(`DB error: ${dbError.message}`);

    if (!customUser)
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });

    // Verify password against bcrypt hash
    const valid = await compare(password, customUser.password_hash);
    if (!valid)
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });

    // Create custom session
    const { data: session, error: sessionError } = await supabase
      .from("custom_sessions")
      .insert({
        user_id: customUser.user_id,
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();

    if (sessionError) throw new Error(`Session creation failed: ${sessionError.message}`);

    // Issue our own JWT session token
    const token = sign(
      { userId: customUser.user_id, sessionId: session.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Check if they have an arrival_profile
    const { data: profile } = await supabase
      .from("arrival_profiles")
      .select("id")
      .eq("user_id", customUser.user_id)
      .maybeSingle();

    const response = NextResponse.json({
      token,
      user: { id: customUser.user_id, email: customUser.email, hasProfile: !!profile },
    });
    response.cookies.set("custom_auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Signin error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
