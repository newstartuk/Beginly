"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ensureBeginlyUser } from "@/lib/auth-client";
import { setUser } from "@/lib/utils";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setConfirmed(new URLSearchParams(window.location.search).get("confirmed") === "true");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalisedEmail = email.trim().toLowerCase();
    if (!normalisedEmail || !password) { setError("Please enter your email and password."); return; }

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

      // Run the profile-row check and the arrival-profile lookup in parallel,
      // passing the user we already have to avoid an extra auth round-trip.
      const [beginlyUser, profileRes] = await Promise.all([
        ensureBeginlyUser(data.user),
        supabase
          .from("arrival_profiles")
          .select("id")
          .eq("user_id", data.user.id)
          .maybeSingle(),
      ]);
      if (beginlyUser) setUser(beginlyUser);

      router.push(profileRes.data ? "/dashboard" : "/onboarding");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Login error:", msg);
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
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

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="input-label">Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" autoComplete="email" required />
          </div>

          <div>
            <label className="input-label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="Your password" autoComplete="current-password" required />
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
