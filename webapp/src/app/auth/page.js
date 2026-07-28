"use client";
import { useState, Suspense } from "react";
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
    e.preventDefault(); setError(""); setLoading(true);
    if (mode === "register") {
      const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }
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
      width: "100%", padding: "12px 16px",
      background: "#fff8f3", border: "1px solid rgba(234,88,12,0.25)",
      borderRadius: 10, color: "#1a0a00", fontSize: 14, outline: "none",
      boxSizing: "border-box", transition: "border-color 0.2s",
    }
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
      background: "radial-gradient(circle at 50% 20%, #ffe8d6 0%, #fff8f3 100%)",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 14, textDecoration: "none" }}>
            <img src="/logo.png" alt="StickyDesk" style={{ height: 80, width: "auto", objectFit: "contain", borderRadius: 14, filter: "drop-shadow(0 6px 18px rgba(234,88,12,0.25))" }} />
            <span style={{ fontFamily: "'Righteous', 'Space Grotesk', cursive", fontSize: 34, color: "#1a0a00", letterSpacing: "0.5px" }}>
              Sticky<span style={{ color: "#ea580c" }}>Desk</span>
            </span>
          </Link>
          <p style={{ color: "#78350f", fontSize: 14, marginTop: 8 }}>
            {mode === "login" ? "Welcome back! Log in to access your notes." : "Create your free StickyDesk account."}
          </p>
        </div>

        <div style={{
          background: "#ffffff",
          border: "1px solid rgba(234,88,12,0.2)", borderRadius: 20, padding: 36,
          boxShadow: "0 20px 50px -12px rgba(234,88,12,0.15), 0 4px 16px rgba(0,0,0,0.04)"
        }}>
          {/* Tab switcher */}
          <div style={{ display: "flex", background: "#fff4ee", borderRadius: 12, padding: 4, marginBottom: 28, border: "1px solid rgba(234,88,12,0.15)" }}>
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "none",
                background: mode === m ? "linear-gradient(135deg, #ea580c 0%, #f97316 100%)" : "transparent",
                color: mode === m ? "#fff" : "#92400e",
                fontSize: 14, fontWeight: 800, cursor: "pointer", transition: "all 0.2s ease"
              }}>
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {mode === "register" && (
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#7c2d12", marginBottom: 6, display: "block" }}>Full Name</label>
                <input {...inp("name")} placeholder="Your name" required />
              </div>
            )}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#7c2d12", marginBottom: 6, display: "block" }}>Email Address</label>
              <input {...inp("email")} type="email" placeholder="you@example.com" required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#7c2d12", marginBottom: 6, display: "block" }}>Password</label>
              <input {...inp("password")} type="password" placeholder="••••••••" required />
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: "14px",
              background: loading ? "#f97316" : "linear-gradient(135deg, #ea580c 0%, #f97316 60%, #fb923c 100%)",
              border: "none", borderRadius: 10, color: "#fff",
              fontSize: 15, fontWeight: 800, cursor: loading ? "wait" : "pointer",
              marginTop: 10, boxShadow: "0 4px 18px rgba(234,88,12,0.4)",
              transition: "transform 0.15s ease",
            }}>
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
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
