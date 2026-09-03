"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Pin, Download, RefreshCw, Globe, Palette, Cloud,
  Search, ShieldCheck, Zap, ArrowRight, Lock, CheckCircle2,
  Send, Mail, User, MessageSquare, AlertTriangle, Bug, Lightbulb, HelpCircle
} from "lucide-react";

const CATEGORIES = [
  { id: "bug",       label: "Bug / Error",        icon: Bug,          color: "#ef4444" },
  { id: "feature",   label: "Feature Request",     icon: Lightbulb,    color: "#f59e0b" },
  { id: "sync",      label: "Sync Issue",          icon: Zap,          color: "#0284c7" },
  { id: "extension", label: "Extension Problem",   icon: AlertTriangle, color: "#7c3aed" },
  { id: "account",   label: "Account / Login",     icon: User,         color: "#db2777" },
  { id: "other",     label: "Other",               icon: HelpCircle,   color: "#ea580c" },
];

function ContactForm() {
  const [form, setForm]         = useState({ name: "", email: "", category: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [focused, setFocused]     = useState(""); // tracks which field is focused

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const fieldStyle = (name) => focused === name
    ? { ...inp, borderColor: "#ea580c", boxShadow: "0 0 0 3px rgba(234,88,12,0.12)" }
    : inp;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.category || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, subject: form.category, description: form.message }),
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

  if (submitted) {
    return (
      <div style={{
        textAlign: "center", padding: "56px 32px",
        background: "#fff", borderRadius: 24,
        border: "1px solid rgba(34,197,94,0.25)",
        boxShadow: "0 12px 40px -10px rgba(34,197,94,0.15)"
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg,#22c55e,#16a34a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", boxShadow: "0 8px 28px rgba(34,197,94,0.35)"
        }}>
          <CheckCircle2 size={36} color="#fff" />
        </div>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 24, fontWeight: 800, color: "#1a0a00", marginBottom: 10 }}>
          Message Received! 🎉
        </h3>
        <p style={{ color: "#78350f", fontSize: 15, marginBottom: 28 }}>
          We'll get back to you as soon as possible.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: "", email: "", category: "", message: "" }); }}
          style={{
            background: "rgba(234,88,12,0.08)", border: "1px solid rgba(234,88,12,0.2)",
            color: "#ea580c", padding: "10px 24px", borderRadius: 10,
            fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit"
          }}
        >
          Send Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        background: "#fff", border: "1px solid rgba(234,88,12,0.15)", borderRadius: 24,
        padding: "40px", boxShadow: "0 8px 40px -10px rgba(234,88,12,0.1)"
      }}>
        {/* Name + Email */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div>
            <label style={lbl}>Name <span style={{ color: "#ef4444" }}>*</span></label>
            <input id="contact-name" type="text" placeholder="Your name" required
              value={form.name} onChange={e => set("name", e.target.value)}
              style={fieldStyle("name")}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused("")} />
          </div>
          <div>
            <label style={lbl}>Email <span style={{ color: "#ef4444" }}>*</span></label>
            <input id="contact-email" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => set("email", e.target.value)} required
              style={fieldStyle("email")}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused("")} />
          </div>
        </div>

        {/* Category */}
        <div style={{ marginBottom: 24 }}>
          <label style={lbl}>Topic <span style={{ color: "#ef4444" }}>*</span></label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
            {CATEGORIES.map(cat => {
              const IC = cat.icon;
              const sel = form.category === cat.id;
              return (
                <button key={cat.id} type="button" id={`contact-cat-${cat.id}`}
                  onClick={() => set("category", cat.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "9px 16px", borderRadius: 10, cursor: "pointer",
                    fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                    border: sel ? `2px solid ${cat.color}` : "1.5px solid rgba(234,88,12,0.15)",
                    background: sel ? `${cat.color}18` : "#fafafa",
                    color: sel ? cat.color : "#78350f",
                    transition: "all 0.18s ease",
                    transform: sel ? "scale(1.05)" : "scale(1)"
                  }}
                >
                  <IC size={15} /> {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message */}
        <div style={{ marginBottom: 24 }}>
          <label style={lbl}>
            Message <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <textarea id="contact-message"
            placeholder="Describe your issue or question in detail…"
            value={form.message} onChange={e => set("message", e.target.value)} required
            rows={5}
            style={{
              ...fieldStyle("message"),
              resize: "vertical", minHeight: 120, lineHeight: 1.65
            }}
            onFocus={() => setFocused("message")}
            onBlur={() => setFocused("")}
          />
          {form.message.length > 0 && form.message.length < 20 && (
            <div style={{ fontSize: 12, color: "#a16207", marginTop: 5 }}>A bit more detail would help us </div>
          )}
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: 10, padding: "11px 16px", color: "#dc2626",
            fontSize: 13, fontWeight: 600, marginBottom: 20,
            display: "flex", alignItems: "center", gap: 8
          }}>
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        <button id="contact-submit" type="submit" disabled={loading}
          className={loading ? "" : "btn-hover"}
          style={{
            width: "100%", padding: "15px 24px",
            background: loading ? "#fed7aa" : "linear-gradient(135deg,#ea580c 0%,#f97316 60%,#fb923c 100%)",
            color: "#fff", border: "none", borderRadius: 12,
            fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: loading ? "none" : "0 8px 28px rgba(234,88,12,0.38)",
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: 17, height: 17, border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "#fff", borderRadius: "50%", display: "inline-block",
                animation: "spin 0.7s linear infinite"
              }} />
              Sending…
            </>
          ) : (
            <><Send size={17} /> Send Message</>
          )}
        </button>
      </div>
      <p style={{ textAlign: "center", color: "#a16207", fontSize: 12, marginTop: 14 }}>
       Your data is private and only used to resolve your issue.
      </p>
    </form>
  );
}

