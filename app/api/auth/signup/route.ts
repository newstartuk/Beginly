import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hash } from "bcryptjs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

    const normalisedEmail = email.trim().toLowerCase();

    // Use anon key for auth API calls (signUp uses Supabase auth endpoint)
    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Use service role key for custom_users (bypasses RLS)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Check if already registered in custom_users
    const { data: existingCustom } = await supabaseAdmin
      .from("custom_users")
      .select("id")
      .eq("email", normalisedEmail)
      .maybeSingle();
    if (existingCustom)
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    // Create auth user via public signUp API
    const { data: authUser, error: authError } = await supabaseAnon.auth.signUp({
      email: normalisedEmail,
      password,
    });
    if (authError)
      return NextResponse.json({ error: authError.message }, { status: 400 });
    if (!authUser.user)
      return NextResponse.json({ error: "Failed to create account." }, { status: 500 });

    // Store password hash in custom_users
    const passwordHash = await hash(password, 12);
    const { error: insertError } = await supabaseAdmin.from("custom_users").insert({
      user_id: authUser.user.id,
      email: normalisedEmail,
      password_hash: passwordHash,
    });
    if (insertError)
      throw new Error(`Failed to save custom user: ${insertError.message}`);

    return NextResponse.json({ success: true, email: normalisedEmail });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Signup error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
