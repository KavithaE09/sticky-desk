import Link from "next/link";
import {
  Pin, Download, RefreshCw, Globe, Palette, Cloud,
  Search, ShieldCheck, Zap, Sparkles, ArrowRight, Lock, Layers, CheckCircle2
} from "lucide-react";

export default function Home() {
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
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "24px 64px", maxWidth: 1280, margin: "0 auto",
        position: "relative", zIndex: 10
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none" }}>
          <img src="/logo.png" alt="StickyDesk Logo" style={{ height: 68, width: "auto", objectFit: "contain", borderRadius: 12, filter: "drop-shadow(0 4px 12px rgba(234,88,12,0.2))" }} />
          <span style={{ fontFamily: "'Righteous', 'Space Grotesk', cursive", fontSize: 29, color: "#1a0a00", letterSpacing: "0.5px" }}>
            Sticky<span style={{ color: "#ea580c" }}>Desk</span>
          </span>
        </Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a href="#features" style={{ color: "#7c4a0a", fontSize: 14, fontWeight: 500 }}>Features</a>
          <a href="#how-it-works" style={{ color: "#7c4a0a", fontSize: 14, fontWeight: 500 }}>How It Works</a>
          <Link href="/auth" style={{ color: "#92400e", fontSize: 14, fontWeight: 600, padding: "8px 16px" }}>Log In</Link>
          <Link href="/auth?mode=register" className="btn-hover" style={{
            background: "linear-gradient(135deg, #ea580c 0%, #f97316 60%, #fb923c 100%)",
            color: "#fff", padding: "10px 22px", borderRadius: 10,
            fontSize: 14, fontWeight: 800,
            boxShadow: "0 4px 18px rgba(234,88,12,0.35)",
            display: "inline-flex", alignItems: "center", gap: 8
          }}>Get Started</Link>
        </div>
      </nav>

      {/* Decorative Floating Sticky Notes on Left & Right */}
      <div style={{ position: "relative", maxWidth: 1380, margin: "0 auto" }}>
        {/* Floating Note 1 - Top Left Yellow */}
        <div className="floating-sticky-note animate-float" style={{
          top: "-20px", left: "40px", background: "#FEF08A", borderTop: "4px solid #EAB308",
          "--rot": "-7deg", color: "#854D0E"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
              <Pin size={12} color="#CA8A04" /> StickyDesk
            </span>
            <span style={{ fontSize: 9, opacity: 0.7 }}>github.com</span>
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>
            💡 Bookmark: Check React 19 compiler optimization rules!
          </p>
        </div>

        {/* Floating Note 2 - Bottom Left Mint */}
        <div className="floating-sticky-note animate-float-reverse" style={{
          bottom: "40px", left: "60px", background: "#DCFCE7", borderTop: "4px solid #22C55E",
          "--rot": "5deg", color: "#166534"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
              <Pin size={12} color="#16A34A" /> Research
            </span>
            <span style={{ fontSize: 9, opacity: 0.7 }}>nextjs.org</span>
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>
            ⚡ App router vs Pages router benchmarks.
          </p>
        </div>

        {/* Floating Note 3 - Top Right Peach */}
        <div className="floating-sticky-note animate-float-reverse" style={{
          top: "-10px", right: "40px", background: "#FFEDD5", borderTop: "4px solid #F97316",
          "--rot": "7deg", color: "#9A3412"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
              <Pin size={12} color="#EA580C" /> AI Prompt
            </span>
            <span style={{ fontSize: 9, opacity: 0.7 }}>chatgpt.com</span>
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>
            📌 System prompt template for clean TypeScript generation.
          </p>
        </div>

        {/* Floating Note 4 - Bottom Right Pink */}
        <div className="floating-sticky-note animate-float" style={{
          bottom: "30px", right: "50px", background: "#FCE7F3", borderTop: "4px solid #EC4899",
          "--rot": "-5deg", color: "#9D174D"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
              <Pin size={12} color="#DB2777" /> Design Note
            </span>
            <span style={{ fontSize: 9, opacity: 0.7 }}>figma.com</span>
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>
            🎨 Color palette: Warm orange gradient + pastel cards.
          </p>
        </div>

        {/* Hero Main Content */}
        <section style={{ textAlign: "center", padding: "70px 24px 60px", maxWidth: 940, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(234,88,12,0.08)", border: "1px solid rgba(234,88,12,0.22)",
            padding: "7px 18px", borderRadius: 30, fontSize: 13, fontWeight: 700,
            color: "#ea580c", marginBottom: 24, boxShadow: "0 2px 12px rgba(234,88,12,0.08)"
          }}>
            <Sparkles size={15} color="#ea580c" />
            <span>Smart Web Annotator & Sticky Notes</span>
          </div>

          <h1 style={{
            fontFamily: "'Outfit', 'Sora', sans-serif",
            fontSize: "clamp(44px, 6.8vw, 76px)", fontWeight: 900, color: "#1a0a00",
            lineHeight: 1.08, letterSpacing: "-2px", marginBottom: 24
          }}>
            Remember Everything. <br />
            <span className="gradient-text">Right Where You Found It.</span>
          </h1>

          <p style={{ fontSize: 20, color: "#78350f", maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.65, fontWeight: 500 }}>
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

      {/* Browser Mockup - StickyDesk Web Research Demo */}
      <section style={{ maxWidth: 1080, margin: "20px auto 100px", padding: "0 24px", position: "relative", zIndex: 10 }}>
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
              border: "1px solid rgba(234,88,12,0.2)"
            }}>
              <Lock size={13} color="#ea580c" />
              <span>https://stickydesk.app/workspace/research-notes</span>
            </div>
            <div style={{
              background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
              color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 5
            }}>
              <Pin size={11} /> 2 Notes Pinned
            </div>
          </div>

          {/* StickyDesk Workspace Showcase Content */}
          <div style={{ padding: "36px", minHeight: 380, position: "relative", background: "linear-gradient(135deg, #fff8f3 0%, #ffffff 100%)" }}>
            <div style={{ maxWidth: 580 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: "rgba(234,88,12,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Pin size={18} color="#ea580c" />
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#1a0a00" }}>StickyDesk Workspace & Pinning Demo</span>
              </div>
              <p style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6, marginBottom: 20 }}>
                StickyDesk automatically remembers every note you attach to a specific webpage URL. Revisit any page and your notes instantly float back in place.
              </p>

              {/* Feature Highlights */}
              <div style={{
                background: "#fff4ee", borderRadius: 12, border: "1px solid rgba(234,88,12,0.18)",
                padding: "18px", marginBottom: 20
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#c2410c", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={15} color="#ea580c" />
                  <span>How StickyDesk keeps your research organized:</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "#78350f" }}>
                  <div>📌 <b>URL Matching:</b> Attach notes to exact URLs or entire domains</div>
                  <div>⚡ <b>Instant Recall:</b> Notes pop up automatically when you return</div>
                  <div>☁️ <b>Cloud Sync:</b> Access notes across Chrome, Edge & Brave</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ background: "rgba(234,88,12,0.1)", border: "1px solid rgba(234,88,12,0.2)", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "#c2410c", fontWeight: 600 }}># StickyDesk App</div>
                <div style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.2)", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "#9a3412", fontWeight: 600 }}># Web Notes</div>
                <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 6, padding: "6px 12px", fontSize: 11, color: "#15803d", fontWeight: 600 }}># Auto Sync Active</div>
              </div>
            </div>

            {/* Floating Sticky Note 1 */}
            <div style={{
              position: "absolute", top: 36, right: 40, width: 250,
              background: "#FFF9C4", borderTop: "5px solid #F9A825",
              borderRadius: 14, padding: 14,
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)", color: "#1a1a1a"
            }} className="animate-float">
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

            {/* Floating Sticky Note 2 */}
            <div style={{
              position: "absolute", bottom: 36, right: 180, width: 230,
              background: "#FFE0B2", borderTop: "5px solid #E65100",
              borderRadius: 14, padding: 14,
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)", color: "#1a1a1a"
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
      <section id="how-it-works" style={{ maxWidth: 1080, margin: "0 auto 100px", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#1a0a00", marginBottom: 12 }}>How StickyDesk Works</h2>
          <p style={{ color: "#78350f", fontSize: 16 }}>3 simple steps to organize your web browsing context</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
          {[
            { step: "01", icon: Download, title: "Install Extension", desc: "Add StickyDesk to your browser in one click. Lightweight and ultra fast.", color: "#7c3aed", bg: "rgba(124,58,237,0.1)", border: "rgba(124,58,237,0.2)" },
            { step: "02", icon: Pin, title: "Pin Notes Anywhere", desc: "Type notes directly on any webpage — documentation, research blogs, or tools.", color: "#ea580c", bg: "rgba(234,88,12,0.1)", border: "rgba(234,88,12,0.2)" },
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
      <section id="features" style={{ maxWidth: 1080, margin: "0 auto 120px", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: "#1a0a00", marginBottom: 12 }}>Everything You Need</h2>
          <p style={{ color: "#78350f", fontSize: 16 }}>Powerful tools designed for research, study, and daily browsing</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {[
            { icon: Globe,       title: "URL-Specific Pinning",  desc: "Notes attach to specific URLs or domain patterns automatically.",      color: "#ea580c", bg: "rgba(234,88,12,0.08)",  border: "rgba(234,88,12,0.18)" },
            { icon: Palette,     title: "6 Color Schemes",        desc: "Organize notes visually by topic using curated color themes.",         color: "#db2777", bg: "rgba(219,39,119,0.08)", border: "rgba(219,39,119,0.18)" },
            { icon: Cloud,       title: "Cloud Synchronization",  desc: "Access your saved notes across any computer or browser session.",      color: "#0284c7", bg: "rgba(2,132,199,0.08)",  border: "rgba(2,132,199,0.18)" },
            { icon: Search,      title: "Instant Search",         desc: "Quickly filter and search through all your pinned notes in one place.",color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.18)" },
            { icon: ShieldCheck, title: "Private & Secure",       desc: "Your notes belong to you. No tracking, 100% private and protected.",  color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.18)" },
            { icon: Zap,         title: "Ultra Fast Extension",   desc: "Instant load time without slowing down your browser performance.",    color: "#059669", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.18)" }
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

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(234,88,12,0.15)", padding: "48px 24px", textAlign: "center", background: "#fff4ee", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: "#1a0a00", marginBottom: 12 }}>Start Pinned Notes Today</h3>
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
