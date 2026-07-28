const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadNotes: () => ipcRenderer.invoke('load-notes'),
  saveNote: (note) => ipcRenderer.invoke('save-note', note),
  updateNote: (note) => ipcRenderer.invoke('update-note', note),
  deleteNote: (id) => ipcRenderer.invoke('delete-note', id),
  updateNotePos: (data) => ipcRenderer.invoke('update-note-pos', data),
  getToken: () => ipcRenderer.invoke('get-token'),
  setToken: (token) => ipcRenderer.invoke('set-token', token),
  getActiveWindow: () => ipcRenderer.invoke('get-active-window'),
  getOpenApps: () => ipcRenderer.invoke('get-open-apps'),
  onActiveWindowChanged: (callback) => {
    ipcRenderer.on('active-window-changed', (event, winData) => callback(winData));
  },
  setIgnoreMouseEvents: (ignore, options) => ipcRenderer.send('set-ignore-mouse-events', ignore, options),
});
