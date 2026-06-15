"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setUser } from "@/lib/utils";
import Disclaimer from "@/components/Disclaimer";
import { AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.includes("@")) { setError("Please enter a valid email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);

    try {
      // Sign up with Supabase Auth directly
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: { data: { name: name.trim() } },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Insert user profile into our users table
      const { error: insertError } = await supabase.from("users").insert({
        id: authData.user.id,
        name: name.trim(),
        email: email.toLowerCase(),
        password_hash: "[REDACTED — managed by Supabase Auth]",
      });

      if (insertError) {
        console.error("Profile insert failed:", insertError.message);
      }

      // Sync session to localStorage + cookie so middleware recognizes user
      const token = authData.session?.access_token;
      setUser({
        id: authData.user.id,
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash: "",
        createdAt: new Date().toISOString(),
        profileCompleted: false,
      }, token);

      // Redirect to onboarding
      router.push("/onboarding");
    } catch {
      setError("Network error. Please check your connection and try again.");
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
          <h1 className="text-2xl font-bold text-navy">Create your free account</h1>
          <p className="text-sm text-muted mt-1">
            Already have one?{" "}
            <Link href="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>

        <Disclaimer type="general" />

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="input-label">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="e.g. Amara Osei"
              autoComplete="name"
              required
            />
          </div>

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
            <label className="input-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              required
            />
          </div>

          <div>
            <label className="input-label">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input-field"
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-2.5"
          >
            {loading ? "Creating account..." : "Create account — it's free"}
          </button>
        </form>

        <p className="text-center text-xs text-muted">
          By creating an account, you agree to our{" "}
          <Link href="/support" className="text-primary hover:underline">terms of use</Link>{" "}
          and acknowledge our{" "}
          <Link href="/guides" className="text-primary hover:underline">privacy approach</Link>.
        </p>
      </div>
    </div>
  );
}
