const { ipcRenderer } = require('electron')
// Electron Renderer-process module

/*
    Renderer Process.

    virtual-keyboard에서
    Mouse wheel 입력을 Dial rotate 입력으로
    Mouse click 입력을 Button push 입력으로 전환하여 전송함.
*/

let dialBtn = document.querySelectorAll('.dialkeypad-dialgroup-element')
let keyBtn = document.querySelectorAll('.dialkeypad-buttongroup-element')
// 변수 정의

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
