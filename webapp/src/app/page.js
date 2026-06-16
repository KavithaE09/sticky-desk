import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0e1a 0%, #0d1535 50%, #0a0e1a 100%)" }}>
      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 28 }}>📌</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>StickyDesk</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/auth" style={{ color: "#aaa", fontSize: 14 }}>Login</Link>
          <Link href="/auth?mode=register" style={{ background: "#f9a825", color: "#fff", padding: "8px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "100px 24px 80px" }}>
        <div style={{ display: "inline-block", background: "rgba(249,168,37,0.1)", border: "1px solid rgba(249,168,37,0.3)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: "#f9a825", marginBottom: 24 }}>
          ✨ Smart Notes for Every Webpage
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 24 }}>
          Pin Notes to<br />
          <span style={{ background: "linear-gradient(90deg, #f9a825, #ff6b35)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Any Webpage
          </span>
        </h1>
        <p style={{ fontSize: 18, color: "#8892b0", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Reading an article? Watching a YouTube video? Pin your notes directly to that page.
          Come back anytime — your notes are right there.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/auth?mode=register" style={{ background: "linear-gradient(90deg, #f9a825, #ff6b35)", color: "#fff", padding: "14px 32px", borderRadius: 10, fontSize: 16, fontWeight: 700, boxShadow: "0 8px 32px rgba(249,168,37,0.35)" }}>
            Start Free — No credit card
          </Link>
          <Link href="/dashboard" style={{ background: "rgba(255,255,255,0.06)", color: "#fff", padding: "14px 32px", borderRadius: 10, fontSize: 16, border: "1px solid rgba(255,255,255,0.12)" }}>
            View Demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 100px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        {[
          { icon: "📌", title: "Page-Pinned Notes", desc: "Notes stick to the exact page you created them on. YouTube, Claude, GitHub — everywhere." },
          { icon: "🔗", title: "Source Linking", desc: "Saved a note from an article? Click it anytime to go straight back to that page." },
          { icon: "🌐", title: "Chrome Extension", desc: "Install once. Notes auto-appear as you browse. No manual switching needed." },
          { icon: "☁️", title: "Cloud Sync", desc: "Notes saved securely in the cloud. Access from any device, anytime." },
          { icon: "🎨", title: "Color Labels", desc: "6 colors to organize your thoughts visually. Find notes instantly." },
          { icon: "🔒", title: "Private & Secure", desc: "Your notes are private. Only you can see them. Always." },
        ].map((f, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "24px" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{f.title}</div>
            <div style={{ fontSize: 14, color: "#8892b0", lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 100px", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Simple Pricing</h2>
        <p style={{ color: "#8892b0", marginBottom: 48 }}>Start free. Upgrade when you need more.</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Free */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 28 }}>
            <div style={{ fontSize: 14, color: "#8892b0", marginBottom: 8 }}>FREE</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#fff", marginBottom: 4 }}>₹0</div>
            <div style={{ fontSize: 12, color: "#8892b0", marginBottom: 24 }}>forever</div>
            {["50 notes", "1 device", "Chrome extension", "Cloud sync"].map(f => (
              <div key={f} style={{ fontSize: 14, color: "#cdd6f4", marginBottom: 10, textAlign: "left", display: "flex", gap: 8 }}>
                <span style={{ color: "#f9a825" }}>✓</span> {f}
              </div>
            ))}
            <Link href="/auth?mode=register" style={{ display: "block", marginTop: 24, padding: "10px", background: "rgba(249,168,37,0.1)", border: "1px solid rgba(249,168,37,0.3)", borderRadius: 8, color: "#f9a825", fontSize: 14, fontWeight: 600 }}>
              Get Started
            </Link>
          </div>
          {/* Pro */}
          <div style={{ background: "linear-gradient(135deg, rgba(249,168,37,0.15), rgba(255,107,53,0.15))", border: "1px solid rgba(249,168,37,0.3)", borderRadius: 16, padding: 28, position: "relative" }}>
            <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg, #f9a825, #ff6b35)", borderRadius: 20, padding: "4px 14px", fontSize: 11, color: "#fff", fontWeight: 700 }}>POPULAR</div>
            <div style={{ fontSize: 14, color: "#f9a825", marginBottom: 8 }}>PRO</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#fff", marginBottom: 4 }}>₹199</div>
            <div style={{ fontSize: 12, color: "#8892b0", marginBottom: 24 }}>per month</div>
            {["Unlimited notes", "All devices", "Chrome extension", "Cloud sync", "Priority support"].map(f => (
              <div key={f} style={{ fontSize: 14, color: "#cdd6f4", marginBottom: 10, textAlign: "left", display: "flex", gap: 8 }}>
                <span style={{ color: "#f9a825" }}>✓</span> {f}
              </div>
            ))}
            <Link href="/auth?mode=register" style={{ display: "block", marginTop: 24, padding: "10px", background: "linear-gradient(90deg, #f9a825, #ff6b35)", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600 }}>
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "24px 48px", textAlign: "center", color: "#3a4060", fontSize: 13 }}>
        © 2025 StickyDesk. Built with ❤️
      </footer>
    </main>
  );
}
