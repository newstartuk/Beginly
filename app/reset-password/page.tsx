"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { safeInternalRedirect, withPostAuthIntent } from "@/lib/navigation/post-auth";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import Logo from "@/components/Logo";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [linkError, setLinkError] = useState("");
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const postAuthRedirect = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    postAuthRedirect.current = safeInternalRedirect(params.get("redirect"));

    const errorDescription = params.get("error_description") || hashParams.get("error_description");
    if (errorDescription) {
      setLinkError(errorDescription.replace(/\+/g, " "));
      setChecking(false);
      return;
    }

    const hasRecoveryParams = params.has("code") || hashParams.get("type") === "recovery";
    if (!hasRecoveryParams) {
      setChecking(false);
      return;
    }

    const timeout = setTimeout(() => setChecking(false), 8000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        clearTimeout(timeout);
        setReady(true);
        setChecking(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Best-effort security notice — a failure here shouldn't block the reset itself.
        try {
          await fetch("/api/auth/password-changed", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
          });
        } catch {
          // ignore — the password change already succeeded
        }
      }

      await supabase.auth.signOut();
      const loginPath = withPostAuthIntent("/login", postAuthRedirect.current);
      router.push(loginPath + (postAuthRedirect.current ? "&reset=true" : "?reset=true"));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Reset password error:", message);
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
          <h1 className="text-2xl font-bold text-navy">Set a new password</h1>
          <p className="text-sm text-muted mt-1">Choose a new password for your account</p>
        </div>

        {checking ? (
          <div className="card text-center text-sm text-muted">Verifying your reset link...</div>
        ) : !ready ? (
          <div className="card space-y-4 text-center">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
            <div>
              <h2 className="text-lg font-bold text-navy">Link expired or invalid</h2>
              <p className="text-sm text-muted mt-2">
                {linkError || "This password reset link is no longer valid. Request a new one to continue."}
              </p>
            </div>
            <Link href="/forgot-password" className="btn-primary w-full justify-center">Request a new link</Link>
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
              <label className="input-label">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-navy"
                  aria-label={showPassword ? "Hide new password" : "Show new password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Confirm new password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input-field pr-10"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-navy"
                  aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? "Updating password..." : "Update password"}
            </button>
          </form>
        )}

        {!checking && ready && (
          <p className="text-center text-xs text-muted">
            <Link href="/login" className="text-primary hover:underline">Back to sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
