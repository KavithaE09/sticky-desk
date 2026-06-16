// IMPORTANT: Change this to your deployed Vercel URL
const API_BASE = "http://localhost:3000";

// Fetch notes for current tab's page
async function fetchNotesForPage(pageKey, token) {
  try {
    const res = await fetch(`${API_BASE}/api/notes?pageKey=${encodeURIComponent(pageKey)}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.notes || [];
  } catch { return []; }
}

// Save note for a page
async function saveNote(noteData, token) {
  try {
    const res = await fetch(`${API_BASE}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(noteData),
    });
    return await res.json();
  } catch { return null; }
}

// When tab changes, notify content script
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url && !tab.url.startsWith("chrome://")) {
      chrome.tabs.sendMessage(tabId, { type: "TAB_ACTIVATED", url: tab.url, title: tab.title });
    }
  } catch {}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active && tab.url && !tab.url.startsWith("chrome://")) {
    chrome.tabs.sendMessage(tabId, { type: "TAB_ACTIVATED", url: tab.url, title: tab.title }).catch(() => {});
  }
});

// Listen from popup/content
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type === "GET_NOTES") {
    chrome.storage.local.get("token", async ({ token }) => {
      if (!token) { reply({ notes: [], error: "Not logged in" }); return; }
      const notes = await fetchNotesForPage(msg.pageKey, token);
      reply({ notes });
    });
    return true;
  }
  if (msg.type === "SAVE_NOTE") {
    chrome.storage.local.get("token", async ({ token }) => {
      if (!token) { reply({ error: "Not logged in" }); return; }
      const result = await saveNote(msg.data, token);
      reply(result);
    });
    return true;
  }
});
