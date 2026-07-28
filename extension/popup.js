const API_BASE = "http://localhost:3000";
const COLORS = [
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

let currentTab = null;

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;
  const pKey = pageKeyFromURL(tab.url);
  document.getElementById("pageInfo").textContent = `📌 Pinned to: ${pKey}`;

  const { sd_token } = await chrome.storage.local.get("sd_token");
  if (!sd_token) {
    showLoginScreen();
    return;
  }
  loadNotes(tab, sd_token);
}

function showLoginScreen() {
  document.getElementById("content").innerHTML = `
    <div class="login-msg">
      <p style="color:#8892b0;font-size:13px;margin-bottom:12px">
        Login to StickyDesk first
      </p>
      <a href="${API_BASE}/auth" target="_blank"
         style="display:block;background:#f9a825;color:#fff;padding:9px 16px;border-radius:7px;font-size:13px;font-weight:600;text-align:center;margin-bottom:10px">
        🔑 Open Login Page →
      </a>
      <div style="text-align:center;margin:10px 0;color:#555;font-size:11px">— after login —</div>
      <input id="emailInput" type="email" placeholder="Your email"
        style="width:100%;padding:8px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:7px;color:#fff;font-size:12px;margin-bottom:8px;box-sizing:border-box" />
      <input id="passInput" type="password" placeholder="Your password"
        style="width:100%;padding:8px 10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.15);border-radius:7px;color:#fff;font-size:12px;margin-bottom:8px;box-sizing:border-box" />
      <button id="loginBtn"
        style="width:100%;background:rgba(249,168,37,0.15);border:1px solid #f9a825;color:#f9a825;padding:8px;border-radius:7px;cursor:pointer;font-size:12px;font-weight:600">
        ✓ Connect Account
      </button>
      <div id="loginStatus" style="font-size:11px;color:#f9a825;text-align:center;margin-top:6px"></div>
    </div>`;

  document.getElementById("loginBtn").addEventListener("click", doLogin);
}

async function doLogin() {
  const email = document.getElementById("emailInput").value.trim();
  const pass = document.getElementById("passInput").value;
  const status = document.getElementById("loginStatus");

  if (!email || !pass) { status.textContent = "Email & password required!"; return; }
  status.textContent = "Connecting...";

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      await chrome.storage.local.set({ token: data.token, sd_token: data.token, sd_email: data.email });
      status.textContent = "✅ Connected!";
      setTimeout(() => loadNotes(currentTab, data.token), 500);
    } else {
      status.textContent = `❌ ${data.error || "Wrong email or password"}`;
    }
  } catch (e) {
    status.textContent = "❌ Cannot connect to StickyDesk";
  }
}

