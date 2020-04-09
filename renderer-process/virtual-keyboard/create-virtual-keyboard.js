const path = require('path')
// Node.js module

const remote = require('electron').remote
const {BrowserWindow, screen} = remote
// Electron Renderer-process module

/*
    Renderer Process.

    Main-Browser Window에서
    virtual-keyboard Browser Window를 생성함.
*/

const newWindowBtn = document.getElementById('new-virtual')
newWindowBtn.addEventListener('click', (event) => {
    const modalPath = path.join('file://', __dirname, '../../sections/windows/virtual-keyboard.html')
    const vWidth = 490, vHeight = 230
    const vX = screen.getPrimaryDisplay().workArea.width - vWidth, vY = 0;
    let win = new BrowserWindow({ 
        width: vWidth, height: vHeight,
        x: vX, y: vY,
        parent: remote.getCurrentWindow(),
        useContentSize: true,
        focusable: false,
        alwaysOnTop: true,
        title: 'INVAIZ Virtual-Keyboard',
        // frame: false,
        webPreferences: {
          nodeIntegration: true
        }
    })
    win.on('close', () => { win = null })
    win.loadURL(modalPath)
    win.show()
})