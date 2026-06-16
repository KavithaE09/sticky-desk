"use client";
import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState(searchParams.get("mode") === "register" ? "register" : "login");
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);

    if (mode === "register") {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      // Auto login after register
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/dashboard");
    } else {
      const res = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (res?.error) { setError("Invalid email or password"); setLoading(false); return; }
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const inp = (field) => ({
    value: form[field],
    onChange: (e) => setForm(f => ({ ...f, [field]: e.target.value })),
    style: {
      width: "100%", padding: "12px 14px", background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff",
      fontSize: 14, outline: "none",
    }
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(135deg, #0a0e1a, #0d1535)" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 32 }}>📌</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>StickyDesk</span>
          </Link>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 32 }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 3, marginBottom: 28 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "8px", borderRadius: 6, border: "none",
                background: mode === m ? "#f9a825" : "transparent",
                color: mode === m ? "#fff" : "#8892b0",
                fontSize: 14, fontWeight: mode === m ? 600 : 400,
                transition: "all .2s",
              }}>
                {m === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && (
              <div>
                <label style={{ fontSize: 12, color: "#8892b0", marginBottom: 6, display: "block" }}>Name</label>
                <input {...inp("name")} placeholder="Your name" />
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, color: "#8892b0", marginBottom: 6, display: "block" }}>Email</label>
              <input {...inp("email")} type="email" placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#8892b0", marginBottom: 6, display: "block" }}>Password</label>
              <input {...inp("password")} type="password" placeholder="••••••••" required />
            </div>

            {error && (
              <div style={{ background: "rgba(220,50,50,0.12)", border: "1px solid rgba(220,50,50,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#ff6b6b" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: "12px", background: loading ? "rgba(249,168,37,0.5)" : "linear-gradient(90deg, #f9a825, #ff6b35)",
              border: "none", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: 700,
              marginTop: 8, transition: "opacity .2s",
            }}>
              {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return <Suspense><AuthForm /></Suspense>;
}
