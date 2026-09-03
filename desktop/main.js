const { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const { spawn } = require('child_process');

const API_BASE = 'http://localhost:3000';
const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');
const MONITOR_SCRIPT = path.join(__dirname, 'monitorWindow.ps1');

// ── Active Window Helper ──────────────────────────────────────────────────
let lastActiveWindow = { process: 'Desktop App', title: '' };
let monitorProcess = null;

function formatAppName(pName, title) {
  if (!pName) return 'Desktop App';
  const lowP = pName.toLowerCase();
  const lowT = (title || '').toLowerCase();

  if (lowP.includes('antigravity') || lowT.includes('antigravity')) return 'Antigravity IDE';
  if (lowP.includes('code') || lowT.includes('visual studio code')) return 'VS Code';
  if (lowP.includes('teams') || lowT.includes('microsoft teams')) return 'Microsoft Teams';
  if (lowP.includes('spotify')) return 'Spotify';
  if (lowP.includes('slack')) return 'Slack';
  if (lowP.includes('notepad')) return 'Notepad';
  if (lowP.includes('explorer')) return 'File Explorer';

  // ── Browser: detect actual website from window title ──
  const isBrowser = lowP.includes('chrome') || lowP.includes('msedge') || lowP.includes('edge') || lowP.includes('firefox');
  if (isBrowser) {
    if (lowT.includes('gmail') || lowT.includes('mail.google')) return 'Gmail';
    if (lowT.includes('youtube')) return 'YouTube';
    if (lowT.includes('chatgpt') || lowT.includes('chat.openai')) return 'ChatGPT';
    if (lowT.includes('claude')) return 'Claude AI';
    if (lowT.includes('github')) return 'GitHub';
    if (lowT.includes('google meet') || lowT.includes('meet.google')) return 'Google Meet';
    if (lowT.includes('google docs')) return 'Google Docs';
    if (lowT.includes('google sheets')) return 'Google Sheets';
    if (lowT.includes('google drive')) return 'Google Drive';
    if (lowT.includes('notion')) return 'Notion';
    if (lowT.includes('figma')) return 'Figma';
    if (lowT.includes('stackoverflow') || lowT.includes('stack overflow')) return 'Stack Overflow';
    if (lowT.includes('twitter') || lowT.includes('x.com')) return 'Twitter / X';
    if (lowT.includes('linkedin')) return 'LinkedIn';
    if (lowT.includes('whatsapp')) return 'WhatsApp Web';
    if (lowT.includes('instagram')) return 'Instagram';
    if (lowT.includes('facebook')) return 'Facebook';
    if (lowT.includes('reddit')) return 'Reddit';
    if (lowT.includes('netflix')) return 'Netflix';
    if (lowT.includes('spotify')) return 'Spotify Web';
    if (lowT.includes('jira')) return 'Jira';
    if (lowT.includes('confluence')) return 'Confluence';
    if (lowT.includes('trello')) return 'Trello';
    if (lowT.includes('localhost')) return 'Localhost';
    // Fall back to browser name
    if (lowP.includes('chrome')) return 'Google Chrome';
    if (lowP.includes('msedge') || lowP.includes('edge')) return 'Microsoft Edge';
    if (lowP.includes('firefox')) return 'Firefox';
  }

  return pName.charAt(0).toUpperCase() + pName.slice(1);
}


function startWindowMonitor() {
  try {
    monitorProcess = spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', MONITOR_SCRIPT]);

    let buffer = '';
    monitorProcess.stdout.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep partial line

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && parsed.process) {
            const friendlyName = formatAppName(parsed.process, parsed.title);
            lastActiveWindow = { process: friendlyName, rawProcess: parsed.process, title: parsed.title };
            if (win && !win.isDestroyed()) {
              win.webContents.send('active-window-changed', lastActiveWindow);
            }
          }
        } catch (e) {}
      });
    });
  } catch (e) {}
}

// ── Load / Save local config ──────────────────────────────────────────────
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    }
  } catch (e) {}
  return { notes: [], token: null };
}

function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, '\t'), 'utf8');
  } catch (e) {}
}

