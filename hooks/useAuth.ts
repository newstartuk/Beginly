"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
}

/**
 * Shared auth hook — replaces all `/api/user` fetches.
 * Handles: session check, redirect to /login, data loading.
 */
export function useAuth(requireAuth = true) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    tasks: [],
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data: { user: sessionUser } } = await supabase.auth.getUser();

      if (!sessionUser) {
        if (requireAuth) { router.push("/login"); return; }
        if (mounted) setState(s => ({ ...s, loading: false }));
        return;
      }

      const user: AuthUser = {
        id: sessionUser.id,
        email: sessionUser.email,
        name: sessionUser.user_metadata?.name as string | undefined,
        isAdmin: !!(sessionUser.user_metadata?.is_admin),
      };

      const [profileRes, tasksRes] = await Promise.all([
        supabase
          .from("arrival_profiles")
          .select("*")
          .eq("user_id", sessionUser.id)
          .maybeSingle(),
        supabase
          .from("user_tasks")
          .select("*")
          .eq("user_id", sessionUser.id),
      ]);

      if (!mounted) return;

      const tasks: UserTask[] = (tasksRes.data ?? []).map((t): UserTask => ({
        taskId: t.task_id,
        status: t.status as UserTask["status"],
        completedAt: t.completed_at ?? undefined,
      }));

      setState({
        user,
        profile: profileRes.data ?? null,
        tasks,
        loading: false,
      });
    }

    load();
    return () => { mounted = false; };
  }, [router, requireAuth]);

  return state;
}
