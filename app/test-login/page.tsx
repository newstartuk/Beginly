"use client";
import { useState } from "react";

export default function TestLoginPage() {
  const [email, setEmail] = useState("test@beginly.app");
  const [password, setPassword] = useState("Test1234!");
  const [output, setOutput] = useState<any>(null);

  async function test() {
    setOutput("Signing in...");
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setOutput({ status: res.status, data, error: res.ok ? null : { message: data.error } });
    } catch (e: any) {
      setOutput({ error: { message: e.message } });
    }
  }

  async function signup() {
    setOutput("Signing up...");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setOutput({ status: res.status, data, error: res.ok ? null : { message: data.error } });
    } catch (e: any) {
      setOutput({ error: { message: e.message } });
    }
  }

  return (
    <div style={{ padding: 40, fontFamily: "monospace", fontSize: 14 }}>
      <h1 style={{ fontSize: 20, marginBottom: 20 }}>Sign-In Debug</h1>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" style={{ display: "block", width: 300, marginBottom: 8, padding: 8 }} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" style={{ display: "block", width: 300, marginBottom: 8, padding: 8 }} />
      <button onClick={test} style={{ marginRight: 8, padding: "8 16px" }}>Sign In</button>
      <button onClick={signup} style={{ padding: "8 16px" }}>Sign Up</button>
      <pre style={{ marginTop: 20, background: "#f5f5f5", padding: 16, borderRadius: 8, maxWidth: 700, overflow: "auto" }}>
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  );
}
