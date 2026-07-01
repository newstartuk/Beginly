"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { ensureBeginlyUser } from "@/lib/auth-client";
import { dbProfileToArrivalProfile, generateTasksForProfile } from "@/lib/task-generator";
import { withTimeout } from "@/lib/utils";
import type { Database } from "@/types/database";
import type { UserTask } from "@/types";

type Profile = Database["public"]["Tables"]["arrival_profiles"]["Row"];

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  isAdmin?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  profile: Profile | null;
  tasks: UserTask[];
  loading: boolean;
  error: string | null;
}

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({ user: null, profile: null, tasks: [], loading: true, error: null });

  useEffect(() => {
    let mounted = true;

    async function load() {
      const t0 = performance.now();
      try {
        const supabase = getSupabase();
        // getSession reads local storage (instant). RLS is the real security boundary
        // for the queries below, so we don't need a blocking getUser network call here.
        const { data: { session } } = await withTimeout(supabase.auth.getSession());
        const sessionUser = session?.user ?? null;

        if (!sessionUser) {
          if (requireAuth) { router.push("/login"); return; }
          if (mounted) setState((s) => ({ ...s, loading: false }));
          return;
        }

        // Fire the three independent reads in parallel instead of one after another.
        const [appUser, profileRes, firstTasksRes] = await withTimeout(Promise.all([
          ensureBeginlyUser(sessionUser),
          supabase
            .from("arrival_profiles")
            .select("*")
            .eq("user_id", sessionUser.id)
            .maybeSingle(),
          supabase
            .from("user_tasks")
            .select("task_id,status,completed_at")
            .eq("user_id", sessionUser.id),
        ]));

        const isAdmin = Boolean(sessionUser.user_metadata?.is_admin);
        const user: AuthUser = {
          id: sessionUser.id,
          email: sessionUser.email,
          name: appUser?.name ?? (sessionUser.user_metadata?.name as string | undefined),
          isAdmin,
        };

        let tasksRes = firstTasksRes;

        if ((!tasksRes.data || tasksRes.data.length === 0) && profileRes.data) {
          const generated = generateTasksForProfile(dbProfileToArrivalProfile(profileRes.data));
          if (generated.length) {
            await withTimeout(supabase.from("user_tasks").insert(
              generated.map((task) => ({
                user_id: sessionUser.id,
                task_id: task.taskId,
                status: task.status,
                completed_at: null,
              }))
            ));
            tasksRes = await withTimeout(supabase
              .from("user_tasks")
              .select("task_id,status,completed_at")
              .eq("user_id", sessionUser.id));
          }
        }

        if (!mounted) return;

        const tasks: UserTask[] = (tasksRes.data ?? []).map((t): UserTask => ({
          taskId: t.task_id,
          status: t.status as UserTask["status"],
          completedAt: t.completed_at ?? undefined,
        }));

        console.log(`⏱️ [Beginly] auth + data loaded in ${Math.round(performance.now() - t0)}ms`);
        setState({ user, profile: profileRes.data ?? null, tasks, loading: false, error: null });
      } catch (err: unknown) {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : String(err);
        console.error("useAuth load failed:", msg);
        setState((s) => ({ ...s, loading: false, error: msg }));
      }
    }

    load();
    return () => { mounted = false; };
  }, [router, requireAuth]);

  return state;
}
