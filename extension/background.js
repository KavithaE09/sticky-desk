const API_BASE = "http://localhost:3000";

async function apiFetch(path, options = {}) {
  const urlObj = new URL(`${API_BASE}${path}`);
  const headers = options.headers || {};
  const method = options.method || "GET";
  const body = options.body;

  try {
    const res = await fetch(urlObj.toString(), { method, headers, body });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, error: e.message, data: {} };
  }
}

// When tab changes, notify content script
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url && !tab.url.startsWith("chrome://")) {
      chrome.tabs.sendMessage(tabId, { type: "TAB_ACTIVATED", url: tab.url, title: tab.title }).catch(() => {});
    }
  } catch {}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active && tab.url && !tab.url.startsWith("chrome://")) {
    chrome.tabs.sendMessage(tabId, { type: "TAB_ACTIVATED", url: tab.url, title: tab.title }).catch(() => {});
  }
});

chrome.runtime.onMessage.addListener((msg, sender, reply) => {

  // GET notes for a page
  if (msg.type === "GET_NOTES") {
    chrome.storage.local.get(["sd_token", "token"], async ({ sd_token, token }) => {
      const t = sd_token || token;
      if (!t) { reply({ notes: [], error: "Not logged in" }); return; }
      const result = await apiFetch(`/api/notes?pageKey=${encodeURIComponent(msg.pageKey)}`, {
        headers: { "Authorization": `Bearer ${t}` }
      });
      reply({ notes: result.data.notes || [], plan: result.data.plan || "free" });
    });
    return true;
  }

  // SAVE new note
  if (msg.type === "SAVE_NOTE") {
    chrome.storage.local.get(["sd_token", "token"], async ({ sd_token, token }) => {
      const t = sd_token || token;
      if (!t) { reply({ ok: false, error: "Not logged in" }); return; }
      const result = await apiFetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${t}` },
        body: JSON.stringify(msg.data)
      });
      reply(result);
    });
    return true;
  }

  // UPDATE note
  if (msg.type === "UPDATE_NOTE") {
    chrome.storage.local.get(["sd_token", "token"], async ({ sd_token, token }) => {
      const t = sd_token || token;
      if (!t) { reply({ ok: false, error: "Not logged in" }); return; }
      const result = await apiFetch(`/api/notes/${msg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${t}` },
        body: JSON.stringify(msg.data)
      });
      reply(result);
    });
    return true;
  }

  // DELETE note
  if (msg.type === "DELETE_NOTE") {
    chrome.storage.local.get(["sd_token", "token"], async ({ sd_token, token }) => {
      const t = sd_token || token;
      if (!t) { reply({ ok: false, error: "Not logged in" }); return; }
      const result = await apiFetch(`/api/notes/${msg.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${t}` }
      });
      reply(result);
    });
    return true;
  }

});
