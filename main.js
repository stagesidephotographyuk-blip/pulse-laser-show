const { app, BrowserWindow, desktopCapturer } = require('electron');
const path = require('path');

async function getAudioStream() {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    fetchWindowIcons: false,
    thumbnailSize: { width: 1, height: 1 }
  });

  // Always pick the main monitor (first screen)
  const mainScreen = sources[0];

  return mainScreen.id;
}

async function createWindow() {
  const audioSourceId = await getAudioStream();

  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: [`--audioSource=${audioSourceId}`]
    }
  });

  win.loadFile('laser.html');
  win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
