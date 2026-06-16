const API_BASE = "http://localhost:3000";

function pageKeyFromURL(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v"))
      return `youtube.com/watch?v=${u.searchParams.get("v")}`;
    if (u.hostname.includes("youtube.com")) return `youtube.com`;
    if (u.hostname.includes("claude.ai")) return `claude.ai${u.pathname}`;
    return u.hostname + u.pathname.replace(/\/$/, "");
  } catch { return url; }
}

const COLORS = ["#FFF9C4","#C8E6C9","#BBDEFB","#F8BBD0","#E1BEE7","#FFE0B2"];

function escapeAndLinkify(text) {
  if (!text) return "";
  let escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const regex = /((?:https?:\/\/[^\s]+)|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi;

  return escaped.replace(regex, (match) => {
    let url = match;
    let trailing = "";
    const punctuation = /[.,!?;:)]+$/;
    const puncMatch = url.match(punctuation);
    if (puncMatch) {
      trailing = puncMatch[0];
      url = url.slice(0, -trailing.length);
    }
    let href = url;
    if (!/^https?:\/\//i.test(href)) {
      href = "https://" + href;
    }
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: #0056b3; text-decoration: underline; cursor: pointer;">${url}</a>${trailing}`;
  });
}


async function getToken() {
  return new Promise(resolve => {
    chrome.storage.local.get("sd_token", ({ sd_token }) => resolve(sd_token || null));
  });
}

