// renderer 프로세스(웹 페이지)안에서
const { ipcRenderer } = require('electron')

console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // "pong"이 출력됩니다.

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg) // "pong"이 출력됩니다.
})
ipcRenderer.send('asynchronous-message', 'ping')

let dialBtn = document.querySelectorAll('.dialkeypad-dialgroup-element')
let keyBtn = document.querySelectorAll('.dialkeypad-buttongroup-element')
dialBtn.forEach(btn => {
  btn.addEventListener('click', (event) => {
    ipcRenderer.send('dial-click', {
      "index": event.target.id
    })
  })
  btn.addEventListener('mousewheel', (event) => {
    if (event.wheelDelta) delta = event.wheelDelta / 120
    ipcRenderer.send('dial-rotate', {
      "index": event.target.id,
      "value": delta
    })
  })
})
keyBtn.forEach(btn => {
  btn.addEventListener('click', (event) => {
    ipcRenderer.send('button-click', {
      "index": event.target.id
    })
  })
})
