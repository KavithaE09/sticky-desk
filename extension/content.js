const API_BASE = "http://localhost:3000";

function pageKeyFromURL(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');

    // 1. YouTube (Video-specific if watch URL, otherwise domain level)
    if (host.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      return v ? `youtube.com/watch?v=${v}` : "youtube.com";
    }

    // 2. Gmail / Google Mail
    if (host.includes("mail.google.com")) {
      return "mail.google.com";
    }

    // 3. ChatGPT
    if (host.includes("chatgpt.com") || host.includes("chat.openai.com")) {
      return "chatgpt.com";
    }

    // 4. Claude AI
    if (host.includes("claude.ai")) {
      return "claude.ai";
    }

    // 5. General web pages: Hostname + Cleaned Pathname
    const cleanPath = u.pathname.replace(/\/$/, "");
    return cleanPath ? `${host}${cleanPath}` : host;
  } catch {
    return url;
  }
}

const COLORS = ["#FFF9C4", "#FFE8D6", "#FFE4E6", "#D1FAE5", "#E0F2FE", "#F3E8FF"];

function getYouTubeId(text) {
  if (!text) return null;
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i;
  const match = text.match(regExp);
  return match ? match[1] : null;
}

function escapeAndLinkify(text, color) {
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
    const linkColor = color?.border || "#0056b3";
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color: ${linkColor}; text-decoration: underline; cursor: pointer;">${url}</a>${trailing}`;
  });
}


async function getToken() {
  return new Promise(resolve => {
    chrome.storage.local.get(["sd_token", "token"], ({ sd_token, token }) => resolve(sd_token || token || null));
  });
}

async function fetchNotesForPage(pageKey, token) {
  return new Promise(resolve => {
    try {
      chrome.runtime.sendMessage({ type: "GET_NOTES", pageKey }, (result) => {
        if (chrome.runtime.lastError) { resolve({ notes: [], plan: "free" }); return; }
        resolve({ notes: result?.notes || [], plan: result?.plan || "free" });
      });
    } catch { resolve({ notes: [], plan: "free" }); }
  });
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
  } catch { }
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
    startTop = parseInt(card.style.top) || 0;
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
    const newTop = startTop + dy;

    // Screen bounds
    const maxLeft = window.innerWidth - card.offsetWidth - 8;
    const maxTop = window.innerHeight - card.offsetHeight - 8;
    const clampedLeft = Math.max(8, Math.min(newLeft, maxLeft));
    const clampedTop = Math.max(8, Math.min(newTop, maxTop));

    card.style.left = clampedLeft + "px";
    card.style.top = clampedTop + "px";
    card.style.right = "auto";
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

