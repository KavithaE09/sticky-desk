"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Trash2, Pin, Pencil } from "lucide-react";


const COLORS = [
  { bg: "#FFF9C4", border: "#F59E0B" }, // 1. Warm Sunflower Yellow
  { bg: "#FFE8D6", border: "#EA580C" }, // 2. Sunset Amber Orange
  { bg: "#FFE4E6", border: "#F43F5E" }, // 3. Coral Rose
  { bg: "#D1FAE5", border: "#10B981" }, // 4. Emerald Mint Green
  { bg: "#E0F2FE", border: "#0284C7" }, // 5. Sky Aqua Blue
  { bg: "#F3E8FF", border: "#8B5CF6" }, // 6. Lavender Purple
];

function getYouTubeId(text) {
  if (!text) return null;
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i;
  const match = text.match(regExp);
  return match ? match[1] : null;
}

function formatTextWithLinks(text, color) {
  if (!text) return "";
  const regex = /((?:https?:\/\/[^\s]+)|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;
  const parts = text.split(regex);
  if (parts.length === 1) return text;
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      let url = part, trailing = "";
      const m = url.match(/[.,!?;:)]+$/);
      if (m) { trailing = m[0]; url = url.slice(0, -trailing.length); }
      let href = url;
      if (!/^https?:\/\//i.test(href)) href = "https://" + href;
      return <span key={index}><a href={href} target="_blank" rel="noopener noreferrer" style={{ color: color?.border || "#ea580c", textDecoration: "none", fontWeight: "600", borderBottom: `1px dashed ${color?.border || "#ea580c"}`, wordBreak: "break-all" }}>{url}</a>{trailing}</span>;
    }
    return part;
  });
}

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
      if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) return `youtube.com/watch?v=${u.searchParams.get("v")}`;
      if (u.hostname.includes("claude.ai")) return `claude.ai${u.pathname}`;
      return u.hostname + u.pathname.replace(/\/$/, "");
    } catch { return url; }
  }

  const submit = async () => {
    if (!pageUrl.trim()) return;
    setLoading(true);
    const pageKey = pageKeyFromURL(pageUrl.trim());
    const res = await fetch(`/api/notes/${note.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pinned: true, pageKey, pageUrl: pageUrl.trim(), pageTitle: pageTitle || pageKey }) });
    const data = await res.json();
    if (res.ok) { onPin(data.note); onClose(); }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(120,53,15,0.2)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, backdropFilter: "blur(8px)" }}>
      <div className="modal-box" style={{ background: "#ffffff", border: "1px solid rgba(234,88,12,0.25)", borderRadius: 16, padding: 28, boxShadow: "0 24px 60px rgba(234,88,12,0.15)" }}>
        <h3 style={{ color: "#1a0a00", marginBottom: 6, fontSize: 18, fontWeight: 800 }}>📌 Pin to Page</h3>
        <p style={{ color: "#78350f", fontSize: 12, marginBottom: 16 }}>Which webpage should this note pin to?</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {quickPages.map(p => (
            <button key={p.url} onClick={() => { setPageUrl(p.url); setPageTitle(p.title); }}
              style={{ padding: "5px 12px", background: pageUrl === p.url ? "rgba(234,88,12,0.1)" : "#fff8f3", border: `1px solid ${pageUrl === p.url ? "#ea580c" : "rgba(234,88,12,0.2)"}`, borderRadius: 20, color: pageUrl === p.url ? "#ea580c" : "#92400e", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              {p.title}
            </button>
          ))}
        </div>
        <input value={pageUrl} onChange={e => setPageUrl(e.target.value)} placeholder="Or paste any URL..."
          style={{ width: "100%", padding: "10px 14px", background: "#fff8f3", border: "1px solid rgba(234,88,12,0.2)", borderRadius: 8, color: "#1a0a00", fontSize: 13, boxSizing: "border-box" }} />
        <input value={pageTitle} onChange={e => setPageTitle(e.target.value)} placeholder="Page title (optional)"
          style={{ width: "100%", padding: "10px 14px", background: "#fff8f3", border: "1px solid rgba(234,88,12,0.12)", borderRadius: 8, color: "#1a0a00", fontSize: 13, boxSizing: "border-box", marginTop: 8 }} />
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 8, background: "transparent", color: "#64748b", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ padding: "9px 22px", background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(234,88,12,0.35)" }}>
            {loading ? "Pinning..." : "📌 Pin Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NoteCard({ note, onDelete, onUpdate, onPin }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [draft, setDraft] = useState({ content: note.content, comment: note.comment || "" });
  const [isHovered, setIsHovered] = useState(false);
  const color = COLORS[note.colorIndex] || COLORS[0];
  const ytId = getYouTubeId(note.content) || (note.comment ? getYouTubeId(note.comment) : null);

  const save = async () => {
    await fetch(`/api/notes/${note.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    onUpdate(note.id, draft); setEditing(false);
  };

  return (
    <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
      style={{
        background: color.bg,
        borderTop: `5px solid ${color.border}`,
        borderRight: `1px solid ${color.border}44`,
        borderBottom: `1px solid ${color.border}44`,
        borderLeft: `1px solid ${color.border}44`,
        borderRadius: 14,
        padding: "16px 14px 12px",
        position: "relative",
        boxShadow: isHovered ? `0 14px 30px ${color.border}35` : `0 4px 14px ${color.border}22`,
        aspectRatio: ytId ? "auto" : "3 / 2",
        minHeight: ytId ? 220 : "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s ease",
        overflow: "hidden"
      }}>
      {!editing && note.pinned && <span style={{ position: "absolute", top: 8, right: 36, display: "flex", alignItems: "center" }}><Pin size={14} color="#000" /></span>}
      {!editing && <button onClick={() => setConfirmDelete(true)} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", cursor: "pointer", opacity: 0.5, display: "flex", alignItems: "center", padding: 2 }}><Trash2 size={15} color="#000" /></button>}

      {confirmDelete && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.97)", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, zIndex: 10, padding: 12, boxSizing: "border-box" }}>
          <p style={{ color: "#0f172a", fontSize: 13, fontWeight: 700, margin: 0, textAlign: "center" }}>Delete this note?</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setConfirmDelete(false)} style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", borderRadius: 6, padding: "5px 14px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={() => { onDelete(note.id); setConfirmDelete(false); }} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Delete</button>
          </div>
        </div>
      )}

      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <textarea value={draft.content} onChange={e => setDraft(d => ({ ...d, content: e.target.value }))} style={{ width: "100%", border: `1px solid ${color.border}`, borderRadius: 6, padding: 8, fontSize: 13, background: "rgba(255,255,255,0.9)", color: "#000", resize: "none", boxSizing: "border-box", flex: 1, minHeight: 60 }} />
            <textarea value={draft.comment} onChange={e => setDraft(d => ({ ...d, comment: e.target.value }))} placeholder="Comment..." style={{ width: "100%", border: `1px solid ${color.border}55`, borderRadius: 6, padding: 8, fontSize: 12, background: "rgba(255,255,255,0.7)", color: "#000", resize: "none", boxSizing: "border-box", height: 40, marginTop: 6 }} />
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={save} style={{ background: color.border, color: "#fff", border: "none", borderRadius: 6, padding: "5px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ background: "none", border: `1px solid ${color.border}`, borderRadius: 6, padding: "5px 10px", fontSize: 13, cursor: "pointer", color: "#333" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", marginBottom: 6 }}>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "#1a1a1a", fontWeight: 600, wordBreak: "break-word", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: ytId ? 3 : 4, WebkitBoxOrient: "vertical" }}>{formatTextWithLinks(note.content, color)}</p>
            {note.comment && <p style={{ fontSize: 12, color: "#444", fontStyle: "italic", borderTop: `1px dashed ${color.border}55`, paddingTop: 6, marginTop: 6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>💬 {formatTextWithLinks(note.comment, color)}</p>}
            {ytId && (
              <div style={{ marginTop: 8, width: "100%", aspectRatio: "16 / 9", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytId}`} title="YouTube" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              </div>
            )}
          {note.page && (
              <a href={note.page.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: "auto", paddingTop: 6, fontSize: 11, color: color.border, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 700 }}>🔗 {note.page.url}</a>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${color.border}33`, paddingTop: 8 }}>
            <span style={{ fontSize: 11, color: "#666", fontWeight: 500 }}>{new Date(note.createdAt).toLocaleDateString()}</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {(!note.pinned || !note.page) && <button onClick={() => onPin(note)} style={{ background: "none", border: `1px solid ${color.border}88`, borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontSize: 11, color: "#000", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}><Pin size={11} color="#000" /> Pin</button>}
              <button onClick={() => setEditing(true)} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.6, display: "flex", alignItems: "center", padding: 2 }}><Pencil size={13} color="#000" /></button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AddNoteModal({ onAdd, onClose }) {
  const [content, setContent] = useState("");
  const [comment, setComment] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    const res = await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: content.trim(), comment: comment.trim(), colorIndex }) });
    const data = await res.json();
    if (res.ok) { onAdd(data.note); onClose(); }
    else alert(data.error || "Error saving note");
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(120,53,15,0.2)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(8px)" }}>
      <div className="modal-box" style={{ background: "#ffffff", border: "1px solid rgba(234,88,12,0.2)", borderRadius: 16, padding: 28, boxShadow: "0 24px 60px rgba(234,88,12,0.12)" }}>
        <h3 style={{ color: "#1a0a00", marginBottom: 16, fontSize: 18, fontWeight: 800 }}>📝 New Note</h3>
        <textarea value={content} onChange={e => setContent(e.target.value)} style={{ width: "100%", minHeight: 100, background: "#fff8f3", border: "1px solid rgba(234,88,12,0.2)", borderRadius: 8, padding: 12, color: "#1a0a00", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} placeholder="Your note..." autoFocus />
        <textarea value={comment} onChange={e => setComment(e.target.value)} style={{ width: "100%", minHeight: 50, background: "#fff4ee", border: "1px solid rgba(234,88,12,0.12)", borderRadius: 8, padding: 12, color: "#78350f", fontSize: 13, resize: "vertical", marginTop: 10, boxSizing: "border-box" }} placeholder="Comment (optional)..." />
        <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#92400e", fontWeight: 600 }}>Color:</span>
          {COLORS.map((c, i) => (
            <div key={i} onClick={() => setColorIndex(i)} style={{ width: 22, height: 22, borderRadius: "50%", background: c.bg, border: `3px solid ${c.border}`, cursor: "pointer", transform: colorIndex === i ? "scale(1.35)" : "scale(1)", transition: "transform .15s" }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 8, background: "transparent", color: "#64748b", fontSize: 14, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ padding: "9px 22px", background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(234,88,12,0.35)" }}>
            {loading ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [pinTarget, setPinTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => { if (status === "unauthenticated") router.push("/auth"); }, [status, router]);
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/notes").then(r => r.json()).then(d => { setNotes(d.notes || []); setLoading(false); });
    }
  }, [status]);

  const deleteNote = async (id) => { await fetch(`/api/notes/${id}`, { method: "DELETE" }); setNotes(n => n.filter(x => x.id !== id)); };
  const updateNote = (id, changes) => setNotes(n => n.map(x => x.id === id ? { ...x, ...changes } : x));
  const handlePin = (updatedNote) => setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));

  const filtered = notes
    .filter(n => filter === "all" ? true : filter === "pinned" ? n.pinned : !n.pinned)
    .filter(n => !search || n.content.toLowerCase().includes(search.toLowerCase()) || (n.comment || "").toLowerCase().includes(search.toLowerCase()));

  if (status === "loading" || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff8f3" }}>
        <div style={{ color: "#ea580c", fontSize: 18, fontWeight: 700 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff8f3" }}>
      <header className="dash-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="StickyDesk" style={{ height: 46, width: "auto", objectFit: "contain", borderRadius: 10, filter: "drop-shadow(0 3px 8px rgba(234,88,12,0.2))" }} />
          <span style={{ fontFamily: "'Righteous', 'Space Grotesk', cursive", fontSize: 22, color: "#1a0a00", letterSpacing: "0.5px" }}>
            Sticky<span style={{ color: "#ea580c" }}>Desk</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="dash-user-email">{session?.user?.email}</span>
          <button onClick={() => signOut({ callbackUrl: "/" })} style={{ background: "#fff4ee", border: "1px solid rgba(234,88,12,0.2)", borderRadius: 7, padding: "6px 14px", color: "#92400e", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Logout</button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a0a00" }}>My Notes</h1>
            <p style={{ fontSize: 13, color: "#78350f", marginTop: 4, fontWeight: 500 }}>{notes.length} notes saved</p>
          </div>
          <button onClick={() => setShowAdd(true)} style={{ background: "linear-gradient(135deg, #ea580c 0%, #f97316 60%, #fb923c 100%)", border: "none", borderRadius: 9, padding: "10px 22px", color: "#fff", fontSize: 14, fontWeight: 800, boxShadow: "0 4px 18px rgba(234,88,12,0.35)", cursor: "pointer" }}>
            + New Note
          </button>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..."
            style={{ flex: 1, minWidth: 200, padding: "10px 14px", background: "#ffffff", border: "1px solid rgba(234,88,12,0.2)", borderRadius: 8, color: "#1a0a00", fontSize: 14, outline: "none", fontWeight: 500 }} />
          <div style={{ display: "flex", background: "#ffffff", borderRadius: 8, border: "1px solid rgba(234,88,12,0.15)", overflow: "hidden" }}>
            {["all", "pinned", "unpinned"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding: "9px 16px", border: "none", background: filter === f ? "#fff4ee" : "transparent", color: filter === f ? "#ea580c" : "#78350f", fontSize: 13, textTransform: "capitalize", cursor: "pointer", fontWeight: filter === f ? "800" : "500" }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#d9a57a" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📌</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{search ? "No notes found" : "No notes yet — create your first!"}</div>
          </div>
        ) : (
          <div className="notes-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {filtered.map(note => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} onUpdate={updateNote} onPin={(n) => setPinTarget(n)} />
            ))}
          </div>
        )}

        <div className="ext-banner" style={{ marginTop: 48, background: "#fff4ee", border: "1px solid rgba(234,88,12,0.2)", borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, boxShadow: "0 4px 16px rgba(234,88,12,0.08)" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#c2410c", marginBottom: 4 }}>Install Chrome Extension</div>
            <div style={{ fontSize: 13, color: "#78350f", fontWeight: 500 }}>Auto-detect pages and pin notes as you browse</div>
          </div>
          <a href="#extension" style={{ background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", color: "#fff", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 14px rgba(234,88,12,0.3)", whiteSpace: "nowrap" }}>
            Install Extension →
          </a>
        </div>
      </main>

      {showAdd && <AddNoteModal onAdd={(n) => setNotes(prev => [n, ...prev])} onClose={() => setShowAdd(false)} />}
      {pinTarget && <PinModal note={pinTarget} onPin={handlePin} onClose={() => setPinTarget(null)} />}
    </div>
  );
}