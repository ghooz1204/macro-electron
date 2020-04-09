const glob = require('glob')
const path = require('path')
// Node.js module

const {
  app,
  BrowserWindow,
  BrowserView,
  screen
} = require('electron')
// Electron Main-process module

function createOverlay() {
  // Create the overlay window.
  let timer
  const modalPath = path.join('file://', __dirname, '/sections/windows/overlay.html')
  const oWidth = 600, oHeight = 250
  const oX = (screen.getPrimaryDisplay().workArea.width - oWidth) / 2
  const oY = screen.getPrimaryDisplay().workArea.height - oHeight;
  global.overlay = new BrowserWindow({
    width: oWidth, height: oHeight,
    x: oX, y: oY,
    alwaysOnTop: true,
    frame: false, transparent: true,
    title: "Invaiz Overlay",
    focusable: false, fullscreenable: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  // global.overlay.webContents.openDevTools()
  global.overlay.loadURL(modalPath)
  global.overlay.setIgnoreMouseEvents(true)
  global.overlay.on('show', () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      global.overlay.hide()
    }, 3000)
  })
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
  // win.webContents.openDevTools()
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
app.whenReady().then(createOverlay).then(createWindow)

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
})

function loadDemos () {
  const files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  files.forEach((file) => { require(file) })
}