const lbl = { display: "block", fontSize: 13, fontWeight: 700, color: "#78350f", marginBottom: 7 };
const inp = {
  width: "100%", padding: "11px 15px",
  background: "#fff8f3",
  borderWidth: "1.5px", borderStyle: "solid", borderColor: "rgba(234,88,12,0.2)",
  borderRadius: 11, fontSize: 14, color: "#1a0a00",
  outline: "none", fontFamily: "inherit",
  transition: "border-color 0.2s, box-shadow 0.2s", display: "block"
};



// ── Main Page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main style={{ minHeight: "100vh", background: "#fff8f3", position: "relative", overflow: "hidden" }}>
      {/* Soft Orange Ambient Glow */}
      <div style={{
        position: "absolute", top: "-200px", left: "50%",
        transform: "translateX(-50%)", width: "900px", height: "600px",
        background: "radial-gradient(circle, rgba(251,146,60,0.25) 0%, rgba(249,115,22,0.1) 55%, transparent 80%)",
        pointerEvents: "none", zIndex: 0
      }} className="hero-glow" />
      <div style={{
        position: "absolute", top: "35%", right: "-200px",
        width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(253,186,116,0.2) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* Navbar */}
      <nav className="navbar">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none" }}>
          <img src="/logo.png" alt="StickyDesk Logo" style={{ height: 60, width: "auto", objectFit: "contain", borderRadius: 12, filter: "drop-shadow(0 4px 12px rgba(234,88,12,0.2))" }} />
          <span style={{ fontFamily: "'Righteous', 'Space Grotesk', cursive", fontSize: 27, color: "#1a0a00", letterSpacing: "0.5px" }}>
            Sticky<span style={{ color: "#ea580c" }}>Desk</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="navbar-links">
          <a href="#features"    style={{ color: "#7c4a0a", fontSize: 14, fontWeight: 500 }}>Features</a>
          <a href="#how-it-works" style={{ color: "#7c4a0a", fontSize: 14, fontWeight: 500 }}>How It Works</a>
          <a href="#contact"     style={{ color: "#7c4a0a", fontSize: 14, fontWeight: 500 }}>Contact</a>
          <Link href="/auth" style={{ color: "#92400e", fontSize: 14, fontWeight: 600, padding: "8px 16px" }}>Log In</Link>
          <Link href="/auth?mode=register" className="btn-hover" style={{
            background: "linear-gradient(135deg, #ea580c 0%, #f97316 60%, #fb923c 100%)",
            color: "#fff", padding: "10px 22px", borderRadius: 10,
            fontSize: 14, fontWeight: 800,
            boxShadow: "0 4px 18px rgba(234,88,12,0.35)",
            display: "inline-flex", alignItems: "center", gap: 8
          }}>Get Started</Link>
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <a href="#features"     onClick={() => setMenuOpen(false)} style={{ color: "#7c4a0a", fontSize: 15, fontWeight: 600, padding: "12px 0", borderBottom: "1px solid rgba(234,88,12,0.1)" }}>Features</a>
        <a href="#how-it-works" onClick={() => setMenuOpen(false)} style={{ color: "#7c4a0a", fontSize: 15, fontWeight: 600, padding: "12px 0", borderBottom: "1px solid rgba(234,88,12,0.1)" }}>How It Works</a>
        <a href="#contact"      onClick={() => setMenuOpen(false)} style={{ color: "#7c4a0a", fontSize: 15, fontWeight: 600, padding: "12px 0", borderBottom: "1px solid rgba(234,88,12,0.1)" }}>Contact</a>
        <Link href="/auth" onClick={() => setMenuOpen(false)} style={{ color: "#92400e", fontSize: 15, fontWeight: 600, padding: "12px 0", borderBottom: "1px solid rgba(234,88,12,0.1)" }}>Log In</Link>
        <Link href="/auth?mode=register" onClick={() => setMenuOpen(false)} className="btn-hover" style={{
          background: "linear-gradient(135deg, #ea580c 0%, #f97316 60%, #fb923c 100%)",
          color: "#fff", padding: "13px 22px", borderRadius: 10,
          fontSize: 15, fontWeight: 800, marginTop: 12,
          boxShadow: "0 4px 18px rgba(234,88,12,0.35)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8
        }}>Get Started Free <ArrowRight size={17} /></Link>
      </div>

      <div style={{ position: "relative", maxWidth: 1380, margin: "0 auto" }}>
        {/* Hero */}
        <section className="hero-section" style={{ textAlign: "center", padding: "70px 24px 60px", maxWidth: 940, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(234,88,12,0.08)", border: "1px solid rgba(234,88,12,0.22)",
            padding: "7px 18px", borderRadius: 30, fontSize: 13, fontWeight: 700,
            color: "#ea580c", marginBottom: 24, boxShadow: "0 2px 12px rgba(234,88,12,0.08)"
          }}>
            <span>Smart Web Annotator &amp; Sticky Notes</span>
          </div>

          <h1 style={{
            fontFamily: "'Outfit', 'Sora', sans-serif",
            fontSize: "clamp(38px, 6.8vw, 76px)", fontWeight: 900, color: "#1a0a00",
            lineHeight: 1.08, letterSpacing: "-2px", marginBottom: 24
          }}>
            Remember Everything. <br />
            <span className="gradient-text">Right Where You Found It.</span>
          </h1>

          <p style={{ fontSize: "clamp(15px, 2.5vw, 20px)", color: "#78350f", maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.65, fontWeight: 500 }}>
            Reading articles, research docs, or AI prompts? Anchor your sticky notes directly to any URL. They automatically reappear whenever you return.
          </p>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Link href="/auth?mode=register" className="btn-hover" style={{
              background: "linear-gradient(135deg, #ea580c 0%, #f97316 60%, #fb923c 100%)",
              color: "#fff", padding: "16px 44px", borderRadius: 14,
              fontSize: 17, fontWeight: 800,
              boxShadow: "0 12px 36px rgba(234,88,12,0.4)",
              display: "inline-flex", alignItems: "center", gap: 10
            }}>
              <span>Get Started Free</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      </div>

      {/* Browser Mockup */}
      <section style={{ maxWidth: 1080, margin: "20px auto 80px", padding: "0 16px", position: "relative", zIndex: 10 }}>
        <div style={{
          background: "#ffffff", border: "1px solid rgba(234,88,12,0.2)", borderRadius: 20,
          boxShadow: "0 30px 80px -15px rgba(234,88,12,0.15), 0 4px 20px rgba(0,0,0,0.06)",
          overflow: "hidden"
        }}>
          {/* Browser Address Bar */}
          <div style={{
            background: "#fff4ee", padding: "14px 20px",
            display: "flex", alignItems: "center", gap: 16,
            borderBottom: "1px solid rgba(234,88,12,0.12)"
          }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#22c55e" }} />
            </div>
            <div style={{
              flex: 1, background: "#fff8f3", borderRadius: 8, padding: "6px 14px",
              fontSize: 12, color: "#92400e", display: "flex", alignItems: "center", gap: 8,
              border: "1px solid rgba(234,88,12,0.2)", overflow: "hidden"
            }}>
              <Lock size={13} color="#ea580c" />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>https://stickydesk.app/workspace/research-notes</span>
            </div>
            <div style={{
              background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
              color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", flexShrink: 0
            }}>
              <Pin size={11} /> 2 Notes
            </div>
          </div>

          {/* Mockup Content */}
          <div className="mockup-inner-content" style={{ padding: "36px", minHeight: 380, position: "relative", background: "linear-gradient(135deg, #fff8f3 0%, #ffffff 100%)" }}>
            <div style={{ maxWidth: 580 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(234,88,12,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Pin size={18} color="#ea580c" />
                </div>
                <span style={{ fontSize: "clamp(14px, 2.5vw, 18px)", fontWeight: 800, color: "#1a0a00" }}>StickyDesk Workspace &amp; Pinning Demo</span>
              </div>
              <p style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6, marginBottom: 20 }}>
                StickyDesk automatically remembers every note you attach to a specific webpage URL. Revisit any page and your notes instantly float back in place.
              </p>
              <div style={{ background: "#fff4ee", borderRadius: 12, border: "1px solid rgba(234,88,12,0.18)", padding: "18px", marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#c2410c", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={15} color="#ea580c" />
                  <span>How StickyDesk keeps your research organized:</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "#78350f" }}>
                  <div>📌 <b>URL Matching:</b> Attach notes to exact URLs or entire domains</div>
                  <div>⚡ <b>Instant Recall:</b> Notes pop up automatically when you return</div>
                  <div>☁️ <b>Cloud Sync:</b> Access notes across Chrome, Edge &amp; Brave</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ background: "rgba(234,88,12,0.1)", border: "1px solid rgba(234,88,12,0.2)", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "#c2410c", fontWeight: 600 }}># StickyDesk App</div>
                <div style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "#9a3412", fontWeight: 600 }}># Web Notes</div>
                <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "#15803d", fontWeight: 600 }}># Auto Sync Active</div>
              </div>
            </div>

            {/* Floating Note 1 */}
            <div className="animate-float mockup-note-1" style={{
              position: "absolute", top: 36, right: 40, width: 250,
              background: "#FFF9C4", borderTop: "5px solid #F9A825",
              borderRadius: 14, padding: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", color: "#1a1a1a"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#b45309", display: "flex", alignItems: "center", gap: 4 }}>
                  <Pin size={13} /> StickyDesk Note
                </span>
                <span style={{ fontSize: 10, color: "#78350f" }}>Just now</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.5, fontWeight: 500, margin: "0 0 6px" }}>
                Pinned directly to stickydesk.app! Auto-sync is active.
              </p>
              <p style={{ fontSize: 11, color: "#451a03", fontStyle: "italic" }}>💬 Click extension icon to add comments</p>
            </div>

            {/* Floating Note 2 */}
            <div className="mockup-note-2" style={{
              position: "absolute", bottom: 36, right: 180, width: 230,
              background: "#FFE0B2", borderTop: "5px solid #E65100",
              borderRadius: 14, padding: 14, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", color: "#1a1a1a"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#9a3412", display: "flex", alignItems: "center", gap: 4 }}>
                  <Pin size={13} /> Research Tag
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.5, fontWeight: 500, margin: 0 }}>
                Remember to organize notes by color for quick filtering!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ maxWidth: 1080, margin: "0 auto 80px", padding: "0 16px", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="section-title" style={{ fontSize: 32, fontWeight: 800, color: "#1a0a00", marginBottom: 12 }}>How StickyDesk Works</h2>
          <p style={{ color: "#78350f", fontSize: 16 }}>3 simple steps to organize your web browsing context</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
          {[
            { step: "01", icon: Download,  title: "Install Extension", desc: "Add StickyDesk to your browser in one click. Lightweight and ultra fast.", color: "#7c3aed", bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.2)" },
            { step: "02", icon: Pin,       title: "Pin Notes Anywhere", desc: "Type notes directly on any webpage — documentation, research blogs, or tools.", color: "#ea580c", bg: "rgba(234,88,12,0.1)", border: "rgba(234,88,12,0.2)" },
            { step: "03", icon: RefreshCw, title: "Auto-Sync & Recall", desc: "Notes stay saved in your cloud dashboard and reappear whenever you return to that URL.", color: "#0284c7", bg: "rgba(2,132,199,0.1)", border: "rgba(2,132,199,0.2)" }
          ].map((s, i) => {
            const IC = s.icon;
            return (
              <div key={i} className="step-card">
                <span style={{ display: "inline-block", fontSize: 13, fontWeight: 800, color: s.color, background: s.bg, padding: "4px 12px", borderRadius: 20, marginBottom: 20 }}>STEP {s.step}</span>
                <div className="icon-box" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}><IC size={24} /></div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1a0a00", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: "#78350f", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ maxWidth: 1080, margin: "0 auto 100px", padding: "0 16px", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 className="section-title" style={{ fontSize: 32, fontWeight: 800, color: "#1a0a00", marginBottom: 12 }}>Everything You Need</h2>
          <p style={{ color: "#78350f", fontSize: 16 }}>Powerful tools designed for research, study, and daily browsing</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {[
            { icon: Globe,       title: "URL-Specific Pinning",  desc: "Notes attach to specific URLs or domain patterns automatically.",       color: "#ea580c", bg: "rgba(234,88,12,0.08)",  border: "rgba(234,88,12,0.18)" },
            { icon: Palette,     title: "6 Color Schemes",        desc: "Organize notes visually by topic using curated color themes.",          color: "#db2777", bg: "rgba(219,39,119,0.08)", border: "rgba(219,39,119,0.18)" },
            { icon: Cloud,       title: "Cloud Synchronization",  desc: "Access your saved notes across any computer or browser session.",       color: "#0284c7", bg: "rgba(2,132,199,0.08)",  border: "rgba(2,132,199,0.18)" },
            { icon: Search,      title: "Instant Search",         desc: "Quickly filter and search through all your pinned notes in one place.", color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.18)" },
            { icon: ShieldCheck, title: "Private & Secure",       desc: "Your notes belong to you. No tracking, 100% private and protected.",   color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.18)" },
            { icon: Zap,         title: "Ultra Fast Extension",   desc: "Instant load time without slowing down your browser performance.",     color: "#059669", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.18)" }
          ].map((f, i) => {
            const IC = f.icon;
            return (
              <div key={i} className="feature-card">
                <div className="icon-box" style={{ color: f.color, background: f.bg, border: `1px solid ${f.border}` }}><IC size={24} /></div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1a0a00", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#78350f", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Contact Us ─────────────────────────────────────────────────── */}
      <section id="contact" style={{ maxWidth: 1080, margin: "0 auto 100px", padding: "0 16px", position: "relative", zIndex: 10 }}>
        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 48, alignItems: "start" }}>

          {/* Left — copy */}
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(234,88,12,0.08)", border: "1px solid rgba(234,88,12,0.2)",
              padding: "6px 16px", borderRadius: 30, fontSize: 13, fontWeight: 700,
              color: "#ea580c", marginBottom: 20
            }}>
              <MessageSquare size={13} /> Contact &amp; Support
            </div>
            <h2 className="section-title" style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 900, color: "#1a0a00", lineHeight: 1.15, marginBottom: 16 }}>
              Got a question <br />or found a bug?
            </h2>
            <p style={{ fontSize: 15, color: "#78350f", lineHeight: 1.7, marginBottom: 32 }}>
              Tell us what's going on — we read every message and use your feedback to make StickyDesk better for everyone.
            </p>

            {/* Info cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { icon: Bug,          color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.18)",  title: "Report Bugs",      desc: "Found something broken? We'll fix it fast." },
                { icon: Lightbulb,    color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.18)", title: "Request Features", desc: "Have an idea? We love building what users need." },
                { icon: Mail,         color: "#0284c7", bg: "rgba(2,132,199,0.08)",  border: "rgba(2,132,199,0.18)",  title: "General Inquiry",  desc: "Any question — big or small — just ask." },
              ].map((c, i) => {
                const IC = c.icon;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px",
                    background: "#fff", borderRadius: 14, border: `1px solid ${c.border}`,
                    boxShadow: "0 2px 10px rgba(234,88,12,0.05)"
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: c.bg, border: `1px solid ${c.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <IC size={18} color={c.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#1a0a00", marginBottom: 3 }}>{c.title}</div>
                      <div style={{ fontSize: 13, color: "#78350f" }}>{c.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — form */}
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(234,88,12,0.15)", padding: "48px 24px", textAlign: "center", background: "#fff4ee", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h3 style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: 800, color: "#1a0a00", marginBottom: 12 }}>Start Pinned Notes Today</h3>
          <p style={{ color: "#78350f", fontSize: 15, marginBottom: 28 }}>Free for everyone. Never lose track of web context again.</p>
          <Link href="/auth?mode=register" className="btn-hover" style={{
            background: "linear-gradient(135deg, #ea580c 0%, #f97316 60%, #fb923c 100%)",
            color: "#fff", padding: "14px 36px", borderRadius: 12,
            fontSize: 15, fontWeight: 800,
            boxShadow: "0 8px 24px rgba(234,88,12,0.35)",
            display: "inline-flex", alignItems: "center", gap: 8
          }}>
            <span>Create Free Account</span>
            <ArrowRight size={18} />
          </Link>
          <div style={{ marginTop: 40, color: "#a16207", fontSize: 13 }}>© 2026 StickyDesk. Built with ❤️</div>
        </div>
      </footer>
    </main>
  );
}
