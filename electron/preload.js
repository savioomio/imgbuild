const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('imageAPI', {
  // 🚀 Smart Optimization
  smartOptimize: (imageData, fileName, isBase64 = false, quality = 80) => 
    ipcRenderer.invoke('smart-optimize', { imageData, fileName, isBase64, quality }),
  
  // 🔄 Convert to WebP
  convertToWebP: (imageData, fileName, isBase64 = false, quality = 85) => 
    ipcRenderer.invoke('convert-to-webp', { imageData, fileName, isBase64, quality }),
  
  // 🗜️ Compress
  compressImage: (imageData, fileName, isBase64 = false, quality = 80) => 
    ipcRenderer.invoke('compress-image', { imageData, fileName, isBase64, quality }),
  
  // 📐 Resize
  resizeImage: (imageData, fileName, isBase64 = false, width, height) => 
    ipcRenderer.invoke('resize-image', { imageData, fileName, isBase64, width, height }),
  
  // 💾 Save file
  saveFile: (base64Data, suggestedName, format) => 
    ipcRenderer.invoke('save-file', { base64Data, suggestedName, format }),

  // 📂 Select folder
  selectFolder: () => ipcRenderer.invoke('select-folder'),

  // 💾 Save direct
  saveDirect: (base64Data, folderPath, fileName) => 
    ipcRenderer.invoke('save-direct', { base64Data, folderPath, fileName }),

  // 📂 Open folder containing file
  openFolder: (filePath) => ipcRenderer.invoke('open-folder', filePath)
});

contextBridge.exposeInMainWorld('updaterAPI', {
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', (event, value) => callback(value)),
  onUpdateProgress: (callback) => ipcRenderer.on('update-progress', (event, value) => callback(value)),
  removeListeners: () => {
    ipcRenderer.removeAllListeners('update-status');
    ipcRenderer.removeAllListeners('update-progress');
  }
});
