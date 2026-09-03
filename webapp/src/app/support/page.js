"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Pin, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle,
  Bug, Lightbulb, HelpCircle, Zap, MessageSquare, Send,
  Mail, User, ChevronDown, Star
} from "lucide-react";

const CATEGORIES = [
  { id: "bug", label: "Bug / Error", icon: Bug, color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
  { id: "feature", label: "Feature Request", icon: Lightbulb, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  { id: "sync", label: "Sync / Cloud Issue", icon: Zap, color: "#0284c7", bg: "rgba(2,132,199,0.1)", border: "rgba(2,132,199,0.25)" },
  { id: "extension", label: "Extension Problem", icon: AlertTriangle, color: "#7c3aed", bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.25)" },
  { id: "account", label: "Account / Login", icon: User, color: "#db2777", bg: "rgba(219,39,119,0.1)", border: "rgba(219,39,119,0.25)" },
  { id: "other", label: "Other / General", icon: HelpCircle, color: "#ea580c", bg: "rgba(234,88,12,0.1)", border: "rgba(234,88,12,0.25)" },
];

const SEVERITIES = [
  { id: "low", label: "Low", desc: "Minor annoyance", color: "#22c55e", stars: 1 },
  { id: "medium", label: "Medium", desc: "Affects my workflow", color: "#f59e0b", stars: 2 },
  { id: "high", label: "High", desc: "Blocks regular use", color: "#ef4444", stars: 3 },
];

export default function SupportPage() {
  const [form, setForm] = useState({
    name: "", email: "", category: "", subject: "", description: "", severity: "medium",
  });
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.category || !form.description) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setTicketId(data.ticketId);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#fff8f3", position: "relative", overflow: "hidden" }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", top: "-200px", left: "50%", transform: "translateX(-50%)",
        width: "800px", height: "500px", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(circle, rgba(251,146,60,0.22) 0%, rgba(249,115,22,0.08) 55%, transparent 80%)"
      }} className="hero-glow" />

      {/* Navbar */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 48px", maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <img src="/logo.png" alt="StickyDesk" style={{ height: 48, width: "auto", objectFit: "contain", borderRadius: 10 }} />
          <span style={{ fontFamily: "'Righteous', cursive", fontSize: 24, color: "#1a0a00", letterSpacing: "0.5px" }}>
            Sticky<span style={{ color: "#ea580c" }}>Desk</span>
          </span>
        </Link>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 6,
          color: "#92400e", fontSize: 14, fontWeight: 600,
          background: "rgba(234,88,12,0.08)", border: "1px solid rgba(234,88,12,0.2)",
          padding: "8px 16px", borderRadius: 10,
          transition: "all 0.2s ease"
        }}>
          <ArrowLeft size={15} /> Back to Home
        </Link>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "20px 24px 80px", position: "relative", zIndex: 10 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(234,88,12,0.08)", border: "1px solid rgba(234,88,12,0.2)",
            padding: "7px 18px", borderRadius: 30, fontSize: 13, fontWeight: 700,
            color: "#ea580c", marginBottom: 20
          }}>
            <MessageSquare size={14} />
            <span>Support Center</span>
          </div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif", fontSize: "clamp(30px, 5vw, 48px)",
            fontWeight: 900, color: "#1a0a00", lineHeight: 1.1, marginBottom: 14, letterSpacing: "-1px"
          }}>
            How Can We <span className="gradient-text">Help You?</span>
          </h1>
          <p style={{ fontSize: 16, color: "#78350f", maxWidth: 500, margin: "0 auto", lineHeight: 1.6, fontWeight: 500 }}>
            உங்களுக்கு ஏதாவது problem இருந்தா சொல்லுங்க — நாங்க fix பண்றோம்.
            <br />
            <span style={{ color: "#a16207", fontSize: 14 }}>Tell us what's going wrong and we'll fix it fast.</span>
          </p>
        </div>

        {submitted ? (
          /* ── SUCCESS STATE ── */
          <div style={{
            background: "#fff", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 24,
            padding: "60px 48px", textAlign: "center",
            boxShadow: "0 20px 60px -15px rgba(34,197,94,0.15)"
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px", boxShadow: "0 8px 30px rgba(34,197,94,0.35)"
            }}>
              <CheckCircle2 size={40} color="#fff" />
            </div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: "#1a0a00", marginBottom: 12 }}>
              Ticket Submitted! 🎉
            </h2>
            <p style={{ color: "#78350f", fontSize: 16, marginBottom: 8, lineHeight: 1.6 }}>
              Thank you for reaching out. We've received your report and will look into it.
            </p>
            <div style={{
              display: "inline-block", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
              color: "#15803d", fontWeight: 700, fontSize: 14, padding: "8px 20px", borderRadius: 20, marginBottom: 36
            }}>
              Ticket ID: {ticketId}
            </div>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: "", email: "", category: "", subject: "", description: "", severity: "medium" }); }}
                style={{
                  background: "rgba(234,88,12,0.08)", border: "1px solid rgba(234,88,12,0.2)",
                  color: "#ea580c", padding: "12px 28px", borderRadius: 12, fontWeight: 700,
                  fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s ease"
                }}
              >
                Submit Another
              </button>
              <Link href="/dashboard" style={{
                background: "linear-gradient(135deg, #ea580c, #f97316)",
                color: "#fff", padding: "12px 28px", borderRadius: 12, fontWeight: 700,
                fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8,
                boxShadow: "0 6px 20px rgba(234,88,12,0.35)"
              }}>
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          /* ── FORM ── */
          <form onSubmit={handleSubmit}>

            {/* Card */}
            <div style={{
              background: "#fff", border: "1px solid rgba(234,88,12,0.15)", borderRadius: 24,
              padding: "40px", boxShadow: "0 8px 40px -10px rgba(234,88,12,0.12)"
            }}>

              {/* ─ Personal Info ─ */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#c2410c", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <User size={14} /> Your Info
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Name <span style={{ color: "#a16207" }}>(optional)</span></label>
                    <input
                      id="support-name"
                      type="text"
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => set("name", e.target.value)}
                      style={inputStyle}
                      onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={e => Object.assign(e.target.style, inputStyle)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Email <span style={{ color: "#ef4444" }}>*</span></label>
                    <input
                      id="support-email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => set("email", e.target.value)}
                      required
                      style={inputStyle}
                      onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={e => Object.assign(e.target.style, inputStyle)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: "rgba(234,88,12,0.1)", marginBottom: 32 }} />

              {/* ─ Category ─ */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#c2410c", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <Bug size={14} /> Issue Category <span style={{ color: "#ef4444" }}>*</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {CATEGORIES.map(cat => {
                    const IC = cat.icon;
                    const selected = form.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        id={`cat-${cat.id}`}
                        onClick={() => set("category", cat.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "14px 16px",
                          borderRadius: 14, cursor: "pointer", fontFamily: "inherit",
                          border: selected ? `2px solid ${cat.color}` : `1.5px solid ${cat.border}`,
                          background: selected ? cat.bg : "#fafafa",
                          color: selected ? cat.color : "#78350f",
                          fontWeight: 700, fontSize: 14,
                          transition: "all 0.2s ease",
                          transform: selected ? "scale(1.03)" : "scale(1)",
                          boxShadow: selected ? `0 4px 16px ${cat.bg}` : "none"
                        }}
                      >
                        <IC size={18} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ height: 1, background: "rgba(234,88,12,0.1)", marginBottom: 32 }} />

              {/* ─ Severity ─ */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#c2410c", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertTriangle size={14} /> Severity
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {SEVERITIES.map(sev => {
                    const selected = form.severity === sev.id;
                    return (
                      <button
                        key={sev.id}
                        type="button"
                        id={`sev-${sev.id}`}
                        onClick={() => set("severity", sev.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "12px 20px",
                          borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                          border: selected ? `2px solid ${sev.color}` : "1.5px solid rgba(234,88,12,0.15)",
                          background: selected ? `${sev.color}18` : "#fafafa",
                          transition: "all 0.2s ease",
                          transform: selected ? "scale(1.04)" : "scale(1)"
                        }}
                      >
                        <div style={{ display: "flex", gap: 3 }}>
                          {Array.from({ length: sev.stars }).map((_, i) => (
                            <Star key={i} size={14} fill={selected ? sev.color : "#d1d5db"} color={selected ? sev.color : "#d1d5db"} />
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: selected ? sev.color : "#78350f" }}>{sev.label}</div>
                          <div style={{ fontSize: 11, color: "#a16207" }}>{sev.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ height: 1, background: "rgba(234,88,12,0.1)", marginBottom: 32 }} />

              {/* ─ Subject & Description ─ */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#c2410c", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <MessageSquare size={14} /> Details
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Subject <span style={{ color: "#a16207" }}>(optional)</span></label>
                    <input
                      id="support-subject"
                      type="text"
                      placeholder="Brief summary of the issue"
                      value={form.subject}
                      onChange={e => set("subject", e.target.value)}
                      style={inputStyle}
                      onFocus={e => Object.assign(e.target.style, inputFocusStyle)}
                      onBlur={e => Object.assign(e.target.style, inputStyle)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      Describe the issue <span style={{ color: "#ef4444" }}>*</span>
                      <span style={{ color: "#a16207", fontWeight: 400, marginLeft: 8 }}>
                        — என்ன பிரச்சனை வருது? எப்படி reproduce பண்றீங்க?
                      </span>
                    </label>
                    <textarea
                      id="support-description"
                      placeholder="Tell us what happened, what you expected, and what went wrong. Steps to reproduce are super helpful!"
                      value={form.description}
                      onChange={e => set("description", e.target.value)}
                      required
                      rows={6}
                      style={{
                        ...inputStyle,
                        resize: "vertical",
                        minHeight: 140,
                        lineHeight: 1.6
                      }}
                      onFocus={e => Object.assign(e.target.style, { ...inputFocusStyle, minHeight: "140px", resize: "vertical" })}
                      onBlur={e => Object.assign(e.target.style, { ...inputStyle, minHeight: "140px", resize: "vertical" })}
                    />
                    <div style={{ fontSize: 12, color: "#a16207", marginTop: 6 }}>
                      {form.description.length} characters {form.description.length < 30 && form.description.length > 0 && "— add  more detail"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: 12, padding: "12px 16px", color: "#dc2626",
                  fontSize: 14, fontWeight: 600, marginBottom: 20,
                  display: "flex", alignItems: "center", gap: 8
                }}>
                  <AlertTriangle size={16} /> {error}
                </div>
              )}

              {/* Submit */}
              <button
                id="support-submit"
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "16px 24px",
                  background: loading ? "#fed7aa" : "linear-gradient(135deg, #ea580c 0%, #f97316 60%, #fb923c 100%)",
                  color: "#fff", border: "none", borderRadius: 14,
                  fontSize: 16, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  boxShadow: loading ? "none" : "0 8px 28px rgba(234,88,12,0.38)",
                  transition: "all 0.25s ease",
                  transform: loading ? "none" : undefined
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff", borderRadius: "50%",
                      animation: "spin 0.7s linear infinite"
                    }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Support Ticket
                  </>
                )}
              </button>
            </div>

            {/* Footer note */}
            <p style={{ textAlign: "center", color: "#a16207", fontSize: 13, marginTop: 20 }}>
              🔒 Your data is private. We only use it to resolve your issue.
            </p>
          </form>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 600px) {
          form > div { padding: 24px 16px !important; }
          div[style*="gridTemplateColumns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

const labelStyle = {
  display: "block", fontSize: 13, fontWeight: 700, color: "#78350f", marginBottom: 8
};

const inputStyle = {
  width: "100%", padding: "12px 16px",
  background: "#fff8f3", border: "1.5px solid rgba(234,88,12,0.2)",
  borderRadius: 12, fontSize: 14, color: "#1a0a00",
  outline: "none", fontFamily: "inherit",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  display: "block"
};

const inputFocusStyle = {
  ...inputStyle,
  borderColor: "#ea580c",
  boxShadow: "0 0 0 3px rgba(234,88,12,0.12)"
};
