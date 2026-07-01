import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/custom-auth";
import { createClient } from "@supabase/supabase-js";
import { dbProfileToArrivalProfile, generateTasksForProfile } from "@/lib/task-generator";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getUserId(req: NextRequest): string | null {
  // Accept either the Authorization header (what the client sends when it has
  // the token in localStorage) or the httpOnly "custom_auth_token" cookie
  // that /api/auth/signin also sets on every sign-in — same fallback order
  // /api/profile already uses. The cookie is the more reliable of the two:
  // it's set by the browser automatically and survives page reloads even
  // when, for whatever reason, the client-side localStorage write doesn't
  // stick.
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

// GET /api/tasks — returns the signed-in user's checklist progress.
// Uses the service-role key server-side (not the anon key the browser uses),
// since RLS on user_tasks requires a genuine Supabase Auth session that this
// app's custom JWT auth no longer establishes client-side.
//
// Repair path: if the user has a completed arrival profile but no task rows
// yet (roadmap never generated, or generation failed silently in the past),
// this generates it now instead of returning an empty checklist.
export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getClient();

    const { data: initialRows, error: taskError } = await supabase
      .from("user_tasks")
      .select("task_id,status,completed_at")
      .eq("user_id", userId);

    if (taskError) {
      return NextResponse.json({ error: taskError.message }, { status: 500 });
    }

    let taskRows = initialRows ?? [];

    if (!taskRows.length) {
      const { data: profileRow } = await supabase
        .from("arrival_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (!profileRow) {
        return NextResponse.json({ tasks: [], hasProfile: false });
      }

      const generated = generateTasksForProfile(dbProfileToArrivalProfile(profileRow));
      if (generated.length) {
        const { error: insertError } = await supabase.from("user_tasks").insert(
          generated.map((task) => ({
            user_id: userId,
            task_id: task.taskId,
            status: task.status,
            completed_at: null,
          }))
        );
        if (insertError) {
          return NextResponse.json({ error: insertError.message }, { status: 500 });
        }
        const refreshed = await supabase
          .from("user_tasks")
          .select("task_id,status,completed_at")
          .eq("user_id", userId);
        taskRows = refreshed.data ?? [];
      }
    }

    const tasks = taskRows.map((t) => ({
      taskId: t.task_id,
      status: t.status,
      completedAt: t.completed_at ?? undefined,
    }));

    return NextResponse.json({ tasks, hasProfile: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("/api/tasks GET error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH /api/tasks — { taskId, status } — updates (or creates) a single
// checklist task's progress for the signed-in user.
export async function PATCH(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { taskId, status } = body as { taskId?: string; status?: string };
    if (!taskId || !status) {
      return NextResponse.json({ error: "taskId and status are required." }, { status: 400 });
    }
    if (!["not_started", "in_progress", "complete"].includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const supabase = getClient();
    const completedAt = status === "complete" ? new Date().toISOString() : null;

    const { data: existingRow } = await supabase
      .from("user_tasks")
      .select("id")
      .eq("user_id", userId)
      .eq("task_id", taskId)
      .maybeSingle();

    const row = { status, completed_at: completedAt };
    const { error } = existingRow
      ? await supabase.from("user_tasks").update(row).eq("user_id", userId).eq("task_id", taskId)
      : await supabase.from("user_tasks").insert({ user_id: userId, task_id: taskId, ...row });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, taskId, status, completedAt });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("/api/tasks PATCH error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
