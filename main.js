const { app, BrowserWindow } = require('electron')

const glob = require('glob')
const path = require('path')

// Speed up the mouse.

function createOverlay() {
  // Create the overlay window.
  const overlay = new BrowserWindow({
    width: 300, height: 300,
    alwaysOnTop: true,
    frame: false,
    title: "Invaiz Overlay",
    webPreferences: {
      nodeIntegration: true
    }
  })
  overlay.loadURL('overlay.html')
}

function createWindow () {
  // Create the browser window.
  loadDemos()
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    },
    show: false
  })
  // and load the index.html of the app.
  win.loadFile('index.html')
  // Open the DevTools.
  win.webContents.openDevTools()
  win.once('ready-to-show', () => {
    win.show() // BrowserWindow가 보여줄 상태가 됐을 때 창을 보여줌
  })
  win.webContents.on('did-finish-load', function () {
    global.PM.loadPresets() // webContents가 준비됐을 때 프리셋을 염
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow) // .then(createOverlay)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

app.on('browser-window-focus', (event, window) => {
  // console.log(window)
  console.log(BrowserWindow.getAllWindows())
})

function loadDemos () {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  files.forEach((file) => { require(file) })
}