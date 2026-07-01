"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ensureBeginlyUser } from "@/lib/auth-client";
import { setUser, withTimeout } from "@/lib/utils";
import Disclaimer from "@/components/Disclaimer";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [successEmail, setSuccessEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessEmail("");

    const normalisedEmail = email.trim().toLowerCase();
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!normalisedEmail.includes("@")) { setError("Please enter a valid email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);

    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/login?confirmed=true` : undefined;
      const { data, error: authError } = await withTimeout(supabase.auth.signUp({
        email: normalisedEmail,
        password,
        options: {
          data: { name: name.trim() },
          emailRedirectTo: redirectTo,
        },
      }));

      if (authError) {
        setError(authError.message);
        return;
      }

      // With email confirmation ON, Supabase usually returns a user but no active session.
      // In that case we must not fake an auth cookie or redirect into protected pages.
      if (!data.session) {
        setSuccessEmail(normalisedEmail);
        return;
      }

      const beginlyUser = await withTimeout(ensureBeginlyUser(data.session.user));
      if (beginlyUser) setUser(beginlyUser);
      router.push("/onboarding");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Signup error:", msg);
      setError(msg);
    } finally {
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

        {successEmail ? (
          <div className="card space-y-4 text-center">
            <CheckCircle className="w-10 h-10 text-green mx-auto" />
            <div>
              <h2 className="text-lg font-bold text-navy">Check your email</h2>
              <p className="text-sm text-muted mt-2">
                We sent a confirmation link to <strong>{successEmail}</strong>. Confirm your email, then return to Beginly and sign in with the same credentials.
              </p>
            </div>
            <Link href="/login" className="btn-primary w-full justify-center">Go to sign in</Link>
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
              <label className="input-label">Full name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Your name" autoComplete="name" required />
            </div>

            <div>
              <label className="input-label">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" autoComplete="email" required />
            </div>

            <div>
              <label className="input-label">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="At least 8 characters" autoComplete="new-password" required />
            </div>

            <div>
              <label className="input-label">Confirm password</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-field" placeholder="Repeat password" autoComplete="new-password" required />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
              {loading ? "Creating account..." : "Create account"}
            </button>

            <Disclaimer text="Beginly provides general settlement guidance and checklist support. We do not provide legal, immigration, financial, tax, medical, or housing advice." type="general" />
          </form>
        )}
      </div>
    </div>
  );
}
