"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ensureBeginlyUser } from "@/lib/auth-client";
import { setUser } from "@/lib/utils";
import { resolvePostAuthRedirect, withPostAuthIntent } from "@/lib/navigation/post-auth";
import Disclaimer from "@/components/Disclaimer";
import Logo from "@/components/Logo";
import { AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [successEmail, setSuccessEmail] = useState("");
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
    setSuccessEmail("");

    const normalisedEmail = email.trim().toLowerCase();
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!normalisedEmail.includes("@")) { setError("Please enter a valid email address."); return; }
    if (!phone.trim() || phone.trim().replace(/\s/g, "").length < 7) { setError("Please enter a valid phone number."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);

    try {
      const confirmPath = withPostAuthIntent("/login", postAuthRedirect) + (postAuthRedirect ? "&confirmed=true" : "?confirmed=true");
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}${confirmPath}` : undefined;
      const { data, error: authError } = await supabase.auth.signUp({
        email: normalisedEmail,
        password,
        options: {
          data: { name: name.trim(), phone: phone.trim() },
          emailRedirectTo: redirectTo,
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (!data.session) {
        setSuccessEmail(normalisedEmail);
        setLoading(false);
        return;
      }

      const beginlyUser = await ensureBeginlyUser(data.session.user);
      if (beginlyUser) setUser(beginlyUser);
      router.push(postAuthRedirect ?? "/onboarding");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Signup error:", msg);
      setError(msg);
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
              <label className="input-label">Phone number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="e.g. 07700 900000" autoComplete="tel" required />
              <p className="text-xs text-muted mt-1">Used only for account security and urgent support. Never shared.</p>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pr-10" placeholder="At least 8 characters" autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-navy" tabIndex={-1} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Confirm password</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-field pr-10" placeholder="Repeat password" autoComplete="new-password" required />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-navy" tabIndex={-1} aria-label={showConfirm ? "Hide password" : "Show password"}>
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