// ── POST note to API server ───────────────────────────────────────────────
async function postNoteToAPI(noteData, token) {
  if (!token) return null;
  try {
    const body = JSON.stringify({
      content: noteData.content,
      comment: noteData.comment || '',
      colorIndex: noteData.colorIndex || 0,
      pageKey: noteData.targetApp ? `desktop-${noteData.targetApp.toLowerCase()}` : 'desktop',
      pageUrl: 'desktop://stickydesk',
      pageTitle: noteData.targetApp || 'StickyDesk Desktop',
      pinned: true,
    });

    const urlObj = new URL(`${API_BASE}/api/notes`);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    return new Promise((resolve) => {
      const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch { resolve(null); }
        });
      });
      req.on('error', () => resolve(null));
      req.write(body);
      req.end();
    });
  } catch (e) { return null; }
}

// ── DELETE note from API server ───────────────────────────────────────────
async function deleteNoteFromAPI(noteId, token) {
  if (!token || !noteId) return;
  try {
    const urlObj = new URL(`${API_BASE}/api/notes/${noteId}`);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    };
    return new Promise((resolve) => {
      const req = (urlObj.protocol === 'https:' ? https : http).request(options, () => resolve());
      req.on('error', () => resolve());
      req.end();
    });
  } catch (e) {}
}

// ── UPDATE note in API server ───────────────────────────────────────────
async function updateNoteInAPI(noteId, noteData, token) {
  if (!token || !noteId) return null;
  try {
    const body = JSON.stringify({
      content: noteData.content,
      comment: noteData.comment || '',
      colorIndex: noteData.colorIndex !== undefined ? noteData.colorIndex : 0,
    });

    const urlObj = new URL(`${API_BASE}/api/notes/${noteId}`);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    return new Promise((resolve) => {
      const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); } catch { resolve(null); }
        });
      });
      req.on('error', () => resolve(null));
      req.write(body);
      req.end();
    });
  } catch (e) { return null; }
}


// ── Fetch all desktop notes from API ────────────────────────────────────
async function fetchDesktopNotesFromAPI(token) {
  if (!token) return [];
  try {
    const urlObj = new URL(`${API_BASE}/api/notes`);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    };
    return new Promise((resolve) => {
      const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.notes || []);
          } catch { resolve([]); }
        });
      });
      req.on('error', () => resolve([]));
      req.end();
    });
  } catch (e) { return []; }
}

let win = null;
let tray = null;

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.bounds;

  win = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    show: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.setIgnoreMouseEvents(true, { forward: true });
  win.loadFile(path.join(__dirname, 'index.html'));

  startWindowMonitor();
}

app.whenReady().then(() => {
  createWindow();

  // Tray icon
  const iconPath = path.join(__dirname, 'icon.png');
  if (fs.existsSync(iconPath)) {
    tray = new Tray(iconPath);
  } else {
    tray = new Tray(nativeImage.createEmpty());
  }

  tray.setToolTip('StickyDesk Desktop Overlay');
  tray.on('click', () => {
    if (win) {
      if (win.isVisible()) {
        win.hide();
      } else {
        win.show();
      }
    }
  });

  globalShortcut.register('CommandOrControl+Shift+N', () => {
    if (win) {
      if (win.isVisible()) {
        win.hide();
      } else {
        win.show();
      }
    }
  });
});

// ── IPC Handlers ─────────────────────────────────────────────────────────

const { execFile } = require('child_process');

ipcMain.handle('get-open-apps', async () => {
  return new Promise((resolve) => {
    execFile('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', 
      "Get-Process | Where-Object {$_.MainWindowTitle -ne ''} | Select-Object -Unique ProcessName, MainWindowTitle | ConvertTo-Json -Compress"
    ], (err, stdout) => {
      if (err || !stdout) { resolve([]); return; }
      try {
        const parsed = JSON.parse(stdout.trim());
        const list = Array.isArray(parsed) ? parsed : [parsed];
        const apps = list
          .filter(a => a.ProcessName && !['electron', 'stickydesk-desktop', 'powershell', 'cmd', 'conhost'].includes(a.ProcessName.toLowerCase()))
          .map(a => ({
            process: a.ProcessName,
            title: a.MainWindowTitle,
            name: formatAppName(a.ProcessName, a.MainWindowTitle)
          }));
        resolve(apps);
      } catch { resolve([]); }
    });
  });
});

