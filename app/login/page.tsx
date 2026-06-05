"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, verifyPassword } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) { setError("Please enter your email and password."); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const user = getUser();
    if (!user || user.email !== email.toLowerCase()) {
      setError("No account found with that email. Please check and try again.");
      setLoading(false);
      return;
    }

    if (!verifyPassword(password, user.passwordHash)) {
      setError("Incorrect password. Please try again.");
      setLoading(false);
      return;
    }

    router.push(user.profileCompleted ? "/dashboard" : "/onboarding");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-navy">Beginly</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy">Welcome back</h1>
          <p className="text-sm text-muted mt-1">
            Sign in to continue your roadmap
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
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
            <label className="input-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-2.5"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-muted">
          No account yet?{" "}
          <Link href="/signup" className="text-primary hover:underline">Create one free →</Link>
        </p>
      </div>
    </div>
  );
}
