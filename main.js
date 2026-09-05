const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const ffmpegStatic = require('ffmpeg-static');
// Corrige la ruta para que apunte al binario fuera del asar empaquetado
const ffmpegPath = ffmpegStatic.replace('app.asar', 'app.asar.unpacked');
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 768,
        minWidth: 1024,
        minHeight: 720,
        title: 'PHOTO BEAT SYNC STUDIO',
        backgroundColor: '#050509',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: false
        }
    });

    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('convert-to-mp4', async (event, { webmBuffer, outputDuration }) => {
    const tempWebmPath = path.join(app.getPath('temp'), `temp_record_${Date.now()}.webm`);
    
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
        title: 'Guardar Vídeo MP4',
        defaultPath: path.join(app.getPath('desktop'), 'PHOTO_BEAT_SYNC_VIDEO.mp4'),
        filters: [{ name: 'Vídeo MP4', extensions: ['mp4'] }]
    });

    if (!filePath) return { success: false, cancelled: true };

    fs.writeFileSync(tempWebmPath, Buffer.from(webmBuffer));

    return new Promise((resolve) => {
        const ffmpegArgs = [
            '-y', '-i', tempWebmPath,
            '-t', outputDuration.toString(),
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22',
            '-pix_fmt', 'yuv420p', '-r', '30',
            '-c:a', 'aac', '-b:a', '192k',
            '-movflags', '+faststart', filePath
        ];

        const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

        ffmpegProcess.on('close', (code) => {
            try {
                if (fs.existsSync(tempWebmPath)) fs.unlinkSync(tempWebmPath);
            } catch (e) {}

            if (code === 0) {
                resolve({ success: true, filePath });
            } else {
                resolve({ success: false, error: `FFmpeg terminó con código ${code}` });
            }
        });

        ffmpegProcess.on('error', (err) => {
            resolve({ success: false, error: err.message });
        });
    });
});