async function fetchNotesForPage(pageKey, token) {
  try {
    const res = await fetch(`${API_BASE}/api/notes?pageKey=${encodeURIComponent(pageKey)}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.notes || [];
  } catch { return []; }
}

// ── Position storage per note ─────────────────────────────────────────────────
function getSavedPos(noteId) {
  try {
    const saved = localStorage.getItem(`sd_pos_${noteId}`);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function savePos(noteId, x, y) {
  try {
    localStorage.setItem(`sd_pos_${noteId}`, JSON.stringify({ x, y }));
  } catch {}
}

function makeDraggable(card, noteId) {
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  card.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("sd-close")) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseInt(card.style.left) || 0;
    startTop  = parseInt(card.style.top)  || 0;
    card.style.transition = "none";
    card.style.opacity = "0.85";
    card.style.zIndex = "2147483647";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const newLeft = startLeft + dx;
    const newTop  = startTop  + dy;

    // Screen bounds
    const maxLeft = window.innerWidth  - card.offsetWidth  - 8;
    const maxTop  = window.innerHeight - card.offsetHeight - 8;
    const clampedLeft = Math.max(8, Math.min(newLeft, maxLeft));
    const clampedTop  = Math.max(8, Math.min(newTop,  maxTop));

    card.style.left = clampedLeft + "px";
    card.style.top  = clampedTop  + "px";
    card.style.right  = "auto";
    card.style.bottom = "auto";
  });

  document.addEventListener("mouseup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    card.style.opacity = "1";
    // Save position
    savePos(noteId, parseInt(card.style.left), parseInt(card.style.top));
  });
}

function createWidget(notes) {
  const existing = document.getElementById("stickydesk-widget");
  if (existing) existing.remove();
  if (!notes.length) return;

  // CSS animation
  if (!document.getElementById("stickydesk-style")) {
    const style = document.createElement("style");
    style.id = "stickydesk-style";
    style.textContent = `
      @keyframes sd-slide-in {
        from { opacity: 0; transform: translateX(30px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      .sd-card { cursor: grab; }
      .sd-card:active { cursor: grabbing; }
      .sd-close:hover { opacity: 1 !important; }
    `;
    document.head.appendChild(style);
  }

  const wrapper = document.createElement("div");
  wrapper.id = "stickydesk-widget";
  wrapper.style.cssText = "position:fixed;z-index:2147483646;pointer-events:none;inset:0;";
  document.body.appendChild(wrapper);

  notes.forEach((note, i) => {
    const color = COLORS[note.colorIndex] || COLORS[0];

    // Default position — stack bottom right
    const defaultRight = 24;
    const defaultBottom = 24 + i * 10;

    const saved = getSavedPos(note.id);

    const card = document.createElement("div");
    card.className = "sd-card";
    card.style.cssText = `
      position: fixed;
      ${saved
        ? `left:${saved.x}px; top:${saved.y}px;`
        : `right:${defaultRight}px; bottom:${defaultBottom + i * 120}px;`
      }
      width: 240px;
      background: ${color};
      border-radius: 10px;
      padding: 12px 14px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.22);
      border-top: 4px solid rgba(0,0,0,0.12);
      font-family: 'Segoe UI', sans-serif;
      animation: sd-slide-in 0.3s ease;
      pointer-events: all;
      user-select: none;
    `;

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "sd-close";
    closeBtn.textContent = "×";
    closeBtn.style.cssText = `
      position:absolute; top:5px; right:8px;
      background:none; border:none; font-size:18px;
      cursor:pointer; color:rgba(0,0,0,0.35);
      line-height:1; opacity:0.5; pointer-events:all;
    `;
    closeBtn.onclick = (e) => { e.stopPropagation(); card.remove(); };

    // Pin icon
    if (note.pinned) {
      const pin = document.createElement("span");
      pin.textContent = "📌";
      pin.style.cssText = "position:absolute;top:5px;right:28px;font-size:12px;";
      card.appendChild(pin);
    }

    const viewMode = document.createElement("div");
    viewMode.style.display = "block";

    // Content
    const content = document.createElement("p");
    content.innerHTML = escapeAndLinkify(note.content);
    content.style.cssText = `
      font-size:13px; color:#1a1a1a;
      line-height:1.5; margin:0 20px 0 0;
      word-break:break-word;
    `;
    viewMode.appendChild(content);

    // Comment
    const comment = document.createElement("p");
    comment.style.cssText = `
      font-size:11px; color:#555; font-style:italic;
      margin-top:6px; border-top:1px dashed rgba(0,0,0,0.15);
      padding-top:5px;
    `;
    if (note.comment) {
      comment.innerHTML = `💬 ${escapeAndLinkify(note.comment)}`;
      viewMode.appendChild(comment);
    }

    // Bottom toolbar
    const toolbar = document.createElement("div");
    toolbar.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      border-top: 1px dashed rgba(0,0,0,0.1);
      padding-top: 6px;
    `;

    // Actions container
    const actions = document.createElement("div");
    actions.style.cssText = `
      display: flex;
      gap: 12px;
      align-items: center;
    `;

    // Edit button
    const editBtn = document.createElement("span");
    editBtn.textContent = "✏️";
    editBtn.title = "Edit Note";
    editBtn.style.cssText = "cursor:pointer; font-size:12px; opacity:0.6; transition:opacity 0.2s;";
    editBtn.onmouseover = () => editBtn.style.opacity = "1";
    editBtn.onmouseout = () => editBtn.style.opacity = "0.6";

    // Delete button
    const deleteBtn = document.createElement("span");
    deleteBtn.textContent = "🗑️";
    deleteBtn.title = "Delete Note";
    deleteBtn.style.cssText = "cursor:pointer; font-size:12px; opacity:0.6; transition:opacity 0.2s;";
    deleteBtn.onmouseover = () => deleteBtn.style.opacity = "1";
    deleteBtn.onmouseout = () => deleteBtn.style.opacity = "0.6";

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    toolbar.appendChild(actions);

    // Drag tip
    const tip = document.createElement("p");
    tip.textContent = "✥ drag to move";
    tip.style.cssText = "font-size:10px;color:rgba(0,0,0,0.25);margin:0;";
    toolbar.appendChild(tip);

    viewMode.appendChild(toolbar);
    card.appendChild(viewMode);

    // Create editMode container
    const editMode = document.createElement("div");
    editMode.style.display = "none";
    editMode.style.marginTop = "4px";

    const contentTextarea = document.createElement("textarea");
    contentTextarea.value = note.content;
    contentTextarea.style.cssText = `
      width: 100%;
      height: 60px;
      font-size: 13px;
      padding: 6px;
      border: 1px solid rgba(0,0,0,0.15);
      border-radius: 6px;
      background: rgba(255,255,255,0.7);
      box-sizing: border-box;
      resize: vertical;
      font-family: inherit;
    `;

    const commentTextarea = document.createElement("textarea");
    commentTextarea.value = note.comment || "";
    commentTextarea.placeholder = "Comment (optional)...";
    commentTextarea.style.cssText = `
      width: 100%;
      height: 40px;
      font-size: 11px;
      padding: 6px;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 6px;
      background: rgba(255,255,255,0.5);
      box-sizing: border-box;
      resize: vertical;
      margin-top: 6px;
      font-family: inherit;
    `;

    const editActions = document.createElement("div");
    editActions.style.cssText = `
      display: flex;
      gap: 8px;
      margin-top: 8px;
    `;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.style.cssText = `
      background: #2E7D32;
      color: #fff;
      border: none;
      border-radius: 4px;
      padding: 4px 10px;
      font-size: 11px;
      cursor: pointer;
    `;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = `
      background: transparent;
      border: 1px solid rgba(0,0,0,0.2);
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 11px;
      cursor: pointer;
      color: #333;
    `;

    editActions.appendChild(saveBtn);
    editActions.appendChild(cancelBtn);

    editMode.appendChild(contentTextarea);
    editMode.appendChild(commentTextarea);
    editActions.appendChild(saveBtn);
    editActions.appendChild(cancelBtn);
    editMode.appendChild(editActions);
    card.appendChild(editMode);

    // Wire up events
    editBtn.onclick = (e) => {
      e.stopPropagation();
      viewMode.style.display = "none";
      editMode.style.display = "block";
      contentTextarea.focus();
    };

    cancelBtn.onclick = (e) => {
      e.stopPropagation();
      contentTextarea.value = note.content;
      commentTextarea.value = note.comment || "";
      editMode.style.display = "none";
      viewMode.style.display = "block";
    };

    deleteBtn.onclick = async (e) => {
      e.stopPropagation();
      if (!confirm("Are you sure you want to delete this note?")) return;
      const token = await getToken();
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/api/notes/${note.id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          card.remove();
          const wrapper = document.getElementById("stickydesk-widget");
          if (wrapper && !wrapper.querySelector(".sd-card")) {
            wrapper.remove();
          }
        } else {
          alert("Failed to delete note.");
        }
      } catch (err) {
        alert("Error deleting note.");
      }
    };

    saveBtn.onclick = async (e) => {
      e.stopPropagation();
      const updatedContent = contentTextarea.value.trim();
      const updatedComment = commentTextarea.value.trim();
      if (!updatedContent) return;

      saveBtn.textContent = "Saving...";
      saveBtn.disabled = true;

      const token = await getToken();
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/api/notes/${note.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ content: updatedContent, comment: updatedComment })
        });
        if (res.ok) {
          const data = await res.json();
          const updatedNote = data.note;
          note.content = updatedNote.content;
          note.comment = updatedNote.comment;

          content.innerHTML = escapeAndLinkify(note.content);
          if (note.comment) {
            comment.innerHTML = `💬 ${escapeAndLinkify(note.comment)}`;
            if (!comment.parentNode) {
              viewMode.insertBefore(comment, toolbar);
            }
          } else {
            if (comment.parentNode) {
              comment.remove();
            }
          }

          editMode.style.display = "none";
          viewMode.style.display = "block";
        } else {
          alert("Failed to save changes.");
        }
      } catch (err) {
        alert("Error saving note.");
      } finally {
        saveBtn.textContent = "Save";
        saveBtn.disabled = false;
      }
    };

    wrapper.appendChild(card);
    makeDraggable(card, note.id);
  });
}

async function init() {
  const token = await getToken();
  if (!token) return;

  const pageKey = pageKeyFromURL(window.location.href);
  const notes = await fetchNotesForPage(pageKey, token);
  createWidget(notes);
}

init();

// Re-run when URL changes (YouTube SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(init, 800);
  }
}).observe(document, { subtree: true, childList: true });