"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const COLORS = [
  { bg: "#FFF9C4", border: "#F9A825" },
  { bg: "#C8E6C9", border: "#2E7D32" },
  { bg: "#BBDEFB", border: "#1565C0" },
  { bg: "#F8BBD0", border: "#880E4F" },
  { bg: "#E1BEE7", border: "#6A1B9A" },
  { bg: "#FFE0B2", border: "#E65100" },
];

function formatTextWithLinks(text) {
  if (!text) return "";
  const regex = /((?:https?:\/\/[^\s]+)|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      let url = part;
      let trailing = "";
      const punctuation = /[.,!?;:)]+$/;
      const match = url.match(punctuation);
      if (match) {
        trailing = match[0];
        url = url.slice(0, -trailing.length);
      }
      let href = url;
      if (!/^https?:\/\//i.test(href)) {
        href = "https://" + href;
      }
      return (
        <span key={index}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#0056b3", textDecoration: "underline", wordBreak: "break-all" }}
          >
            {url}
          </a>
          {trailing}
        </span>
      );
    }
    return part;
  });
}


// ── Pin Modal ─────────────────────────────────────────────────────────────
function PinModal({ note, onPin, onClose }) {
  const [pageUrl, setPageUrl] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const quickPages = [
    { title: "YouTube", url: "https://youtube.com" },
    { title: "Claude.ai", url: "https://claude.ai" },
    { title: "GitHub", url: "https://github.com" },
    { title: "Google", url: "https://google.com" },
  ];

  function pageKeyFromURL(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com") && u.searchParams.get("v"))
        return `youtube.com/watch?v=${u.searchParams.get("v")}`;
      if (u.hostname.includes("claude.ai")) return `claude.ai${u.pathname}`;
      return u.hostname + u.pathname.replace(/\/$/, "");
    } catch { return url; }
  }

  const submit = async () => {
    if (!pageUrl.trim()) return;
    setLoading(true);
    const pageKey = pageKeyFromURL(pageUrl.trim());
    const res = await fetch(`/api/notes/${note.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: true, pageKey, pageUrl: pageUrl.trim(), pageTitle: pageTitle || pageKey }),
    });
    const data = await res.json();
    if (res.ok) { onPin(data.note); onClose(); }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(8px)" }}>
      <div style={{ background: "#1a1f35", border: "1px solid rgba(249,168,37,0.3)", borderRadius: 16, padding: 28, width: 420, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
        <h3 style={{ color: "#f9a825", marginBottom: 6, fontSize: 18 }}>📌 Pin to Page</h3>
        <p style={{ color: "#8892b0", fontSize: 12, marginBottom: 16 }}>எந்த page-ல இந்த note show ஆகணும்?</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {quickPages.map(p => (
            <button key={p.url} onClick={() => { setPageUrl(p.url); setPageTitle(p.title); }}
              style={{ padding: "5px 12px", background: pageUrl === p.url ? "rgba(249,168,37,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${pageUrl === p.url ? "#f9a825" : "rgba(255,255,255,0.1)"}`, borderRadius: 20, color: pageUrl === p.url ? "#f9a825" : "#aaa", fontSize: 12, cursor: "pointer" }}>
              {p.title}
            </button>
          ))}
        </div>
        <input value={pageUrl} onChange={e => setPageUrl(e.target.value)}
          placeholder="Or paste any URL: https://youtube.com/watch?v=..."
          style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, boxSizing: "border-box" }} />
        <input value={pageTitle} onChange={e => setPageTitle(e.target.value)}
          placeholder="Page title (optional)"
          style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 13, boxSizing: "border-box", marginTop: 8 }} />
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, background: "transparent", color: "#aaa", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ padding: "9px 22px", background: "#f9a825", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {loading ? "Pinning..." : "📌 Pin Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Note Card (Image 2 layout + pin button) ───────────────────────────────
function NoteCard({ note, onDelete, onUpdate, onPin }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ content: note.content, comment: note.comment || "" });
  const color = COLORS[note.colorIndex] || COLORS[0];

  const save = async () => {
    await fetch(`/api/notes/${note.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    onUpdate(note.id, draft);
    setEditing(false);
  };

  return (
    <div style={{ background: color.bg, borderTop: `4px solid ${color.border}`, borderRadius: 10, padding: "14px 16px", position: "relative", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
      {note.pinned && <span style={{ position: "absolute", top: 8, right: 36, fontSize: 14 }} title="Pinned">📌</span>}
      <button onClick={() => onDelete(note.id)} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", fontSize: 16, cursor: "pointer", opacity: 0.4 }}>🗑️</button>

      {editing ? (
        <>
          <textarea value={draft.content} onChange={e => setDraft(d => ({ ...d, content: e.target.value }))}
            style={{ width: "100%", border: `1px solid ${color.border}`, borderRadius: 6, padding: 8, fontSize: 13, background: "rgba(255,255,255,0.6)", resize: "vertical", boxSizing: "border-box", minHeight: 70 }} />
          <textarea value={draft.comment} onChange={e => setDraft(d => ({ ...d, comment: e.target.value }))}
            placeholder="Comment..." style={{ width: "100%", border: `1px solid ${color.border}55`, borderRadius: 6, padding: 8, fontSize: 12, background: "rgba(255,255,255,0.4)", resize: "vertical", boxSizing: "border-box", minHeight: 40, marginTop: 6 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={save} style={{ background: color.border, color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontSize: 13, cursor: "pointer" }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ background: "none", border: `1px solid ${color.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "#1a1a1a", wordBreak: "break-word", marginBottom: 6 }}>{formatTextWithLinks(note.content)}</p>
          {note.comment && <p style={{ fontSize: 12, color: "#555", fontStyle: "italic", borderTop: `1px dashed ${color.border}55`, paddingTop: 6 }}>💬 {formatTextWithLinks(note.comment)}</p>}
          {note.page && (
            <a href={note.page.url} target="_blank" rel="noopener noreferrer"
              style={{ display: "block", marginTop: 8, fontSize: 11, color: color.border, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              🔗 {note.page.title}
            </a>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: "#999" }}>{new Date(note.createdAt).toLocaleDateString()}</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {!note.pinned && (
                <button onClick={() => onPin(note)}
                  style={{ background: "none", border: `1px solid ${color.border}66`, borderRadius: 5, padding: "2px 8px", cursor: "pointer", fontSize: 11, color: color.border }}>
                  📌 Pin
                </button>
              )}
              <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", fontSize: 13, cursor: "pointer", opacity: 0.5 }}>✏️</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Add Note Modal ─────────────────────────────────────────────────────────
function AddNoteModal({ onAdd, onClose }) {
  const [content, setContent] = useState("");
  const [comment, setComment] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    const res = await fetch("/api/notes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim(), comment: comment.trim(), colorIndex }),
    });
    const data = await res.json();
    if (res.ok) { onAdd(data.note); onClose(); }
    else alert(data.error);
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(8px)" }}>
      <div style={{ background: "#1a1f35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: 28, width: 420, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
        <h3 style={{ color: "#fff", marginBottom: 16, fontSize: 18 }}>📝 New Note</h3>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          style={{ width: "100%", minHeight: 100, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: 12, color: "#fff", fontSize: 14, resize: "vertical", boxSizing: "border-box" }}
          placeholder="Your note..." autoFocus />
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          style={{ width: "100%", minHeight: 50, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: 12, color: "#ccc", fontSize: 13, resize: "vertical", marginTop: 10, boxSizing: "border-box" }}
          placeholder="Comment (optional)..." />
        <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#888" }}>Color:</span>
          {COLORS.map((c, i) => (
            <div key={i} onClick={() => setColorIndex(i)}
              style={{ width: 22, height: 22, borderRadius: "50%", background: c.bg, border: `3px solid ${c.border}`, cursor: "pointer", transform: colorIndex === i ? "scale(1.35)" : "scale(1)", transition: "transform .15s" }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, background: "transparent", color: "#aaa", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ padding: "9px 22px", background: "#f9a825", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {loading ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [pinTarget, setPinTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/notes").then(r => r.json()).then(d => {
        setNotes(d.notes || []);
        setLoading(false);
      });
    }
  }, [status]);

  const deleteNote = async (id) => {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setNotes(n => n.filter(x => x.id !== id));
  };

  const updateNote = (id, changes) => {
    setNotes(n => n.map(x => x.id === id ? { ...x, ...changes } : x));
  };

  const handlePin = (updatedNote) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const filtered = notes
    .filter(n => filter === "all" ? true : filter === "pinned" ? n.pinned : !n.pinned)
    .filter(n => !search || n.content.toLowerCase().includes(search.toLowerCase()) || (n.comment || "").toLowerCase().includes(search.toLowerCase()));

  if (status === "loading" || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#f9a825", fontSize: 18 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a" }}>
      {/* Header */}
      <header style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>📌</span>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>StickyDesk</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "#8892b0" }}>{session?.user?.email}</span>
          <span style={{ fontSize: 11, background: session?.user?.plan === "pro" ? "rgba(249,168,37,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${session?.user?.plan === "pro" ? "#f9a825" : "rgba(255,255,255,0.1)"}`, borderRadius: 12, padding: "2px 10px", color: session?.user?.plan === "pro" ? "#f9a825" : "#888" }}>
            {session?.user?.plan === "pro" ? "⭐ PRO" : "FREE"}
          </span>
          <button onClick={() => { 
            navigator.clipboard.writeText(session?.user?.id); 
            alert("✅ User ID copied! Paste this in the extension."); 
          }}
          style={{ background: "rgba(249,168,37,0.1)", border: "1px solid rgba(249,168,37,0.3)", borderRadius: 7, padding: "6px 12px", color: "#f9a825", fontSize: 12, cursor: "pointer" }}>
            🔑 Copy ID
          </button>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "6px 14px", color: "#8892b0", fontSize: 13, cursor: "pointer" }}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>My Notes</h1>
            <p style={{ fontSize: 13, color: "#8892b0", marginTop: 4 }}>{notes.length} notes saved</p>
          </div>
          <button onClick={() => setShowAdd(true)} style={{ background: "linear-gradient(90deg, #f9a825, #ff6b35)", border: "none", borderRadius: 9, padding: "10px 22px", color: "#fff", fontSize: 14, fontWeight: 700, boxShadow: "0 4px 20px rgba(249,168,37,0.3)", cursor: "pointer" }}>
            + New Note
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search notes..."
            style={{ flex: 1, minWidth: 200, padding: "10px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none" }} />
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
            {["all", "pinned", "unpinned"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "9px 16px", border: "none", background: filter === f ? "rgba(249,168,37,0.2)" : "transparent", color: filter === f ? "#f9a825" : "#888", fontSize: 13, textTransform: "capitalize", cursor: "pointer" }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#3a4060" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📌</div>
            <div style={{ fontSize: 16 }}>{search ? "No notes found" : "No notes yet — create your first!"}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
            {filtered.map(note => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} onUpdate={updateNote} onPin={(n) => setPinTarget(n)} />
            ))}
          </div>
        )}

        <div style={{ marginTop: 48, background: "rgba(249,168,37,0.06)", border: "1px solid rgba(249,168,37,0.2)", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#f9a825", marginBottom: 4 }}>🔌 Install Chrome Extension</div>
            <div style={{ fontSize: 13, color: "#8892b0" }}>Auto-detect pages and pin notes as you browse</div>
          </div>
          <a href="#extension" style={{ background: "#f9a825", color: "#fff", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            Install Extension →
          </a>
        </div>
      </main>

      {showAdd && <AddNoteModal onAdd={(n) => setNotes(prev => [n, ...prev])} onClose={() => setShowAdd(false)} />}
      {pinTarget && <PinModal note={pinTarget} onPin={handlePin} onClose={() => setPinTarget(null)} />}
    </div>
  );
}