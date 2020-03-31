const remote = require('electron').remote
const {BrowserWindow, screen} = remote
const path = require('path')

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