import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/custom-auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    // Validate auth token
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
      || req.cookies.get("custom_auth_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = verifySessionToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });

    const userId = payload.userId;
    const body = await req.json();
    const { email, name, arrivalType, arrivalStatus, arrivalDate, city, university,
      accommodationType, nationality, englishLevel, interestedInWork } = body;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Upsert public.users row
    await supabase.from("users").upsert({
      id: userId,
      email: email || "",
      name: name || "Beginly User",
      profile_completed: true,
    }, { onConflict: "id" });

    // Upsert arrival_profile
    const { error: profileError } = await supabase.from("arrival_profiles").upsert({
      user_id: userId,
      arrival_type: arrivalType || "international_student",
      status: arrivalStatus || "not_arrived",
      arrival_date: arrivalDate || null,
      city: city || null,
      university: university || null,
      accommodation: accommodationType || "not_secured",
      nationality: nationality || null,
      english_level: englishLevel || null,
      work_interest: interestedInWork ?? false,
    }, { onConflict: "user_id" });

    if (profileError) {
      console.error("Profile save failed:", profileError.message);
      return NextResponse.json({ error: "Failed to save profile: " + profileError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("/api/profile error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