function createWidget(notes, token, pageKey, plan) {
  const isPro = plan === "pro";
  const existing = document.getElementById("stickydesk-widget");
  if (existing) existing.remove();

  // CSS animation + shared styles
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
      .sd-add-btn:hover { transform: scale(1.08) !important; box-shadow: 0 8px 28px rgba(249,168,37,0.5) !important; }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  const CARD_COLORS = [
    { bg: "#FFF9C4", border: "#F59E0B",
      proGradient: "linear-gradient(145deg, #2C1800 0%, #3D2500 50%, #1E1000 100%)",
      proGlow: "#F59E0B", proAccent: "#FCD34D", proText: "#FEF3C7" },
    { bg: "#FFE8D6", border: "#EA580C",
      proGradient: "linear-gradient(145deg, #1A0800 0%, #2E1000 50%, #120500 100%)",
      proGlow: "#EA580C", proAccent: "#FB923C", proText: "#FFF4EE" },
    { bg: "#FFE4E6", border: "#F43F5E",
      proGradient: "linear-gradient(145deg, #1A0010 0%, #2A0020 50%, #120008 100%)",
      proGlow: "#F43F5E", proAccent: "#FB7185", proText: "#FFE4E6" },
    { bg: "#D1FAE5", border: "#10B981",
      proGradient: "linear-gradient(145deg, #001A0D 0%, #00291A 50%, #001209 100%)",
      proGlow: "#10B981", proAccent: "#34D399", proText: "#D1FAE5" },
    { bg: "#E0F2FE", border: "#0284C7",
      proGradient: "linear-gradient(145deg, #000D2E 0%, #001550 50%, #000820 100%)",
      proGlow: "#0284C7", proAccent: "#38BDF8", proText: "#E0F2FE" },
    { bg: "#F3E8FF", border: "#8B5CF6",
      proGradient: "linear-gradient(145deg, #0D0020 0%, #1A0035 50%, #08001A 100%)",
      proGlow: "#8B5CF6", proAccent: "#A78BFA", proText: "#F3E8FF" },
  ];

  const wrapper = document.createElement("div");
  wrapper.id = "stickydesk-widget";
  wrapper.style.cssText = "position:fixed;z-index:2147483646;pointer-events:none;inset:0;";
  document.body.appendChild(wrapper);

  // ── Floating "+ Add New Note" button ──────────────────────────────────
  const addBtn = document.createElement("div");
  addBtn.className = "sd-add-btn";
  addBtn.textContent = "+ Add New Note";
  addBtn.style.cssText = `
    position: fixed !important;
    bottom: 24px !important;
    right: 24px !important;
    background: linear-gradient(135deg, #ea580c 0%, #f97316 60%, #fb923c 100%) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 10px !important;
    padding: 10px 20px !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    font-family: 'Segoe UI', Arial, sans-serif !important;
    cursor: pointer !important;
    pointer-events: all !important;
    box-shadow: 0 6px 20px rgba(234,88,12,0.4) !important;
    z-index: 2147483647 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: transform 0.15s, box-shadow 0.15s !important;
    animation: sd-slide-in 0.3s ease !important;
  `;

  addBtn.onclick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    showAddNoteModal(token, pageKey, wrapper);
  };
  wrapper.appendChild(addBtn);

  // ── Note cards ────────────────────────────────────────────────────────
  notes.forEach((note, i) => {
    const color = CARD_COLORS[note.colorIndex] || CARD_COLORS[0];
    const ytId = getYouTubeId(note.content) || (note.comment ? getYouTubeId(note.comment) : null);

    const defaultRight = 240;
    const saved = getSavedPos(note.id);

    const card = document.createElement("div");
    card.className = "sd-card";
    
    // Determine card sizing
    const cardWidth = ytId ? "260px" : "200px";
    const cardHeight = ytId ? "auto" : "130px";
    const minHeight = ytId ? "220px" : "auto";

    card.style.cssText = `
      position: fixed;
      ${saved
        ? `left:${saved.x}px; top:${saved.y}px;`
        : `right:${defaultRight}px; bottom:${24 + i * 145}px;`
      }
      width: ${cardWidth};
      height: ${cardHeight};
      min-height: ${minHeight};
      background: ${color.bg};
      border-top: 5px solid ${color.border};
      border-radius: 14px;
      padding: 10px 12px 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      font-family: 'Segoe UI', Arial, sans-serif;
      animation: sd-slide-in 0.3s ease;
      pointer-events: all;
      user-select: none;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    `;

    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-4px)";
      card.style.boxShadow = "0 8px 24px rgba(0,0,0,0.22)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
    });

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.className = "sd-close";
    closeBtn.textContent = "×";
    closeBtn.style.cssText = `
      position:absolute; top:4px; right:6px;
      background:none; border:none; font-size:16px;
      cursor:pointer; color:rgba(0,0,0,0.4);
      line-height:1; opacity:0.5; pointer-events:all;
    `;
    closeBtn.onclick = (e) => { e.stopPropagation(); card.remove(); };

    if (note.pinned) {
      const pin = document.createElement("span");
      pin.textContent = "📌";
      pin.style.cssText = `position:absolute;top:4px;right:24px;font-size:10px;`;
      card.appendChild(pin);
    }

    const viewMode = document.createElement("div");
    viewMode.style.cssText = "display:flex;flex-direction:column;flex:1;overflow:hidden;";

    // Content text
    const content = document.createElement("p");
    content.innerHTML = escapeAndLinkify(note.content, color);
    content.style.cssText = `
      font-size: 12px;
      color: #1a1a1a;
      line-height: 1.5;
      margin: 0 20px 0 0;
      word-break: break-word;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: ${ytId ? 2 : 3};
      -webkit-box-orient: vertical;
    `;
    viewMode.appendChild(content);

    // Comment
    if (note.comment) {
      const comment = document.createElement("p");
      comment.innerHTML = `💬 ${escapeAndLinkify(note.comment, color)}`;
      comment.style.cssText = `
        font-size: 10px;
        color: #555;
        font-style: italic;
        margin-top: 4px;
        border-top: 1px dashed ${color.border}44;
        padding-top: 4px;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
      `;
      viewMode.appendChild(comment);
    }

    // YouTube embed play inline
    if (ytId) {
      const ytEmbed = document.createElement("div");
      ytEmbed.style.cssText = `
        margin-top: 8px;
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      ytEmbed.innerHTML = `
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/${ytId}"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      `;
      viewMode.appendChild(ytEmbed);
    }

    // Bottom toolbar
    const toolbar = document.createElement("div");
    toolbar.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 6px;
      border-top: 1px solid ${color.border}22;
    `;

    const dateSpan = document.createElement("span");
    dateSpan.textContent = new Date(note.createdAt).toLocaleDateString();
    dateSpan.style.cssText = `font-size:9px;color:#888;`;

    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;gap:8px;align-items:center;";

    const editBtn = document.createElement("span");
    editBtn.textContent = "✏️";
    editBtn.title = "Edit";
    editBtn.style.cssText = `cursor:pointer;font-size:11px;opacity:0.6;transition:opacity 0.2s;color:${isPro ? "#fff" : "inherit"}`;
    editBtn.onmouseover = () => editBtn.style.opacity = "1";
    editBtn.onmouseout = () => editBtn.style.opacity = "0.6";

    const deleteBtn = document.createElement("span");
    deleteBtn.textContent = "🗑️";
    deleteBtn.title = "Delete";
    deleteBtn.style.cssText = `cursor:pointer;font-size:11px;opacity:0.6;transition:opacity 0.2s;color:${isPro ? "#fff" : "inherit"}`;
    deleteBtn.onmouseover = () => deleteBtn.style.opacity = "1";
    deleteBtn.onmouseout = () => deleteBtn.style.opacity = "0.6";

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    toolbar.appendChild(dateSpan);
    toolbar.appendChild(actions);
    viewMode.appendChild(toolbar);
    card.appendChild(closeBtn);
    card.appendChild(viewMode);

    // Edit mode
    const editMode = document.createElement("div");
    editMode.style.cssText = "display:none;flex-direction:column;flex:1;";

    const contentTextarea = document.createElement("textarea");
    contentTextarea.value = note.content;
    contentTextarea.style.cssText = `width:100%;height:50px;font-size:11px;padding:4px 6px;border:1px solid ${isPro ? color.proGlow : color.border};border-radius:6px;background:${isPro ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)"};color:${isPro ? "#fff" : "#000"};box-sizing:border-box;resize:none;font-family:inherit;`;

    const commentTextarea = document.createElement("textarea");
    commentTextarea.value = note.comment || "";
    commentTextarea.placeholder = "Comment...";
    commentTextarea.style.cssText = `width:100%;height:30px;font-size:10px;padding:4px 6px;border:1px solid ${isPro ? color.proGlow : color.border}55;border-radius:6px;background:${isPro ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.5)"};color:${isPro ? "#ddd" : "#000"};box-sizing:border-box;resize:none;margin-top:4px;font-family:inherit;`;

    const editActions = document.createElement("div");
    editActions.style.cssText = "display:flex;gap:6px;margin-top:6px;";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.style.cssText = `background:${isPro ? color.proGlow : color.border};color:#fff;border:none;border-radius:4px;padding:3px 10px;font-size:11px;cursor:pointer;`;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.cssText = `background:transparent;border:1px solid ${isPro ? color.proGlow : color.border};border-radius:4px;padding:3px 8px;font-size:11px;cursor:pointer;color:${isPro ? "#ccc" : "#333"};`;

    editActions.appendChild(saveBtn);
    editActions.appendChild(cancelBtn);
    editMode.appendChild(contentTextarea);
    editMode.appendChild(commentTextarea);
    editMode.appendChild(editActions);
    card.appendChild(editMode);

    // Wire events
    editBtn.onclick = (e) => {
      e.stopPropagation();
      viewMode.style.display = "none";
      editMode.style.display = "flex";
      contentTextarea.focus();
    };

    cancelBtn.onclick = (e) => {
      e.stopPropagation();
      contentTextarea.value = note.content;
      commentTextarea.value = note.comment || "";
      editMode.style.display = "none";
      viewMode.style.display = "flex";
    };

    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      // Show custom confirm popup inside the card
      const existing = card.querySelector(".sd-confirm");
      if (existing) { existing.remove(); return; }

      const confirmBox = document.createElement("div");
      confirmBox.className = "sd-confirm";
      confirmBox.style.cssText = `
        position: absolute; inset: 0;
        background: rgba(20,20,30,0.95);
        border-radius: 12px;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 12px; z-index: 10;
        padding: 12px;
        pointer-events: all;
      `;

      const msg = document.createElement("p");
      msg.textContent = "Delete this note?";
      msg.style.cssText = "color:#fff; font-size:12px; font-weight:600; margin:0; text-align:center;";

      const btnRow = document.createElement("div");
      btnRow.style.cssText = "display:flex; gap:8px;";

      const confirmDelBtn = document.createElement("button");
      confirmDelBtn.textContent = "Delete";
      confirmDelBtn.style.cssText = "background:#e53935; color:#fff; border:none; border-radius:6px; padding:5px 14px; font-size:11px; cursor:pointer; font-weight:700;";
      confirmDelBtn.onclick = async (ev) => {
        ev.stopPropagation();
        chrome.runtime.sendMessage({ type: "DELETE_NOTE", id: note.id }, (result) => {
          if (result?.ok) card.remove();
        });
      };

      const cancelDelBtn = document.createElement("button");
      cancelDelBtn.textContent = "Cancel";
      cancelDelBtn.style.cssText = "background:rgba(255,255,255,0.08); color:#fff; border:1px solid rgba(255,255,255,0.15); border-radius:6px; padding:5px 14px; font-size:11px; cursor:pointer;";
      cancelDelBtn.onclick = (ev) => { ev.stopPropagation(); confirmBox.remove(); };

      btnRow.appendChild(cancelDelBtn);
      btnRow.appendChild(confirmDelBtn);
      confirmBox.appendChild(msg);
      confirmBox.appendChild(btnRow);
      card.appendChild(confirmBox);
    };

    saveBtn.onclick = async (e) => {
      e.stopPropagation();
      const updatedContent = contentTextarea.value.trim();
      if (!updatedContent) return;
      saveBtn.textContent = "...";
      saveBtn.disabled = true;
      chrome.runtime.sendMessage({
        type: "UPDATE_NOTE", id: note.id,
        data: { content: updatedContent, comment: commentTextarea.value.trim() }
      }, (result) => {
        if (result?.ok && result?.data?.note) {
          note.content = result.data.note.content;
          note.comment = result.data.note.comment;
          content.innerHTML = escapeAndLinkify(note.content, color);
          editMode.style.display = "none";
          viewMode.style.display = "flex";
        }
        saveBtn.textContent = "Save";
        saveBtn.disabled = false;
      });
    };

    wrapper.appendChild(card);
    makeDraggable(card, note.id);
  });
}

