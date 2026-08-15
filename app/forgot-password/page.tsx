"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { resolvePostAuthRedirect, withPostAuthIntent } from "@/lib/navigation/post-auth";
import { AlertCircle, CheckCircle } from "lucide-react";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postAuthRedirect, setPostAuthRedirect] = useState<string>();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setPostAuthRedirect(resolvePostAuthRedirect({ redirect: params.get("redirect"), product: params.get("product") }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalisedEmail = email.trim().toLowerCase();
    if (!normalisedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const resetPath = postAuthRedirect ? `/reset-password?redirect=${encodeURIComponent(postAuthRedirect)}` : "/reset-password";
      const redirectTo = `${window.location.origin}${resetPath}`;
      const { error: authError } = await supabase.auth.resetPasswordForEmail(normalisedEmail, { redirectTo });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Forgot password error:", message);
      setError(message);
    } finally {
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
          <h1 className="text-2xl font-bold text-navy">Reset your password</h1>
          <p className="text-sm text-muted mt-1">We&apos;ll email you a link to choose a new one</p>
        </div>

        {sent ? (
          <div className="card space-y-4 text-center">
            <CheckCircle className="w-10 h-10 text-green mx-auto" />
            <div>
              <h2 className="text-lg font-bold text-navy">Check your email</h2>
              <p className="text-sm text-muted mt-2">
                If an account exists for <strong>{email.trim()}</strong>, we&apos;ve sent a link to reset your password.
              </p>
            </div>
            <Link href={withPostAuthIntent("/login", postAuthRedirect)} className="btn-primary w-full justify-center">Back to sign in</Link>
            <p className="text-xs text-muted">If you do not see the email, check your spam/junk folder.</p>
          </div>
        ) : (
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

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? "Sending link..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-muted">
          Remembered it? <Link href={withPostAuthIntent("/login", postAuthRedirect)} className="text-primary hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
