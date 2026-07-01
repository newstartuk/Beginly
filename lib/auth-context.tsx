/**
 * Custom auth context — replaces Supabase Auth client-side.
 * Browser only talks to our own Next.js API, never directly to Supabase.
 */
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { preloadAuth } from "@/hooks/useAuth";

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  hasProfile: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoading: true,
  signIn: async () => ({ id: "", email: "", hasProfile: false } as AuthUser),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("custom_auth_token");
    console.log("[AuthContext] Mounted, token:", storedToken ? "yes(" + storedToken.substring(0, 15) + ")" : "none");
    if (!storedToken) { setIsLoading(false); console.log("[AuthContext] No token, done loading (no auth)"); return; }

    console.log("[AuthContext] Calling /api/auth/me to validate token...");
    const ac = new AbortController();
    // Use 30s timeout — don't delete token on timeout (server might be cold-starting,
    // but a valid session token is still valid; only clear on explicit 401/403).
    const t = setTimeout(() => { console.log("[AuthContext] /api/auth/me timed out — keeping token"); ac.abort(); setIsLoading(false); }, 30000);
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${storedToken}` }, signal: ac.signal })
      .then((r) => {
        // Only treat explicit auth failures as "not logged in"; network errors/timeouts
        // mean the server is unreachable but the token may still be valid.
        if (r.status === 401 || r.status === 403) return null;
        if (!r.ok) return null; // other errors — keep token, don't blow up
        return r.json();
      })
      .then((data) => {
        if (data?.user) {
          setToken(storedToken);
          setUser({ id: data.user.id, email: data.user.email, hasProfile: data.hasProfile });
          preloadAuth({
            user: { id: data.user.id, email: data.user.email, name: data.user.name ?? "" },
            profile: null,
            tasks: [],
          });
        } else {
          // Explicit 401/403 or malformed response — token is invalid
          localStorage.removeItem("custom_auth_token");
        }
      })
      .catch(() => { /* network error — don't delete token; server might recover */ })
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    // Use XMLHttpRequest so we have full control over the timeout.
    // fetch() + AbortController can hang in some browser/proxy configurations.
    const result = await new Promise<{ ok: boolean; status: number; data: any }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/auth/signin");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.timeout = 20000; // 20 second timeout
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          try {
            const data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
            resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
          } catch {
            resolve({ ok: false, status: xhr.status || 0, data: { error: xhr.responseText || "Unknown error" } });
          }
        }
      };
      xhr.ontimeout = () => reject(new Error("Request timed out. Please try again."));
      xhr.onerror = () => reject(new Error("Network error. Please check your connection."));
      xhr.send(JSON.stringify({ email, password }));
    });
    if (!result.ok) throw new Error(result.data.error ?? "Sign-in failed.");

    const authUser: AuthUser = { id: result.data.user.id, email: result.data.user.email, hasProfile: result.data.user.hasProfile };
    localStorage.setItem("custom_auth_token", result.data.token);
    setToken(result.data.token);
    setUser(authUser);
    preloadAuth({
      user: { id: result.data.user.id, email: result.data.user.email },
      profile: null,
      tasks: [],
    });
    return authUser;
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise<{ success: boolean; error?: string }>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/auth/signup");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.timeout = 20000;
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          try {
            const data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
            if (xhr.status >= 200 && xhr.status < 300) resolve({ success: true });
            else resolve({ success: false, error: data.error ?? "Sign-up failed." });
          } catch {
            resolve({ success: false, error: "Unexpected error. Please try again." });
          }
        }
      };
      xhr.ontimeout = () => resolve({ success: false, error: "Request timed out. Please try again." });
      xhr.onerror = () => resolve({ success: false, error: "Network error. Please check your connection." });
      xhr.send(JSON.stringify({ email, password }));
    });
  }, []);

  const signOut = useCallback(async () => {
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem("custom_auth_token");
    setToken(null);
    setUser(null);
    // Also clear the httpOnly cookie by calling a route that clears it
    await fetch("/api/auth/clear-cookie", { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