async function loadNotes(tab, token) {
  const pageKey = pageKeyFromURL(tab.url);

  let pageNotes = [];
  let plan = "free";
  try {
    const res = await fetch(`${API_BASE}/api/notes?pageKey=${encodeURIComponent(pageKey)}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      pageNotes = data.notes || [];
      plan = data.plan || "free";
    } else if (res.status === 401) {
      await chrome.storage.local.remove("sd_token");
      showLoginScreen();
      return;
    }
  } catch {}

  const { sd_email } = await chrome.storage.local.get("sd_email");

  document.getElementById("content").innerHTML = `
    <div style="padding:8px 10px;font-size:10px;color:#555;display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.05)">
      <span>👤 ${sd_email || "logged in"}</span>
      <span id="logoutBtn" style="cursor:pointer;color:#f9a825">logout</span>
    </div>
    <div class="notes-list" id="notesList">
      ${pageNotes.length === 0
        ? '<div class="empty">No notes for this page yet</div>'
        : pageNotes.map(n => {
          const color = COLORS[n.colorIndex] || COLORS[0];
          const ytId = getYouTubeId(n.content) || (n.comment ? getYouTubeId(n.comment) : null);
          
          return `
          <div class="note-card" style="
            background: ${color.bg};
            border-top: 5px solid ${color.border};
            border-radius: 12px;
            padding: 10px 12px 8px;
            margin-bottom: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            position: relative;
            box-sizing: border-box;
            overflow: hidden;
          ">
            <div id="view-${n.id}">
              <p style="
                font-size: 12px;
                color: #1a1a1a;
                line-height: 1.5;
                margin: 0;
                word-break: break-word;
              ">${escapeAndLinkify(n.content, color)}</p>
              
              ${n.comment ? `<p class="comment" style="
                font-size: 11px;
                color: #555;
                font-style: italic;
                margin-top: 6px;
                border-top: 1px dashed ${color.border}44;
                padding-top: 4px;
                margin-bottom: 0;
              ">💬 ${escapeAndLinkify(n.comment, color)}</p>` : ""}
              
              ${ytId ? `
                <div style="
                  margin-top: 8px;
                  width: 100%;
                  aspect-ratio: 16 / 9;
                  border-radius: 6px;
                  overflow: hidden;
                  border: 1px solid rgba(0,0,0,0.1);
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                ">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/${ytId}"
                    title="YouTube video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                  ></iframe>
                </div>
              ` : ""}

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; border-top: 1px dashed ${color.border}22; padding-top: 6px;">
                <div style="display: flex; gap: 12px; align-items: center;">
                  <span class="edit-btn" data-id="${n.id}" style="cursor: pointer; font-size: 11px; opacity: 0.6; color: inherit;">✏️</span>
                  <span class="delete-btn" data-id="${n.id}" style="cursor: pointer; font-size: 11px; opacity: 0.6; color: inherit;">🗑️</span>
                </div>
                ${n.pinned ? `<span style="font-size: 10px; color: #666;">📌 pinned</span>` : ""}
              </div>
            </div>
            <div id="edit-${n.id}" style="display: none; margin-top: 4px;">
              <textarea class="edit-content" style="width: 100%; height: 50px; font-size: 12px; padding: 5px; border: 1px solid ${color.border}; border-radius: 4px; box-sizing: border-box; resize: vertical; font-family: inherit; color: #000; background: rgba(255, 255, 255, 0.8); outline: none;">${n.content}</textarea>
              <textarea class="edit-comment" placeholder="Comment (optional)..." style="width: 100%; height: 35px; font-size: 11px; padding: 5px; border: 1px solid ${color.border}55; border-radius: 4px; margin-top: 4px; box-sizing: border-box; resize: vertical; font-family: inherit; color: #000; background: rgba(255, 255, 255, 0.6); outline: none;">${n.comment || ""}</textarea>
              <div style="display: flex; gap: 6px; margin-top: 6px;">
                <button class="save-btn" data-id="${n.id}" style="background: #2E7D32; color: #fff; border: none; border-radius: 3px; padding: 3px 8px; font-size: 10px; cursor: pointer;">Save</button>
                <button class="cancel-btn" data-id="${n.id}" style="background: transparent; border: 1px solid ${color.border}; border-radius: 3px; padding: 3px 6px; font-size: 10px; cursor: pointer; color: #333;">Cancel</button>
              </div>
            </div>
          </div>`;
        }).join("")
      }
    </div>
    <div class="add-section">
      <div id="status"></div>
      <textarea id="noteContent" rows="3" placeholder="New note..."></textarea>
      <textarea id="noteComment" rows="2" placeholder="Comment (optional)..." style="margin-top:6px"></textarea>
      <div style="font-size:11px; color:#92400e; font-weight:700; background:#fff4ee; border:1px solid rgba(234,88,12,0.2); padding:6px 10px; border-radius:6px; margin: 8px 0 4px; display:flex; align-items:center; gap:6px;">
        <span style="font-size:12px">📌</span> Auto-pinned to current webpage
      </div>
      <button id="saveBtn" class="btn">Save Note</button>
    </div>`;

  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("saveBtn").addEventListener("click", () =>
    addNote(pageKey, tab.url, tab.title || "")
  );

  // Hook up edit/delete event listeners
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      document.getElementById(`view-${id}`).style.display = "none";
      document.getElementById(`edit-${id}`).style.display = "block";
    };
  });

  document.querySelectorAll(".cancel-btn").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      document.getElementById(`edit-${id}`).style.display = "none";
      document.getElementById(`view-${id}`).style.display = "block";
    };
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const noteCard = btn.closest(".note-card");
      if (!noteCard) return;

      // Remove any existing confirm overlay first
      const existing = noteCard.querySelector(".delete-confirm-overlay");
      if (existing) { existing.remove(); return; }

      // Create styled inline delete confirmation overlay (like web app)
      const overlay = document.createElement("div");
      overlay.className = "delete-confirm-overlay";
      overlay.innerHTML = `
        <p>Delete this note?</p>
        <div class="del-btn-row">
          <button class="cancel-del-btn">Cancel</button>
          <button class="confirm-del-btn">Delete</button>
        </div>
      `;
      noteCard.appendChild(overlay);

      overlay.querySelector(".cancel-del-btn").onclick = (ev) => {
        ev.stopPropagation();
        overlay.remove();
      };

      overlay.querySelector(".confirm-del-btn").onclick = async (ev) => {
        ev.stopPropagation();
        const { sd_token } = await chrome.storage.local.get("sd_token");
        try {
          const res = await fetch(`${API_BASE}/api/notes/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${sd_token}` }
          });
          if (res.ok) {
            loadNotes(tab, token);
          } else {
            overlay.remove();
          }
        } catch {
          overlay.remove();
        }
      };
    };
  });

  document.querySelectorAll(".save-btn").forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute("data-id");
      const editDiv = document.getElementById(`edit-${id}`);
      const contentTextarea = editDiv.querySelector(".edit-content");
      const commentTextarea = editDiv.querySelector(".edit-comment");
      const content = contentTextarea.value.trim();
      const comment = commentTextarea.value.trim();
      if (!content) return;

      btn.textContent = "Saving...";
      btn.disabled = true;

      const { sd_token } = await chrome.storage.local.get("sd_token");
      try {
        const res = await fetch(`${API_BASE}/api/notes/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sd_token}`
          },
          body: JSON.stringify({ content, comment })
        });
        if (res.ok) {
          loadNotes(tab, token);
        } else {
          alert("Failed to save changes.");
        }
      } catch {
        alert("Error saving note.");
      } finally {
        btn.textContent = "Save";
        btn.disabled = false;
      }
    };
  });
}

async function addNote(pageKey, pageUrl, pageTitle) {
  const content = document.getElementById("noteContent").value.trim();
  const comment = document.getElementById("noteComment").value.trim();
  const pinned = true;
  const status = document.getElementById("status");

  if (!content) { status.textContent = "Note empty!"; return; }
  status.textContent = "Saving...";

  try {
    const { sd_token } = await chrome.storage.local.get("sd_token");
    const res = await fetch(`${API_BASE}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sd_token}` },
      body: JSON.stringify({ content, comment, pinned, pageKey, pageUrl, pageTitle, colorIndex: 0 }),
    });
    const data = await res.json();
    if (res.ok) {
      status.textContent = "✅ Saved!";
      document.getElementById("noteContent").value = "";
      document.getElementById("noteComment").value = "";
      const { sd_token: token } = await chrome.storage.local.get("sd_token");
      setTimeout(() => loadNotes(currentTab, token), 600);
    } else {
      status.textContent = data.error || "Error!";
    }
  } catch {
    status.textContent = "❌ Save failed";
  }
}

async function logout() {
  await chrome.storage.local.remove(["sd_token", "sd_email"]);
  showLoginScreen();
}

init();