// ── Add Note Modal (shown on page) ─────────────────────────────────────────
// ── Add Note Modal (shown on page) ─────────────────────────────────────────
function showAddNoteModal(token, pageKey, wrapper) {
  const existing = document.getElementById("sd-add-modal");
  if (existing) { existing.remove(); return; }

  const CARD_COLORS = ["#FFF9C4", "#C8E6C9", "#BBDEFB", "#F8BBD0", "#E1BEE7", "#FFE0B2"];
  let selectedColor = 0;

  const overlay = document.createElement("div");
  overlay.id = "sd-add-modal";
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: transparent;
    z-index: 2147483647;
    pointer-events: none;
    font-family: 'Segoe UI', Arial, sans-serif;
  `;

  overlay.addEventListener("mousedown", (e) => e.stopPropagation());
  overlay.addEventListener("keydown", (e) => e.stopPropagation());

  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed !important;
    bottom: 85px !important;
    right: 24px !important;
    background: #ffffff;
    border: 1px solid rgba(234,88,12,0.2);
    border-radius: 16px;
    padding: 22px 24px 20px;
    width: 360px;
    box-sizing: border-box;
    box-shadow: 0 16px 48px rgba(234,88,12,0.18), 0 4px 16px rgba(0,0,0,0.08);
    pointer-events: all !important;
    animation: sd-slide-in 0.3s ease;
    font-family: 'Segoe UI', Arial, sans-serif;
  `;

  // Header Title Bar
  const header = document.createElement("div");
  header.style.cssText = "display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;";

  const titleWrapper = document.createElement("div");
  titleWrapper.style.cssText = "display:flex; align-items:center; gap:8px;";

  const docIcon = document.createElement("span");
  docIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`;
  docIcon.style.cssText = "display:flex; align-items:center;";

  const title = document.createElement("span");
  title.textContent = "New Note";
  title.style.cssText = "color:#1a0a00; font-size:14px; font-weight:700;";

  titleWrapper.appendChild(docIcon);
  titleWrapper.appendChild(title);

  const closeX = document.createElement("span");
  closeX.textContent = "✕";
  closeX.style.cssText = "color:rgba(120,53,15,0.5); cursor:pointer; font-size:14px; font-weight:bold;";
  closeX.onclick = () => overlay.remove();

  header.appendChild(titleWrapper);
  header.appendChild(closeX);
  modal.appendChild(header);

  // Content textarea
  const textarea = document.createElement("textarea");
  textarea.placeholder = "Type your note here...";
  textarea.style.cssText = `
    width: 100%; min-height: 85px;
    background: #fff8f3;
    border: 1px solid rgba(234,88,12,0.25);
    border-radius: 8px; padding: 12px;
    color: #1a0a00; font-size: 13px;
    resize: none; box-sizing: border-box;
    font-family: inherit; outline: none;
    transition: border-color 0.15s;
    margin-bottom: 12px;
  `;
  textarea.onfocus = () => { textarea.style.borderColor = "#ea580c"; textarea.style.boxShadow = "0 0 0 3px rgba(234,88,12,0.1)"; };
  textarea.onblur = () => { textarea.style.borderColor = "rgba(234,88,12,0.25)"; textarea.style.boxShadow = "none"; };

  // Comment textarea
  const commentArea = document.createElement("textarea");
  commentArea.placeholder = "Add a comment (optional)...";
  commentArea.style.cssText = `
    width: 100%; min-height: 40px;
    background: #fff4ee;
    border: 1px solid rgba(234,88,12,0.15);
    border-radius: 8px; padding: 10px 12px;
    color: #78350f; font-size: 12px;
    resize: none; box-sizing: border-box;
    font-family: inherit; outline: none;
    transition: border-color 0.15s;
    margin-bottom: 14px;
  `;
  commentArea.onfocus = () => { commentArea.style.borderColor = "#ea580c"; }
  commentArea.onblur = () => { commentArea.style.borderColor = "rgba(234,88,12,0.15)"; }

  modal.appendChild(textarea);
  modal.appendChild(commentArea);

  // Checkbox row: "Pin to current app (Chrome)"
  const checkboxRow = document.createElement("div");
  checkboxRow.style.cssText = "display:flex; align-items:center; gap:8px; margin-bottom:16px; pointer-events:all;";

  const checkbox = document.createElement("div");
  checkbox.style.cssText = `
    width: 14px; height: 14px;
    background: #ffa726;
    border-radius: 3px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
  `;
  checkbox.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  const checkboxLabel = document.createElement("span");
  let pageTitleText = document.title || "this page";
  if (pageTitleText.length > 25) pageTitleText = pageTitleText.substring(0, 25) + "...";
  checkboxLabel.textContent = `Pin to current page (${pageTitleText})`;
  checkboxLabel.style.cssText = "font-size:11px; color:#78350f; cursor:pointer; font-weight:500;";

  checkboxRow.appendChild(checkbox);
  checkboxRow.appendChild(checkboxLabel);
  modal.appendChild(checkboxRow);

  // Color picker row
  const colorRow = document.createElement("div");
  colorRow.style.cssText = "display:flex; gap:8px; align-items:center; margin-bottom:20px;";

  const colorLabel = document.createElement("span");
  colorLabel.textContent = "Color:";
  colorLabel.style.cssText = "font-size:12px; color:#92400e; margin-right:4px; font-weight:600;"
  colorRow.appendChild(colorLabel);

  const EXT_COLORS = [
    { bg: "#FFF9C4", border: "#F59E0B" }, // Sunflower Yellow
    { bg: "#FFE8D6", border: "#EA580C" }, // Amber Orange
    { bg: "#FFE4E6", border: "#F43F5E" }, // Coral Rose
    { bg: "#D1FAE5", border: "#10B981" }, // Emerald Green
    { bg: "#E0F2FE", border: "#0284C7" }, // Sky Blue
    { bg: "#F3E8FF", border: "#8B5CF6" }, // Lavender Purple
  ];

  EXT_COLORS.forEach((c, i) => {
    const dot = document.createElement("div");
    dot.style.cssText = `
      width: 20px; height: 20px;
      border-radius: 50%;
      background: ${c.bg};
      cursor: pointer;
      box-sizing: border-box;
      border: 3px solid ${i === 0 ? c.border : "transparent"};
      transition: transform .15s, border-color .15s;
      box-shadow: 0 2px 6px ${c.border}44;
    `;
    dot.onclick = () => {
      selectedColor = i;
      colorRow.querySelectorAll("div").forEach((d, j) => {
        d.style.border = j === i ? `3px solid ${EXT_COLORS[j].border}` : "3px solid transparent";
        d.style.transform = j === i ? "scale(1.25)" : "scale(1)";
      });
    };
    colorRow.appendChild(dot);
  });
  modal.appendChild(colorRow);

  // Bottom buttons row
  const btnRow = document.createElement("div");
  btnRow.style.cssText = "display:flex; gap:10px; justify-content:flex-end; align-items:center;";

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.style.cssText = `
    padding: 8px 18px;
    border: 1px solid rgba(234,88,12,0.2);
    background: transparent;
    color: #92400e;
    font-size: 13px;
    cursor: pointer;
    font-weight: 600;
    border-radius: 8px;
    font-family: inherit;
  `;
  cancelBtn.onclick = () => overlay.remove();

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Save Note";
  saveBtn.style.cssText = `
    padding: 8px 20px;
    background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(255, 167, 38, 0.2);
  `;

  saveBtn.onclick = async (e) => {
    e.stopPropagation();
    const contentVal = textarea.value.trim();
    if (!contentVal) return;
    saveBtn.textContent = "Saving...";
    saveBtn.disabled = true;
    const t = await getToken();
    if (!t) {
      saveBtn.textContent = "Login required";
      setTimeout(() => { saveBtn.textContent = "Save Note"; saveBtn.disabled = false; }, 2000);
      return;
    }
    chrome.runtime.sendMessage({
      type: "SAVE_NOTE",
      data: {
        content: contentVal,
        comment: commentArea.value.trim(),
        colorIndex: selectedColor,
        pageKey,
        pageUrl: window.location.href,
        pageTitle: document.title,
        pinned: true
      }
    }, async (result) => {
      if (chrome.runtime.lastError) {
        saveBtn.textContent = "Error - Retry";
        setTimeout(() => { saveBtn.textContent = "Save Note"; saveBtn.disabled = false; }, 2000);
        return;
      }
      if (result?.ok) {
        overlay.remove();
        const { notes, plan } = await fetchNotesForPage(pageKey, t);
        createWidget(notes, t, pageKey, plan);
      } else {
        saveBtn.textContent = "Failed - Retry";
        setTimeout(() => { saveBtn.textContent = "Save Note"; saveBtn.disabled = false; }, 2000);
      }
    });
  };

  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(saveBtn);
  modal.appendChild(btnRow);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  setTimeout(() => textarea.focus(), 100);
}

async function init() {
  console.log("[StickyDesk] init() execution started. URL:", window.location.href);
  try {
    const token = await getToken();
    console.log("[StickyDesk] Token resolved:", token ? "YES (length: " + token.length + ")" : "NO (null/undefined)");
    if (!token) {
      console.warn("[StickyDesk] No token found in chrome.storage.local. Extension features will not load until connected.");
      return;
    }

    const pageKey = pageKeyFromURL(window.location.href);
    console.log("[StickyDesk] Calculated pageKey:", pageKey);

    const { notes, plan } = await fetchNotesForPage(pageKey, token);
    console.log("[StickyDesk] Fetched notes count:", notes.length, "plan:", plan);

    createWidget(notes, token, pageKey, plan);
    console.log("[StickyDesk] createWidget finished executing.");
  } catch (err) {
    console.error("[StickyDesk] Error during initialization:", err);
  }
}

init();

// Re-run when URL changes (YouTube SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    console.log("[StickyDesk] URL changed from", lastUrl, "to", location.href, "- re-triggering init()");
    lastUrl = location.href;
    setTimeout(init, 800);
  }
}).observe(document, { subtree: true, childList: true });