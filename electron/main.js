const { app, BrowserWindow, ipcMain, dialog, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0f172a',
    icon: path.join(__dirname, '../icon.png'),
    autoHideMenuBar: false,
    show: true
  });

  // Remove menu bar completely
  Menu.setApplicationMenu(null);


  // Load app
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    setupAutoUpdater(); // Initialize auto updater
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('save-file', async (event, { base64Data, suggestedName, format }) => {
  try {
    const filters = [];
    if (format === 'webp') {
      filters.push({ name: 'WebP Image', extensions: ['webp'] });
    } else if (format === 'png') {
      filters.push({ name: 'PNG Image', extensions: ['png'] });
    } else {
      filters.push({ name: 'JPEG Image', extensions: ['jpg', 'jpeg'] });
    }
    filters.push({ name: 'All Files', extensions: ['*'] });

    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Salvar imagem processada',
      defaultPath: suggestedName,
      filters
    });

    if (result.canceled) {
      return { success: false, canceled: true };
    }

    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(result.filePath, buffer);

    return { success: true, filePath: result.filePath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('smart-optimize', async (event, { imageData, fileName, isBase64, quality = 80 }) => {
  try {
    let buffer;
    if (isBase64) {
      buffer = Buffer.from(imageData, 'base64');
    } else {
      buffer = fs.readFileSync(imageData); // imageData is filePath
    }
    
    const ext = path.extname(fileName).toLowerCase();
    const name = path.basename(fileName, ext);
    
    // Try original format with compression
    let originalCompressed;
    
    if (ext === '.png') {
      originalCompressed = await sharp(buffer)
        .png({ quality, compressionLevel: 9 })
        .toBuffer();
    } else {
      originalCompressed = await sharp(buffer)
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
    }
    
    // Try WebP
    const webpBuffer = await sharp(buffer)
      .webp({ quality, effort: 6 })
      .toBuffer();
    
    // Compare sizes and pick smallest
    const originalSize = buffer.length;
    const compressedSize = originalCompressed.length;
    const webpSize = webpBuffer.length;
    
    let finalBuffer, finalExt, finalSize;
    
    if (webpSize <= compressedSize && webpSize < originalSize) {
      finalBuffer = webpBuffer;
      finalExt = '.webp';
      finalSize = webpSize;
    } else if (compressedSize < originalSize) {
      finalBuffer = originalCompressed;
      finalExt = ext;
      finalSize = compressedSize;
    } else {
      finalBuffer = buffer;
      finalExt = ext;
      finalSize = originalSize;
    }
    
    return {
      success: true,
      base64: finalBuffer.toString('base64'),
      format: finalExt.replace('.', ''),
      suggestedName: `${name}_optimized${finalExt}`,
      originalSize,
      finalSize,
      savings: Math.round((1 - finalSize / originalSize) * 100)
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('convert-to-webp', async (event, { imageData, fileName, isBase64, quality = 85 }) => {
  try {
    let buffer;
    if (isBase64) {
      buffer = Buffer.from(imageData, 'base64');
    } else {
      buffer = fs.readFileSync(imageData);
    }
    
    const name = path.basename(fileName, path.extname(fileName));
    
    const webpBuffer = await sharp(buffer)
      .webp({ quality })
      .toBuffer();
    
    return {
      success: true,
      base64: webpBuffer.toString('base64'),
      format: 'webp',
      suggestedName: `${name}.webp`,
      originalSize: buffer.length,
      finalSize: webpBuffer.length,
      savings: Math.round((1 - webpBuffer.length / buffer.length) * 100)
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('compress-image', async (event, { imageData, fileName, isBase64, quality = 80 }) => {
  try {
    let buffer;
    if (isBase64) {
      buffer = Buffer.from(imageData, 'base64');
    } else {
      buffer = fs.readFileSync(imageData);
    }
    
    const ext = path.extname(fileName).toLowerCase();
    const name = path.basename(fileName, ext);
    
    let compressedBuffer;
    let outputExt = ext;
    
    if (ext === '.png') {
      compressedBuffer = await sharp(buffer)
        .png({ quality, compressionLevel: 9 })
        .toBuffer();
    } else if (ext === '.webp') {
      compressedBuffer = await sharp(buffer)
        .webp({ quality, effort: 6 })
        .toBuffer();
    } else {
      compressedBuffer = await sharp(buffer)
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
      outputExt = '.jpg';
    }
    
    return {
      success: true,
      base64: compressedBuffer.toString('base64'),
      format: outputExt.replace('.', ''),
      suggestedName: `${name}_compressed${outputExt}`,
      originalSize: buffer.length,
      finalSize: compressedBuffer.length,
      savings: Math.round((1 - compressedBuffer.length / buffer.length) * 100)
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('resize-image', async (event, { imageData, fileName, isBase64, width, height }) => {
  try {
    let buffer;
    if (isBase64) {
      buffer = Buffer.from(imageData, 'base64');
    } else {
      buffer = fs.readFileSync(imageData);
    }
    
    const ext = path.extname(fileName).toLowerCase();
    const name = path.basename(fileName, ext);
    
    const resizeOptions = {};
    if (width) resizeOptions.width = width;
    if (height) resizeOptions.height = height;
    resizeOptions.fit = 'inside';
    resizeOptions.withoutEnlargement = true;
    
    const resizedBuffer = await sharp(buffer)
      .resize(resizeOptions)
      .toBuffer();
    
    const metadata = await sharp(resizedBuffer).metadata();
    
    return {
      success: true,
      base64: resizedBuffer.toString('base64'),
      format: ext.replace('.', ''),
      suggestedName: `${name}_${width || height}${ext}`,
      originalSize: buffer.length,
      finalSize: resizedBuffer.length,
      newWidth: metadata.width,
      newHeight: metadata.height
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('save-direct', async (event, { base64Data, folderPath, fileName }) => {
  try {
    const buffer = Buffer.from(base64Data, 'base64');
    const fullPath = path.join(folderPath, fileName);
    fs.writeFileSync(fullPath, buffer);
    return { success: true, path: fullPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Open folder containing the file
ipcMain.handle('open-folder', async (event, filePath) => {
  try {
    shell.showItemInFolder(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ===== AUTO UPDATER =====
const { autoUpdater } = require('electron-updater');

// Configure autoUpdater
autoUpdater.autoDownload = false; // Let user decide when to download
autoUpdater.autoInstallOnAppQuit = true;

function setupAutoUpdater() {
  if (!mainWindow) return;

  // Check for updates immediately when app starts
  if (app.isPackaged) {
    autoUpdater.checkForUpdates();
  }

  // Events
  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('update-status', { status: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update-status', { status: 'available', info });
  });

  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update-status', { status: 'not-available' });
  });

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('update-status', { status: 'error', error: err.message });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('update-progress', progressObj);
  });

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('update-status', { status: 'downloaded', info });
  });
}

// IPC handlers for updater
ipcMain.handle('check-for-updates', () => {
  if (app.isPackaged) {
    autoUpdater.checkForUpdates();
  }
});

ipcMain.handle('download-update', () => {
  autoUpdater.downloadUpdate();
});

ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall();
});

// Add setup to createWindow
const originalCreateWindow = createWindow;
// We hook into the window creation to setup listeners once window is ready slightly differently below
// Instead, let's just make sure we call setupAutoUpdater inside createWindow or after showing it