ipcMain.handle('get-active-window', async () => {
  return lastActiveWindow;
});

ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  const webContents = event.sender;
  const winToUpdate = BrowserWindow.fromWebContents(webContents);
  if (winToUpdate) {
    winToUpdate.setIgnoreMouseEvents(ignore, options || { forward: true });
  }
});

// Load notes: prefer API, fall back to local
ipcMain.handle('load-notes', async () => {
  const cfg = loadConfig();
  const token = cfg.token || null;

  if (token) {
    try {
      const apiNotes = await fetchDesktopNotesFromAPI(token);
      // Filter only desktop-created notes
      const desktopNotes = apiNotes.filter(n => n.page && n.page.pageKey && n.page.pageKey.startsWith('desktop'));
      if (desktopNotes.length > 0 || apiNotes.length >= 0) {
        cfg.notes = desktopNotes.map(n => ({
          id: n.id,
          apiId: n.id,
          content: n.content,
          comment: n.comment || '',
          colorIndex: n.colorIndex || 0,
          targetApp: n.page ? n.page.title : (n.targetApp || null),
          x: n.posX || 100,
          y: n.posY || 100,
          createdAt: n.createdAt,
        }));
        saveConfig(cfg);
        return cfg.notes;
      }
    } catch (e) {}
  }

  return cfg.notes || [];
});

// Save note: save to API first (for sync), then to local config
ipcMain.handle('save-note', async (event, note) => {
  const cfg = loadConfig();
  const token = cfg.token || null;

  let apiId = null;

  if (token) {
    const result = await postNoteToAPI(note, token);
    if (result && result.note) {
      apiId = result.note.id;
    }
  }

  const newNote = {
    ...note,
    id: apiId || note.id || Date.now().toString(),
    apiId: apiId || null,
    targetApp: note.targetApp || null,
    createdAt: note.createdAt || new Date().toISOString(),
  };

  cfg.notes = cfg.notes || [];
  cfg.notes.push(newNote);
  saveConfig(cfg);

  return newNote;
});

// Delete note: from API + local
ipcMain.handle('delete-note', async (event, noteId) => {
  const cfg = loadConfig();
  const token = cfg.token || null;

  const note = (cfg.notes || []).find(n => n.id === noteId);

  if (token && note) {
    const idToDelete = note.apiId || note.id;
    await deleteNoteFromAPI(idToDelete, token);
  }

  cfg.notes = (cfg.notes || []).filter(n => n.id !== noteId);
  saveConfig(cfg);
  return true;
});

// Update note: API + local
ipcMain.handle('update-note', async (event, { id, content, comment, colorIndex }) => {
  const cfg = loadConfig();
  const token = cfg.token || null;

  const note = (cfg.notes || []).find(n => n.id === id);
  if (note) {
    if (content !== undefined) note.content = content;
    if (comment !== undefined) note.comment = comment;
    if (colorIndex !== undefined) note.colorIndex = colorIndex;

    const idToUpdate = note.apiId || note.id;
    if (token && idToUpdate) {
      await updateNoteInAPI(idToUpdate, { content: note.content, comment: note.comment, colorIndex: note.colorIndex }, token);
    }

    saveConfig(cfg);
  }
  return note || true;
});

// Update note position locally
ipcMain.handle('update-note-pos', (event, { id, x, y }) => {
  const cfg = loadConfig();
  const note = (cfg.notes || []).find(n => n.id === id);
  if (note) { note.x = x; note.y = y; }
  saveConfig(cfg);
  return true;
});

// Get token
ipcMain.handle('get-token', () => {
  const cfg = loadConfig();
  return cfg.token || null;
});

// Set token
ipcMain.handle('set-token', (event, token) => {
  const cfg = loadConfig();
  cfg.token = token;
  saveConfig(cfg);
  return true;
});

app.on('window-all-closed', () => {
  if (monitorProcess) monitorProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  if (monitorProcess) monitorProcess.kill();
  globalShortcut.unregisterAll();
});
