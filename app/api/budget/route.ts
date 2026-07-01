import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/custom-auth";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

type BudgetItemType = "income" | "expense" | "savings";

function getUserId(req: NextRequest): string | null {
  // Accept either the Authorization header or the httpOnly "custom_auth_token"
  // cookie that /api/auth/signin also sets — same fallback order /api/profile
  // uses, and the more reliable of the two since it's set by the browser
  // automatically and survives reloads even when the localStorage write
  // doesn't stick.
  const token =
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.cookies.get("custom_auth_token")?.value ||
    "";
  if (!token) return null;
  const payload = verifySessionToken(token);
  return payload?.userId ?? null;
}

function getClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getDefaults(city?: string | null) {
  const isInLondon = city === "London";
  return [
    { category: "Accommodation", label: "Rent", amount: isInLondon ? 900 : 550, type: "expense" as BudgetItemType, color: "#0B7285" },
    { category: "Food", label: "Groceries", amount: isInLondon ? 200 : 150, type: "expense" as BudgetItemType, color: "#0D9488" },
    { category: "University", label: "Tuition fees", amount: 0, type: "expense" as BudgetItemType, color: "#6366F1" },
    { category: "Transport", label: "Transport (bus/train)", amount: isInLondon ? 150 : 80, type: "expense" as BudgetItemType, color: "#F59E0B" },
    { category: "Accommodation", label: "Bills (electric, gas, internet)", amount: isInLondon ? 120 : 80, type: "expense" as BudgetItemType, color: "#8B5CF6" },
    { category: "Utilities", label: "Phone/SIM", amount: 15, type: "expense" as BudgetItemType, color: "#EC4899" },
    { category: "Social", label: "Social & leisure", amount: 80, type: "expense" as BudgetItemType, color: "#F97316" },
    { category: "University", label: "Books & materials", amount: 50, type: "expense" as BudgetItemType, color: "#14B8A6" },
    { category: "Savings", label: "Savings target", amount: 200, type: "savings" as BudgetItemType, color: "#22C55E" },
    { category: "Funding", label: "Student loan / stipend", amount: isInLondon ? 1200 : 900, type: "income" as BudgetItemType, color: "#10B981" },
  ];
}

// GET /api/budget — returns the signed-in user's budget items, seeding
// sensible defaults (based on their arrival profile's city) the first time
// they open the planner. Uses the service-role key server-side since RLS on
// budget_items requires a genuine Supabase Auth session that this app's
// custom JWT auth no longer establishes client-side.
export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getClient();

    const { data: existingRows, error } = await supabase
      .from("budget_items")
      .select("id,label,amount,category,type,color")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (existingRows && existingRows.length > 0) {
      return NextResponse.json({ items: existingRows });
    }

    const { data: profileRow } = await supabase
      .from("arrival_profiles")
      .select("city")
      .eq("user_id", userId)
      .maybeSingle();

    const defaults = getDefaults(profileRow?.city as string | null | undefined);
    const { data: inserted, error: insertError } = await supabase
      .from("budget_items")
      .insert(defaults.map((d) => ({ ...d, user_id: userId })))
      .select("id,label,amount,category,type,color");

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ items: inserted ?? [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("/api/budget GET error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/budget — { label, amount, category, type, color } — adds a new
// budget item for the signed-in user.
export async function POST(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { label, amount, category, type, color } = body as {
      label?: string; amount?: number; category?: string; type?: BudgetItemType; color?: string;
    };

    if (!label || typeof amount !== "number" || Number.isNaN(amount) || amount < 0) {
      return NextResponse.json({ error: "A valid label and amount are required." }, { status: 400 });
    }
    if (!type || !["income", "expense", "savings"].includes(type)) {
      return NextResponse.json({ error: "Invalid type." }, { status: 400 });
    }

    const supabase = getClient();
    const { data, error } = await supabase
      .from("budget_items")
      .insert({
        user_id: userId,
        label: label.trim(),
        amount,
        category: category || "Other",
        type,
        color: color || null,
      })
      .select("id,label,amount,category,type,color")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("/api/budget POST error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE /api/budget?id=... — removes a single budget item.
// DELETE /api/budget?all=1 — removes every budget item for the signed-in
// user (used by account deletion).
export async function DELETE(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all");

    const supabase = getClient();

    if (all) {
      const { error } = await supabase.from("budget_items").delete().eq("user_id", userId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "id is required." }, { status: 400 });
    }

    // Scope the delete to this user's own rows — the service role key
    // bypasses RLS entirely, so this .eq("user_id", ...) check is what
    // actually prevents one user from deleting another user's budget item.
    const { error } = await supabase.from("budget_items").delete().eq("id", id).eq("user_id", userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("/api/budget DELETE error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
