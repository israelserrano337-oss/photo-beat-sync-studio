const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    convertToMp4: (data) => ipcRenderer.invoke('convert-to-mp4', data),
    isElectron: true
});