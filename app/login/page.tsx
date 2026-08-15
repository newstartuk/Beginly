"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ensureBeginlyUser } from "@/lib/auth-client";
import { setArrivalProfile, setUser, setUserTasks } from "@/lib/utils";
import { resolvePostAuthRedirect, withPostAuthIntent } from "@/lib/navigation/post-auth";
import { isClientDemoMode } from "@/lib/platform/runtime";
import { generateTasksForProfile } from "@/lib/task-generator";
import { AlertCircle, CheckCircle } from "lucide-react";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [reset, setReset] = useState(false);
  const [postAuthRedirect, setPostAuthRedirect] = useState<string>();
  const demoMode = isClientDemoMode();
  const demoEmail = "demo@beginly.local";
  const demoPassword = "BeginlyDemo123!";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setConfirmed(params.get("confirmed") === "true");
      setReset(params.get("reset") === "true");
      setPostAuthRedirect(resolvePostAuthRedirect({ redirect: params.get("redirect"), product: params.get("product") }));
    }
  }, []);

  const signInWithDemo = () => {
    setUser({
      id: "demo-user",
      name: "Tunde",
      email: demoEmail,
      passwordHash: "",
      createdAt: "2026-07-16T00:00:00.000Z",
      profileCompleted: true,
    });

    setArrivalProfile({
      arrivalType: "international_student",
      arrivalStatus: "arrived",
      arrivalDate: "2025-09-18",
      city: "Leeds",
      university: "University of Leeds",
      accommodationType: "private_rental",
      nationality: "Nigerian",
      englishLevel: "advanced",
      interestedInWork: true,
      profileCompleted: true,
    });

    setUserTasks(
      generateTasksForProfile({
        arrivalType: "international_student",
        arrivalStatus: "arrived",
        arrivalDate: "2025-09-18",
        city: "Leeds",
        university: "University of Leeds",
        accommodationType: "private_rental",
        nationality: "Nigerian",
        englishLevel: "advanced",
        interestedInWork: true,
        profileCompleted: true,
      }).map((task, index) => ({
        taskId: task.taskId,
        status: index < 8 ? ("complete" as const) : ("not_started" as const),
        completedAt: index < 8 ? "2026-07-16T00:00:00.000Z" : undefined,
      })),
    );

    router.push(postAuthRedirect ?? "/platform");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalisedEmail = email.trim().toLowerCase();
    if (!normalisedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (demoMode && normalisedEmail === demoEmail && password === demoPassword) {
      signInWithDemo();
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: normalisedEmail,
        password,
      });

      if (authError) {
        const message = authError.message.toLowerCase().includes("email not confirmed")
          ? "Please confirm your email address first. Check your inbox/spam folder, then try again."
          : authError.message;
        setError(message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const [beginlyUser, profileRes] = await Promise.all([
        ensureBeginlyUser(data.user),
        supabase.from("arrival_profiles").select("id").eq("user_id", data.user.id).maybeSingle(),
      ]);

      if (beginlyUser) setUser(beginlyUser);

      router.push(postAuthRedirect ?? (profileRes.data ? "/platform" : "/onboarding"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Login error:", message);
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Logo size={32} className="rounded-lg" />
            <span className="font-bold text-navy">Beginly</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy">Welcome back</h1>
          <p className="text-sm text-muted mt-1">Sign in to continue your roadmap</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {confirmed && !error && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Email confirmed. You can now sign in.
            </div>
          )}

          {reset && !error && (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Password updated. You can now sign in with your new password.
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {demoMode && (
            <div className="rounded-lg border border-primary/20 bg-teal-50 p-3 text-sm text-navy space-y-2">
              <p className="font-semibold">Local demo login enabled</p>
              <p>Email: <strong>{demoEmail}</strong></p>
              <p>Password: <strong>{demoPassword}</strong></p>
              <button type="button" onClick={signInWithDemo} className="btn-ghost text-sm">
                Use demo account
              </button>
            </div>
          )}

          <div>
            <label className="input-label">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="input-label">Password</label>
            </div>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Your password"
              autoComplete="current-password"
              required
            />

            <div className="mt-1 flex justify-end">
              <Link
                href={withPostAuthIntent("/forgot-password", postAuthRedirect)}
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-muted">
          No account yet? <Link href="/signup" className="text-primary hover:underline">Create one free →</Link>
        </p>
      </div>
    </div>
  );
}
